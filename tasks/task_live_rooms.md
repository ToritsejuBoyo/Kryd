# task_live_rooms.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_09_community_feed, task_messaging
> Build text-based rooms first — audio/video comes in Phase 2
> This is a significant feature — run as a dedicated agent

---

## Goal
Build text-based Live Rooms for the Kryd community — dedicated real-time chat spaces like Discord channels. Users can create a room, others join, and everyone chats in real-time via Supabase realtime. Audio and video rooms come in Phase 2 (using Agora or Daily.co). For MVP, rooms are text-based but feel live because messages appear instantly.

---

## Why text rooms first
Audio/video requires WebRTC infrastructure (Agora, Daily.co, Livekit) which adds significant complexity, cost, and setup time. Text-based rooms using Supabase realtime subscriptions can be built in a day and deliver 80% of the value. Users can have real live conversations — they just type instead of speak. This is exactly how Discord started.

---

## Database — run in Supabase first

```sql
-- Rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  topic text,
  -- topic: 'IT Support' | 'Cloud' | 'Security' | 'Helpdesk' | 'Career' | 'Hiring & Projects' | 'General'
  created_by uuid REFERENCES auth.users NOT NULL,
  is_live boolean DEFAULT true,
  is_private boolean DEFAULT false,
  max_members int DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Room members (who has joined)
CREATE TABLE room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_host boolean DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Room messages
CREATE TABLE room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable realtime on room_messages and room_members
-- Do this in Supabase Dashboard → Database → Replication
```

```sql
-- RLS policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read rooms"
ON rooms FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create rooms"
ON rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Hosts can update rooms"
ON rooms FOR UPDATE USING (auth.uid() = created_by);

ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see room members"
ON room_members FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join rooms"
ON room_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
ON room_members FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members can read messages"
ON room_messages FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Room members can send messages"
ON room_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  room_id IN (
    SELECT room_id FROM room_members WHERE user_id = auth.uid()
  )
);
```

---

## Seed 3 rooms

```sql
INSERT INTO rooms (title, description, topic, created_by, is_live) VALUES
('IT Support Live Help', 'Real-time help for IT support issues. Ask questions and get instant answers from the community.', 'IT Support', '00000000-0000-0000-0000-000000000001', true),
('Cloud & DevOps Talk', 'Live discussions on AWS, Azure, GCP, and DevOps practices. Share what you are working on.', 'Cloud', '00000000-0000-0000-0000-000000000001', true),
('Cybersecurity Hangout', 'Talk security, share threats, discuss certifications, and stay updated on the latest vulnerabilities.', 'Security', '00000000-0000-0000-0000-000000000001', true);
```

Note: use the same NULL user_id fix as community_posts if foreign key error occurs.

---

## Screens to build

### Screen 1 — Rooms listing (inside Community tab)
This is the "Rooms" tab already visible in the community page.

When the Rooms tab is active inside Community, show:

**Header:**
```
Live Rooms                    [+ Create Room]
Real-time conversations with IT professionals
```

**Active rooms list:**
Each room card shows:
- 🔴 LIVE badge (pulsing red dot)
- Room title (bold)
- Topic badge (coloured pill)
- Description (1 line truncated)
- Member count: "128 members online"
- Host avatar and name: "Hosted by Alex O."
- [Join Room] button

**Ended rooms section** (below active rooms):
Show rooms that ended in the last 24 hours with a "Ended" gray badge.
Show message count as a record: "247 messages exchanged."

**Empty state:**
"No live rooms right now. Be the first to start a conversation."
Large [Start a Room] button.

---

### Screen 2 — Room detail / chat screen
File: `/app/room/[id].tsx`

Navigate here by tapping Join Room on any room card.

**Header:**
- Back button
- 🔴 LIVE · Room title
- Member count ("128 online")
- Three-dot menu → Leave Room, Report Room (for non-hosts) or End Room (for host)

**Members strip (horizontal scroll, below header):**
Show small avatars of current room members:
```
[YU] [AO] [JK] [EM] +124 more
```
Each avatar shows online (green dot) since they are in the room.
Tapping an avatar shows their profile card popup (same as community feed).

