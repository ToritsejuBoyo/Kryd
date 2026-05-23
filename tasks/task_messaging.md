# task_messaging.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_03_auth, task_09_community_feed
> This is a significant feature — run as a dedicated agent, do not combine with other tasks

---

## Goal
Build a complete in-app messaging system for Kryd with spam protection, connection requests, and community interaction unlocks. Users can message each other after a job interaction, community engagement, or accepted connection request.

---

## Database — run these in Supabase first

```sql
-- Conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid REFERENCES auth.users NOT NULL,
  participant_two uuid REFERENCES auth.users NOT NULL,
  job_id uuid REFERENCES jobs,
  context text DEFAULT 'direct',
  -- context: 'job' | 'direct' | 'connection'
  status text DEFAULT 'active',
  -- status: 'active' | 'blocked' | 'request_pending'
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  contains_url boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Connection requests table
CREATE TABLE connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'pending',
  -- status: 'pending' | 'accepted' | 'declined' | 'expired'
  message text,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '14 days'),
  UNIQUE(sender_id, receiver_id)
);

-- Connections table (established relationships)
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one uuid REFERENCES auth.users NOT NULL,
  user_two uuid REFERENCES auth.users NOT NULL,
  connected_at timestamptz DEFAULT now(),
  UNIQUE(user_one, user_two)
);

-- Blocked users table
CREATE TABLE blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES auth.users NOT NULL,
  blocked_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Add connect request count to profiles for rate limiting
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS connect_requests_sent_this_week int DEFAULT 0,
ADD COLUMN IF NOT EXISTS connect_requests_reset_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS message_requests_folder_count int DEFAULT 0;
```

---

## RLS Policies for messaging tables

```sql
-- Conversations: users can only see their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own conversations"
ON conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Messages: users can only see messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations
    WHERE participant_one = auth.uid()
    OR participant_two = auth.uid()
  )
);

CREATE POLICY "Users send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Connection requests
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own requests"
ON connection_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users send requests"
ON connection_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update status"
ON connection_requests FOR UPDATE
USING (auth.uid() = receiver_id);

-- Connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connections"
ON connections FOR SELECT
USING (auth.uid() = user_one OR auth.uid() = user_two);

-- Blocked users
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blocks"
ON blocked_users FOR ALL
USING (auth.uid() = blocker_id);
```

---

## Enable Supabase Realtime on messages table

In Supabase dashboard go to Database → Replication → enable realtime for the messages table. This makes new messages appear instantly without refreshing.

In code subscribe to new messages:
```ts
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

---

## Messaging rules — enforce these in code

### Who can message whom

Build a helper function `canMessage(currentUserId, targetUserId)` that returns:
```ts
{
  canMessage: boolean,
  reason: 'job_interaction' | 'connected' | 'community_interaction' | 'blocked' | 'not_connected' | 'request_pending'
}
```

**canMessage returns true if:**
- They have a job in common (current user applied to target's job or vice versa)
- They are in the connections table together
- Target user has liked or replied to current user's community post (or vice versa)

**canMessage returns false if:**
- Either user has blocked the other
- A connection request is already pending between them
- No prior interaction exists (they must send a connect request first)

---

### Spam controls to enforce

**Rule 1 — No URLs in first message**
```ts
const containsUrl = /https?:\/\/|www\./i.test(messageContent)
if (containsUrl && isFirstMessage) {
  throw new Error('Links are not allowed in your first message. Build trust first.')
}
```

**Rule 2 — Message rate limiting (10 unanswered messages)**
Before allowing a new message, count how many consecutive messages the sender has sent without a reply:
```ts
const unansweredCount = messages
  .filter(m => m.sender_id === currentUserId)
  .reduceRight((count, m, i, arr) => {
    if (arr[i + 1]?.sender_id !== currentUserId) return count
    return count + 1
  }, 0)

