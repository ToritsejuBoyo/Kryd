# task_09_community_feed.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 9 | Depends on: task_02, task_03 | Parallel: can run alongside task_10

---

## Goal
Build the Community Hub feed — the social layer of Kryd where IT professionals share, ask, and grow together.

---

## File
`/app/(tabs)/community.tsx`

---

## Layout (top to bottom)

### Header
- Title: "Community"
- Right: bell icon → navigates to `/notifications`
- Below header: two tabs in a row — **Feed** and **Leaderboard** (build both in this task)

### Group filter tabs (Feed tab only)
Horizontal scrollable row:
`All` · `IT Support` · `Cloud` · `Security` · `Helpdesk` · `Career`

### Post feed
FlatList of community post cards, ordered by `created_at` descending.

**Each post card:**

Top row:
- Avatar circle — user initials on a colour derived from their name (simple hash: `name.charCodeAt(0) % 6` to pick from 6 preset colours)
- Name (bold) and role badge
- Group badge — coloured pill (IT Support = blue, Cloud = teal, Security = amber, Helpdesk = gray, Career = green)
- Time posted — relative format ("2h ago", "3d ago")

Content:
- Post text — truncated to 3 lines with a **"Read more"** toggle that expands inline

Bottom row:
- Heart icon + like count — tapping increments `likes_count` by 1 in Supabase and animates heart to filled (red). Tapping again decrements (unlike). Track liked state in component state.
- Comment icon + count (static "0" for MVP — no comments feature yet)

**Pull-to-refresh:** RefreshControl on the FlatList re-fetches posts from Supabase.

### Floating action button
Bottom-right corner: round "+" button in lime green `#CCDF1A`.
Navigates to `/community/create`.

### Leaderboard tab
Switch to this view when user taps "Leaderboard".

Fetch top 10 profiles ordered by `points` descending.

Each row shows:
- Rank number (1, 2, 3... styled: 1st in gold, 2nd in silver, 3rd in bronze)
- Avatar with initials
- Full name and role badge
- Points (right-aligned, bold)

Highlight the current user's row with a lime green left border (3px) even if they are outside the top 10 — in that case, add their row at the bottom with a separator and their actual rank.

---

## Data fetching
1. Fetch `community_posts` joined with `profiles` for poster info
2. Fetch `profiles` top 10 for leaderboard
3. Refresh both when switching between Feed and Leaderboard tabs

---

## Done when
- All 6 seed posts appear in the feed with correct group badges and avatars
- Like button increments/decrements likes_count in Supabase
- Group filter tabs filter the feed correctly
- Pull-to-refresh reloads posts
- Leaderboard shows top 10 users with gold/silver/bronze ranks
- Current user's row is highlighted on the leaderboard
- Floating + button navigates to create post screen