**Messages area (flex-1, scrollable):**
Real-time message bubbles:

System messages (centered, secondary colour):
```
── Alex O. joined the room ──
── Jane K. left the room ──
```

User messages (left-aligned, everyone's messages look the same — this is a group chat not a DM):
```
[AO]  Alex Okafor · New Talent
      How do I configure VLAN trunking on a Cisco switch?
      2:34 PM

[JK]  Jane Kim · Verified Expert
      You need to set the port to trunk mode first. Use:
      switchport mode trunk
      Then configure allowed VLANs.
      2:35 PM
```

Current user's messages: same left-aligned style but with a subtle lime green left border on the bubble to distinguish their own messages.

**Message input bar (sticky at bottom):**
- Text input: "Say something..."
- Send button: lime green
- KeyboardAvoidingView

**Realtime subscription:**
```ts
useEffect(() => {
  // Join room — insert into room_members
  supabase.from('room_members').insert({
    room_id: roomId,
    user_id: currentUserId,
    is_host: false
  })

  // Subscribe to new messages
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'room_messages',
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new])
      // Auto scroll to bottom
    })
    .subscribe()

  return () => {
    // Leave room on unmount
    supabase.from('room_members').delete()
      .eq('room_id', roomId)
      .eq('user_id', currentUserId)
    
    supabase.removeChannel(channel)
  }
}, [roomId])
```

**Typing indicator:**
When any user is typing, show "Alex is typing..." below the messages area.
Use Supabase realtime presence for this:
```ts
channel.track({ user_id: currentUserId, is_typing: true })
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  // Show typing indicators for other users
})
```

---

### Screen 3 — Create a Room
File: `/app/room/create.tsx`

Accessible from the [+ Create Room] button in the rooms listing.

**Form fields:**
1. Room title — text input, required, max 60 chars
2. Topic — dropdown: IT Support / Cloud / Security / Helpdesk / Career / Hiring & Projects / General
3. Description — text input, optional, max 120 chars
4. Private room — toggle (private rooms require an invite link to join)

**Create Room button:**
- Inserts into rooms table with `is_live: true` and `created_by: currentUser.id`
- Inserts into room_members as host with `is_host: true`
- Navigates immediately to the room chat screen
- Awards +20 points for creating a room (insert into point_transactions)

**Host controls inside the room:**
When the current user is the host (is_host = true in room_members), show extra controls in the three-dot menu:
- Pin a message (Phase 2)
- Remove a member (Phase 2)
- End Room → sets `rooms.is_live = false` and `ended_at = now()`

---

## Room member count on community page
The rooms listed in the right sidebar of the Community page show member counts. These should be live counts from the room_members table:

```ts
const { count } = await supabase
  .from('room_members')
  .select('*', { count: 'exact' })
  .eq('room_id', roomId)
```

Subscribe to room_members changes so the count updates in real time as people join and leave.

---

## Points for room activity
- Creating a room: +20 points
- Sending a message in a room: +2 points (max 10 messages rewarded per room per day to prevent farming)

---

## Phase 2 note (do not build now)
When audio/video rooms are added in Phase 2 using Agora or Daily.co:
- Add a `room_type: 'text' | 'audio' | 'video'` field to the rooms table
- Text rooms stay exactly as built here
- Audio/video rooms use the Agora SDK for WebRTC
- The current room UI becomes the text chat sidebar alongside the audio/video feed

---

## Done when
- Rooms tab in Community shows list of active rooms with live member counts
- Member counts update in real time as users join and leave
- Joining a room enters the chat screen and inserts into room_members
- Messages appear instantly for all room members via Supabase realtime
- Leaving the screen removes the user from room_members
- System messages show when users join and leave
- Create a Room form creates room and immediately enters chat
- Host can end the room (sets is_live to false)
- Ended rooms show in a separate section with message count
- Typing indicator shows when other users are typing
- Room creation awards +20 points
- Messaging in a room awards +2 points (max 10 per room per day)
- Room member avatars show in horizontal strip at top of chat
- Tapping a member avatar shows the profile card popup
