# task_dashboard_v2.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_04_dashboard, task_15_ui_overhaul | Build on existing dashboard

---

## Goal
Upgrade the existing Dashboard to match the full Kryd PRD spec. The current dashboard has the basic stats and quick actions. This task adds the tier system, AI job recommendations, leaderboard snapshot, and notification bell — making it feel like a real professional platform.

---

## File
`/app/(tabs)/index.tsx` — build on what already exists, do not rebuild from scratch

---

## What to ADD (do not remove existing elements)

---

### 1. Tier badge on the header

Next to the user's name in the greeting section, add a tier badge:

```
Tier logic:
- points < 500       → "New Talent"     → gray badge
- points 500–1999    → "Intermediate"   → blue badge  
- points 2000–4999   → "Rising Pro"     → purple badge
- points 5000+       → "Verified Expert"→ lime green badge
```

Show the badge as a small pill directly under the greeting:
- "Good morning, Alex"
- [New Talent 🌱] badge in gray pill

---

### 2. Tier progress bar

Below the stats row, add a full-width tier progress section:

```
New Talent ──────────────────── Intermediate
           [████████░░░░░░░░░░] 240 / 500 pts
```

Show:
- Current tier name on the left
- Next tier name on the right
- Progress bar filled proportionally
- Points needed text: "260 pts to Intermediate"

Calculate progress:
```ts
const tiers = [
  { name: 'New Talent', min: 0, max: 499 },
  { name: 'Intermediate', min: 500, max: 1999 },
  { name: 'Rising Pro', min: 2000, max: 4999 },
  { name: 'Verified Expert', min: 5000, max: 99999 },
]

const currentTier = tiers.find(t => points >= t.min && points <= t.max)
const progress = (points - currentTier.min) / (currentTier.max - currentTier.min)
```

---

### 3. AI job recommendations section

After the stats row, add a horizontally scrollable row of job cards titled "Matched for you":

```
Matched for you  →  View all
[Job Card 1]  [Job Card 2]  [Job Card 3]
```

**How to generate recommendations for MVP:**
- Fetch all jobs from Supabase
- Get the current user's role from their profile
- Filter: if role is "IT Support Specialist" show jobs with type Full-time or Freelance first
- Assign a match score (random 85–99 for MVP, same pattern as jobs listing)
- Show top 3 as horizontal scroll cards

**Each recommendation card (compact, horizontal scroll):**
- Job title (truncated to 1 line)
- Company name
- Salary range in lime green
- AI Match % badge
- Apply button

Tapping the card navigates to `/job/[id]`.
"View all" navigates to the Jobs tab.

---

### 4. Leaderboard snapshot

At the bottom of the dashboard (above the footer if you have one), add a leaderboard preview section:

```
Top performers this week
[1st] Jane Doe     •  1,240 pts  •  Verified Expert
[2nd] John Smith   •  1,150 pts  •  Intermediate
[3rd] You          •  850 pts    •  New Talent
```

Fetch top 3 profiles by points from Supabase.
If the current user is not in the top 3, show them as a 4th row with their actual rank number.
"View full leaderboard" link navigates to the Community tab leaderboard.

---

### 5. Notification bell in dashboard header

Add a bell icon to the top right of the dashboard header next to the avatar.

- Fetch unread notification count on mount
- If count > 0 show a red dot on the bell
- Tapping navigates to `/notifications`

---

### 6. Client / Provider mode toggle

In the dashboard header or just below the greeting, add a small toggle pill:

```
[Client Mode]  [Provider Mode]
```

- Store active mode in Zustand: `isProviderMode: boolean`
- Client mode: dashboard shows "Find IT professionals" messaging, job posting CTA
- Provider mode: dashboard shows "Find work" messaging, job browsing CTA (current default)
- This is the single account system from the PRD — users toggle without two accounts

---

### 7. Recent activity feed (compact)

Just above the leaderboard, add a small "Recent activity" strip showing the last 3 point transactions:

```
Recent activity
⚡ +50 pts  Module completed  •  2h ago
🏆 +50 pts  Daily challenge   •  Yesterday
💼 +5 pts   Job applied       •  2d ago
```

Fetch last 3 rows from `point_transactions` ordered by `created_at` descending.
"View all" link navigates to the Wallet screen.

---

## Done when
- Tier badge shows correctly based on current points
- Tier progress bar fills accurately and shows correct next tier
- AI job recommendations show 3 relevant jobs in a horizontal scroll
- Leaderboard snapshot shows top 3 + current user position
- Notification bell shows red dot when unread notifications exist
- Client/Provider mode toggle switches correctly and stores in Zustand
- Recent activity shows last 3 point transactions
- All new sections have loading skeletons while fetching
- All new sections have empty states if no data
