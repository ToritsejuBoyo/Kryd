# task_12_polish.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 12 | Depends on: all previous tasks | Run as ONE focused agent

---

## Goal
Polish the entire app so it feels like a real product, not a prototype. This task is about edge cases, empty states, and micro-interactions — not new features.

---

## 1. Splash screen
In `app.json`:
- Set `backgroundColor` to `#0B2D2C`
- Set the splash image to the Kryd logo asset (centred)
- Set `resizeMode` to `contain`

The splash screen should show for at least 2 seconds before the auth check completes.

---

## 2. Loading skeletons
On every screen that fetches from Supabase, while `isLoading = true` show shimmer skeleton boxes:

- **Dashboard** — skeleton for stats row (3 gray boxes), skeleton for continue learning card, skeleton for quick actions grid
- **Learn tab** — skeleton for 3 course card shapes
- **Jobs tab** — skeleton for 3 job card shapes
- **Community tab** — skeleton for 3 post card shapes
- **Profile** — skeleton for stats row and avatar

Use a simple shimmer effect: gray box with animated opacity cycling 0.3 → 0.7 → 0.3 using `Animated.loop`.

---

## 3. Empty states
Add a meaningful empty state to every screen that can have no content:

| Screen | Condition | Message | CTA |
|--------|-----------|---------|-----|
| Dashboard — Continue Learning | No enrolled courses | "Start your first course to earn points" | Browse Courses → Learn tab |
| Learn tab | Search returns no results | "No courses match your search" | Clear search |
| Jobs tab | Filter returns no results | "No jobs match this filter" | Clear filter |
| Community feed | No posts in a group | "Be the first to post in this group" | + Create Post |
| Profile — My Applications | No applications | "No applications yet — browse open roles" | Browse Jobs |
| Wallet — Transaction history | No transactions | "No transactions yet — start earning points" | Browse Courses |

---

## 4. Error handling
Audit every Supabase call in the app. Every single one must:
- Be wrapped in try/catch
- Show a user-friendly toast on error — never a raw error or a silent failure
- Have a retry option where appropriate

Friendly error messages to use:
- Auth errors → "Something went wrong signing in. Please check your details and try again."
- Network errors → "Could not connect. Please check your internet and try again."
- Data errors → "Could not load this content. Pull down to refresh."

---

## 5. Keyboard handling
Add `KeyboardAvoidingView` to every screen with a text input:
- Sign Up
- Login
- Create Post
- Post a Job
- Edit Profile (in the modal)

On iOS use `behavior="padding"`. On Android use `behavior="height"`.
The submit button must always be visible above the keyboard.

---

## 6. Pull-to-refresh
Add `RefreshControl` to the FlatList on:
- Community feed
- Jobs listing

On pull, re-fetch the data from Supabase and reset the list.

---

## 7. Double-tap prevention
On all submit and action buttons (Apply, Enrol, Post, Convert, Sign Up):
- Disable the button immediately on first tap
- Re-enable only if the action fails
- This prevents duplicate Supabase inserts

---

## 8. Small micro-interactions
- Heart like button: animate scale 1 → 1.3 → 1 on tap (use `Animated.spring`)
- Points badge on Dashboard: when points increase, animate the number counting up over 600ms
- Module completion: after tapping "Mark as Complete", show a brief confetti or green burst animation before the celebration screen

---

## Done when
- Every screen shows a skeleton while loading and never a blank white flash
- Every screen with no data shows a meaningful empty state with a CTA
- No screen can crash from a Supabase error — all are caught with friendly messages
- All forms keep the submit button above the keyboard on both iOS and Android
- Double-tapping Apply, Enrol, or Post never creates duplicate database rows
