# task_notifications.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_03_auth, task_04_dashboard | Parallel: can run alongside task_ai_assistant.md

---

## Goal
Build the Notifications screen — where users see all platform activity alerts in one place. This screen makes users feel the platform is alive and working for them.

---

## File
`/app/notifications.tsx`

Accessible from:
- Bell icon in the Community tab header
- Bell icon in the Dashboard header (add one if not there)

---

## Database
Add a red dot badge on the bell icon when there are unread notifications. Query the `notifications` table and count rows where `is_read = false` for the current user.

---

## Layout (top to bottom)

### Header
- Back button (left)
- Title: "Notifications"
- "Mark all as read" text button (right) — on tap sets all `is_read = true` for current user in Supabase, removes all red dots

### Notification list
FlatList of all `notifications` rows for the current user, ordered by `created_at` descending.

**Each notification row:**
- Left: icon circle — colour and icon based on notification type (see types below)
- Middle: notification message text (bold first line, secondary details below)
- Right: relative time ("2h ago", "3d ago")
- Unread rows: slightly lighter background `rgba(255,255,255,0.04)` with a lime green left border `3px solid #CCDF1A`
- Read rows: standard background, no left border
- Tapping a notification marks it as read (`is_read = true`) and navigates to the relevant screen

### Notification types and icons

| Type | Icon | Colour | Tap navigates to |
|------|------|--------|-----------------|
| `job_match` | briefcase | blue | /jobs |
| `application_viewed` | eye | amber | /profile |
| `application_rejected` | x-circle | red | /profile |
| `points_earned` | zap | lime green | /wallet |
| `tier_advanced` | trending-up | gold | /profile |
| `course_recommended` | book | teal | /learn |
| `community_reply` | message-circle | purple | /community |
| `daily_challenge` | trophy | orange | /(tabs) |

### Empty state
If no notifications:
- Illustration: simple bell icon in lime green
- Text: "No notifications yet"
- Sub: "We will notify you about job matches, points earned, and platform updates"

---

## Seed 6 notifications for the current user

Insert these into the `notifications` table when the screen first loads and the user has zero notifications. Check count first — only seed if empty:

```ts
const seedNotifications = [
  { message: "New job match: IT Support Specialist L2 at TechNova — 96% match", type: "job_match" },
  { message: "You earned +50 points for completing Module 1 of CompTIA A+", type: "points_earned" },
  { message: "Your application to CloudBase Ltd was viewed by the employer", type: "application_viewed" },
  { message: "Congratulations! You have advanced to Intermediate tier", type: "tier_advanced" },
  { message: "AI recommends: Google Cloud ACE based on your recent activity", type: "course_recommended" },
  { message: "Daily challenge available — earn +50 points today", type: "daily_challenge" },
]
```

---

## Bell icon badge logic

In both the Dashboard header and Community tab header:
1. On mount, fetch count of unread notifications for current user
2. If count > 0, show a red dot on the bell icon
3. If count > 9, show "9+" inside the dot
4. After user visits the notifications screen and taps "Mark all as read", the dot disappears

---

## Done when
- Notifications screen shows all notifications ordered newest first
- Unread notifications have lime green left border
- Tapping a notification marks it as read and navigates correctly
- Mark all as read removes all left borders and red dots
- Bell icon in headers shows red dot when unread notifications exist
- Empty state shows when no notifications
- Loading skeleton shows while fetching
