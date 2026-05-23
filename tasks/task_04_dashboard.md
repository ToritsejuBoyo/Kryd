# task_04_dashboard.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 4 | Depends on: task_01, task_02, task_03

---

## Goal
Build the Dashboard home screen — the first thing users see after logging in. It must feel alive, personal, and rewarding.

---

## File
`/app/(tabs)/index.tsx`

---

## Layout (top to bottom)

### Header
- Left: Greeting text — "Good morning, [first name]" or "Good afternoon" based on time of day
- Left sub: "Your IT career dashboard"
- Right: Avatar circle showing user initials (e.g. "AO"), background `#1D9E75`
- Below avatar: Points badge — small pill showing `1,240 pts` with a clock icon

Fetch user data from Zustand store. If store is empty, fetch from Supabase `profiles` and hydrate the store.

### Stats row
3 equal-width cards side by side:
- **Points** — `profiles.points`
- **Active Courses** — count from `user_courses` where `progress_percent < 100`
- **Earned** — sum of positive `point_transactions` amounts, displayed as `$` equivalent (1 coin = $0.10 for display)

### Continue Learning card
Query `user_courses` joined with `courses`, ordered by `updated_at` descending, take the first row.

Show:
- Course title
- Progress text: "Module 2 of 3"  (calculate: `Math.ceil(progress_percent / 33)` of 3)
- Progress bar filled to `progress_percent`
- **Resume** button — navigates to `/course/[id]`

If no enrolled courses: show empty state card — "Start your first course to earn points" with a **Browse Courses** button navigating to the Learn tab.

### Quick Actions grid (2 columns × 2 rows)
| Card | Icon | Action |
|------|------|--------|
| Browse Jobs | briefcase | navigate to Jobs tab |
| Daily Challenge | trophy | open challenge modal |
| Community | users | navigate to Community tab |
| Withdraw Coins | dollar-sign | open coming soon modal |

---

## Daily Challenge Modal

Trigger: tapping "Daily Challenge" quick action card.

Logic:
1. Check `point_transactions` for a row with `reason = 'daily_challenge'` and `created_at` date = today
2. If found → show "Already completed" state with "Come back tomorrow"
3. If not found → show the question

Get today's question from the rotating list in KRYD_SPEC.md (index by `new Date().getDay()`).

Show:
- Question text
- 3 answer buttons (one correct, two wrong — hardcode per question)
- On correct answer:
  - Call `addPoints(userId, 50, 'daily_challenge')` from `lib/db.ts`
  - Update Zustand store points
  - Refresh the stats row
  - Show celebration: green checkmark animation + "You earned +50 points!"
- On wrong answer:
  - Show the correct answer highlighted in red
  - "Better luck tomorrow!" message
  - Close button

---

## Withdraw Coins Modal
Simple modal:
- Shows current coin balance
- Text: "Withdrawal options are coming soon. Your coins are safely tracked."
- A **Got it** button to close

---

## Done when
- Dashboard shows real data from Supabase (name, points, active courses)
- Daily challenge awards +50 points and updates the stats card in real time
- Daily challenge cannot be completed twice on the same day
- All quick action cards navigate to the correct destinations
- Loading skeleton shows while data fetches
- Empty state shows if user has no active courses