if (unansweredCount >= 10) {
  throw new Error('Waiting for a reply before you can send more messages.')
}
```

**Rule 3 — Weekly connect request limit**
Free users: 5 connect requests per week
Pro users: 20 connect requests per week
```ts
// Check and reset weekly counter
const profile = await getProfile(userId)
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
if (new Date(profile.connect_requests_reset_at) < oneWeekAgo) {
  // Reset counter
  await supabase.from('profiles').update({
    connect_requests_sent_this_week: 0,
    connect_requests_reset_at: new Date().toISOString()
  }).eq('user_id', userId)
}

const limit = profile.is_pro ? 20 : 5
if (profile.connect_requests_sent_this_week >= limit) {
  throw new Error(`You have reached your weekly connection limit. ${profile.is_pro ? '' : 'Upgrade to Pro for more.'}`)
}
```

**Rule 4 — 30 day cooldown after declined request**
If a user's connection request was declined, they cannot send another to the same person for 30 days:
```ts
const existingRequest = await supabase
  .from('connection_requests')
  .select('*')
  .eq('sender_id', currentUserId)
  .eq('receiver_id', targetUserId)
  .eq('status', 'declined')
  .single()

if (existingRequest.data) {
  const declinedAt = new Date(existingRequest.data.responded_at)
  const thirtyDaysLater = new Date(declinedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  if (new Date() < thirtyDaysLater) {
    throw new Error('You cannot send another request to this person yet.')
  }
}
```

---

## Screens to build

### Screen 1 — Messages tab / inbox
File: `/app/messages.tsx`

Add a Messages icon to the top navigation bar next to the bell icon.
Show an unread count badge when there are unread messages.

**Layout (top to bottom):**

Header:
- Title: "Messages"
- Compose icon (pencil) top right → navigates to new message search

Two tabs:
- **Inbox** — accepted conversations
- **Requests** — pending connection requests and message requests

**Inbox tab:**
List of conversations ordered by last_message_at descending.

Each conversation row shows:
- Avatar with initials (or profile photo)
- Name and tier badge
- Last message preview (truncated to 1 line)
- Time of last message (relative — "2h ago")
- Unread count badge (green circle with number) if unread messages exist
- Job reference pill if context = 'job' (e.g. "Re: Network Setup Project")

Tapping a row navigates to the conversation screen.

**Requests tab:**
List of pending connection requests received.

Each request row shows:
- Avatar and name of sender
- Their tier badge and role
- Short message they included with the request (if any)
- Time sent
- Two buttons: **Accept** and **Decline**

On Accept:
- Update connection_requests status to 'accepted'
- Insert into connections table
- Create a conversation row
- Navigate to the new conversation

On Decline:
- Update status to 'declined'
- Set responded_at to now
- Remove from requests list
- No notification sent to requester

Empty state inbox: "No messages yet. Connect with IT professionals in the community or apply to jobs to start conversations."
Empty state requests: "No pending requests."

---

### Screen 2 — Conversation screen
File: `/app/conversation/[id].tsx`

**Header:**
- Back button
- Other user's avatar and name
- Their online status dot (green = active in last 5 min, gray = offline)
- Three-dot menu → Report, Block, View Profile

**If context = 'job', show job banner below header:**
```
📋 Network Setup & Config — $800 · StartupXYZ
```
Tapping the banner navigates to the job detail screen.

**Messages area:**
ScrollView with messages in chronological order.
Auto-scrolls to the bottom on new message.

User's messages:
- Right-aligned bubble
- Background: `#CCDF1A` (lime green)
- Text: `#0B2D2C` (dark)
- Timestamp below (small, secondary colour)

Other person's messages:
- Left-aligned bubble
- Background: `colors.cardSurface`
- Text: `colors.textPrimary`
- Timestamp below

Show date separators when messages span multiple days:
"Today", "Yesterday", "May 15, 2026"

**Typing indicator:**
When the other person is typing, show three animated dots in a left-aligned bubble. Implement with Supabase realtime presence.

**Unanswered message limit state:**
When the sender hits 10 unanswered messages, replace the input with:
"You have sent 10 messages without a reply. Waiting for [Name] to respond before you can send more."

**Input bar (sticky at bottom):**
- Text input with placeholder "Type a message..."
- Send button (lime green arrow icon)
- Disabled when empty
- If first message in conversation, show a small notice below input:
  "🔒 Links are not allowed in first messages"
- KeyboardAvoidingView so input stays above keyboard

**Report and Block flow:**
Three-dot menu → Report:
- Show a report reason selector: Spam, Harassment, Inappropriate content, Fake account, Other
- Submit sends a flag to the notifications table for admin review
- Toast: "Report submitted. We will review this account."

Three-dot menu → Block:
- Confirmation modal: "Block [Name]? They will not be able to message or connect with you."
- On confirm: insert into blocked_users table
- Remove conversation from inbox
- Toast: "You have blocked [Name]."

---

### Screen 3 — New message / user search
File: `/app/messages/new.tsx`

Accessed via the compose icon in the messages header.

**Search bar:**
Searches profiles by full_name.
Shows results as user rows with avatar, name, tier badge, role, and a message or connect button.

**Button logic based on relationship:**

| Relationship | Button shown |
|---|---|
| Connected or job interaction | "Message" → opens/creates conversation |
| Community interaction exists | "Message" → opens/creates conversation |
| No prior interaction | "Connect" → sends connection request |
| Request already pending | "Request sent" (disabled) |
| Blocked | Not shown in results |

---

### Screen 4 — Community profile card popup
When a user taps any avatar or name in the community feed, show a bottom sheet popup:

**Profile card content:**
- Avatar (large, 56px)
- Full name and tier badge
- Role and country
- Bio snippet (2 lines max)
- Top 3 skills as pill tags
- Stats row: Posts · Jobs completed · Points

**Action buttons (2 side by side):**
- "View Profile" → navigates to their full profile screen
- "Message" or "Connect" → based on canMessage() result

**If canMessage = true:** "Message" button opens or creates a conversation directly.

**If canMessage = false (no prior interaction):** "Connect" button opens a mini modal:
```
Connect with [Name]
Send a personal note (optional, max 120 chars)
[text input]
[Send Request]  [Cancel]
```
Personal note becomes the first message preview in their Requests tab.

**If request already pending:** Show "Request sent ✓" in gray (disabled).

This popup appears on:
- Tapping a user's name in the community feed
- Tapping a user's name in the leaderboard
- Tapping a freelancer recommendation card on the client dashboard

---

## Navigation — where Messages lives

Add Messages to the top navigation bar between the bell icon and the user avatar.
Icon: chat bubble outline icon.
Show unread badge when `unread_count > 0`.

Subscribe to realtime changes on messages table filtered to current user's conversations so the badge updates live without refreshing.

---

## Notification integration

When a user receives a new message, insert into the notifications table:
```ts
{
  user_id: receiverId,
  message: `${senderName} sent you a message`,
  type: 'new_message'
}
```

When a user receives a connection request:
```ts
{
  user_id: receiverId,
  message: `${senderName} wants to connect with you on Kryd`,
  type: 'connection_request'
}
```

---

## Done when
- Messages icon in top nav shows unread count badge
- Inbox shows all conversations ordered by most recent
- Requests tab shows pending connection requests with Accept/Decline
- Conversation screen shows real-time messages (no refresh needed)
- New messages appear instantly via Supabase realtime subscription
- User's messages right-aligned lime green, other person's left-aligned
- Unanswered message limit stops sending at 10 consecutive messages
- First message blocks URLs with a friendly error
- Weekly connect request limit enforced (5 free, 20 Pro)
- 30-day cooldown after declined request enforced
- Report flow submits a flag for admin review
- Block removes conversation and prevents future contact
- Community profile card popup shows on every user avatar tap in feed and leaderboard
- Connect button on profile card sends a request with optional note
- Message button on profile card opens conversation directly if relationship exists
- canMessage() helper correctly evaluates all relationship types
- Job-context conversations show the job reference banner
