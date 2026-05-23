# task_10_community_post_profile.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 10 | Depends on: task_09 | Parallel: can run alongside task_09

---

## Goal
Build two screens: the Create Post screen (where users contribute to the community) and the Profile screen (the user's personal hub).

---

## Screen 1 — Create Post
**File:** `/app/community/create.tsx`

### Layout

Header:
- Back button (left)
- Title: "New Post"
- **Post** button (right, lime green, disabled until valid)

Group selector:
- Label: "Post to"
- Horizontal pill row: IT Support · Cloud · Security · Helpdesk · Career
- One must be selected before posting (highlight selected in lime green)
- Default: none selected

Text input:
- Large multiline input, placeholder: "Share something with the IT community..."
- Minimum 20 characters — show inline error if under
- Maximum 500 characters — show live character counter ("183 / 500") below input, turns red when under 50 remaining

### On submit (tapping Post button):
1. Validate: group selected and content ≥ 20 characters
2. Insert into `community_posts`: `{ user_id, group_name, content }`
3. Call `addPoints(userId, 10, 'community_post')` from `lib/db.ts`
4. Update Zustand store points
5. Navigate back to Community feed
6. The new post should appear at the top of the feed immediately

### Keyboard behaviour
Wrap in `KeyboardAvoidingView` — the Post button must always be visible above the keyboard.

---

## Screen 2 — Profile
**File:** `/app/profile.tsx`

Accessible via a person icon in the top-right header of the Community tab.

### Layout (top to bottom)

**Profile header:**
- Large avatar circle (60px) with initials and colour
- Full name (bold, large)
- Role badge
- Bio text (if set) — italic, secondary colour

**Stats row (3 cards):**
- Courses Completed — count from `user_courses` where `progress_percent = 100`
- Jobs Applied — count from `job_applications`
- Posts Made — count from `community_posts` where `user_id = current`

**Points & Coins row:**
- Points balance with a points icon
- Coins balance with a coin icon
- "View Wallet" link → navigates to `/wallet`

**Edit Profile button:**
Opens an inline modal with:
- Full Name text input (pre-filled)
- Bio text input (pre-filled, max 160 characters)
- **Save** button — updates `profiles` in Supabase and Zustand store

**My Applications section:**
List of jobs the user has applied to, from `job_applications` joined with `jobs`.
Each row: job title, company, status badge (Pending / Viewed / Rejected).
Empty state: "No applications yet — browse the Job Marketplace."

**Sign Out button (at the bottom, red ghost style):**
1. Call `supabase.auth.signOut()`
2. Clear Zustand store with `clearProfile()`
3. Navigate to `/(auth)/welcome`

---

## Done when
- Creating a post inserts into `community_posts` and awards +10 points
- New post appears at top of feed after posting
- Character counter works and Post button is disabled until valid
- Profile shows real stats pulled from Supabase
- Edit Profile saves changes to Supabase
- My Applications shows correct application history
- Sign Out clears the session and returns to the Welcome screen
