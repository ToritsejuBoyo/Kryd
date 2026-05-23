# task_dashboard_v3.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_dashboard_v2, task_theme_engine
> Upgrade the dashboard to a 3-column layout matching Learn and Community pages
> Do not rebuild — enhance what exists

---

## Goal
Upgrade the dashboard to a full 3-column responsive layout matching the design quality and architecture of the Learn and Community pages. The dashboard is the most important screen — it must feel like a professional platform home, not a mobile app screen stretched onto desktop.

---

## Layout architecture

```
flex-col lg:flex-row

Left Sidebar (w-64)      | Middle Column (flex-1)   | Right Sidebar (w-[300px])
-------------------------|--------------------------|---------------------------
WHO YOU ARE              | WHAT TO DO NEXT          | WHAT IS HAPPENING
─────────────────────────|────────────────────────  |──────────────────────────
Avatar + name + tier     | AI job recommendations   | Leaderboard snapshot
Points + coins balances  | Continue learning card   | Trending community topics
Tier progress bar        | Daily challenge card     | Active live rooms
Availability toggle      | Recent activity feed     | Notification preview
Profile completeness     | Refer and earn widget    | Platform stats
Client/Provider toggle   | Quick actions grid       | New members this week
```

On tablet (md): left sidebar collapses, middle + right show side by side.
On mobile: single column — middle → left sidebar → right sidebar.

---

## Left Sidebar (w-64)

### 1. User identity card
Top of the left sidebar — the most prominent element.

```
[Avatar 56px]
Full Name
Role badge · Tier badge
─────────────────────
⭐ 0 pts    🪙 0.00 coins
```

- Avatar: large circle, initials or profile photo
- Name: bold, `colors.textPrimary`
- Role badge: "IT Support Specialist" pill in secondary colour
- Tier badge: "New Talent" pill coloured by tier (gray → blue → purple → lime green)
- Points and coins: small split row below the badges
- Tapping avatar navigates to profile screen

### 2. Tier progress bar
Below the identity card — same style as Learn page:

```
New Talent ─────────────── Intermediate
[░░░░░░░░░░░░░░░░░░░░░░░]
0 / 500 pts · 500 pts to next tier
```

Progress bar fills with `colors.accent` lime green.
Show percentage text on the right end of the bar.

### 3. Availability toggle
A simple toggle row:

```
Availability
● Available now        [toggle on/off]
```

Three states cycling on tap: Available now (green dot) → Open to opportunities (amber dot) → Not available (gray dot).
Updates `profiles.availability` in Supabase on change.
Only shown in Freelancer mode.

### 4. Profile completeness
A small progress card nudging users to complete their profile:

```
PROFILE COMPLETENESS
[████████░░░░] 82%

✓ Skills added
✓ Bio written
○ Add certification  →
○ Add profile photo  →
```

Show the next two incomplete items with arrow links.
Tapping an item navigates to the relevant section of the profile screen.
When 100% complete, replace this card with an achievement badge: "Profile Complete 🎉".

### 5. Client / Provider mode toggle
At the bottom of the left sidebar:

```
WORKSPACE MODE
[💻 Freelancer]  [🏢 Client]
```

Active mode highlighted in lime green.
Tapping switches the entire dashboard content instantly.
Show a brief toast: "Switched to Client mode."

---

## Middle Column (flex-1)

### 1. Page header
```
Good morning, [Name] 👋
[Date]  ·  [Weather widget — simple, shows city and temperature]
```

Weather is optional — use a free weather API or remove if too complex. Just the greeting and date is fine.

### 2. Client / Provider mode banner (conditional)

**In Freelancer mode — show a motivational stat bar:**
```
This week:  ⚡ 0 pts earned  ·  📚 0 modules  ·  💼 0 applications
```

**In Client mode — show a hiring summary bar:**
```
Active jobs: 0  ·  Total applicants: 0  ·  Pending escrow: ₦0 / $0
```

### 3. AI job recommendations (Freelancer mode only)
Section heading: "Matched for you" with "View all →" link to jobs tab.

Horizontal scrollable row of 3 compact job cards:
- Job title (1 line, bold)
- Company · Location
- Salary in ₦ and $ (both currencies)
- AI Match % badge in lime green
- "Apply" button

For MVP: generate random 85–99% match score stored in component state.

### 4. Featured freelancers (Client mode only)
Section heading: "Top IT professionals for you" with "Browse all →" link.

Horizontal scrollable row of 3 freelancer cards:
- Avatar + name + tier badge
- Top 3 skills as pill tags
- Availability dot (green/amber/gray)
- Points score
- "View Profile" button

### 5. Continue Learning card
Same as current implementation but restyled to match the wider middle column.
Show: course thumbnail colour block, title, provider, progress bar, module count, Resume button.
If no active courses: "Start your first course" CTA card.

### 6. Daily challenge card
A distinct card with a trophy icon and lime green accent border:

```
🏆 Daily Challenge
Answer today's IT question and earn +50 pts

[Start Challenge →]
```

If completed today: show green checkmark and "Completed · Come back tomorrow."
If not yet done: pulsing lime green border to draw attention.

### 7. Refer and earn widget
Team requested this on the dashboard:

```
💰 Refer & Earn
Invite IT professionals to Kryd and 
earn 100 points per successful referral.

Your referral link:
[kryd.app/ref/username]  [Copy]

Referrals this month: 0
```

### 8. Recent activity feed
Section heading: "Recent activity"

Last 5 point transactions displayed as a compact timeline:
```
⚡ +50 pts  Module completed      2h ago
🏆 +50 pts  Daily challenge        Yesterday
💬 +10 pts  Community post         2d ago
```

"View all transactions →" link navigates to wallet.

### 9. Quick actions grid (2×2)
Compact 4-card grid below activity:

| Card | Freelancer mode | Client mode |
|------|----------------|-------------|
| Top left | Browse Jobs | Post a Job |
| Top right | Daily Challenge | Find Freelancers |
| Bottom left | Community | Messages |
| Bottom right | Wallet | Wallet |

---

## Right Sidebar (w-[300px])

### 1. Leaderboard snapshot
Section heading: "Top performers"

Top 5 users by points:
```
🥇 1.  Alex O.      1,240 pts  Verified Expert
🥈 2.  Jane K.        980 pts  Intermediate
🥉 3.  Emeka B.       875 pts  Intermediate
    4.  Sarah M.       820 pts  New Talent
    5.  Tunde A.       790 pts  New Talent
─────────────────────────────────────────────
   You  #24            0 pts  New Talent
```

Current user shown at bottom with separator even if outside top 5.
"View full leaderboard →" navigates to Community → Leaderboard tab.

### 2. Trending in community
Section heading: "Trending topics"

Show top 5 trending topics from community_posts (group by content tags or group_name, count posts in last 7 days):

```
🔥 Windows 11 Issues      124 posts  ↑
🔥 Remote Support          98 posts  ↑
   Network Troubleshooting  76 posts
   Microsoft 365            65 posts
   Cybersecurity            54 posts
```

"Join the discussion →" navigates to Community tab.

### 3. Active live rooms
Section heading: "Live right now"

Show up to 3 active rooms from the community rooms feature:

```
🔴 LIVE
IT Support Live Help
128 members · [Join →]

🔴 LIVE
Cloud & DevOps Talk
89 members · [Join →]
```

If no live rooms: "No rooms active right now. Start one in Community."

### 4. Notification preview
Section heading: "Latest notifications"

Show last 3 unread notifications as compact rows:
```
💼 TechNova viewed your application  2h ago
⚡ You earned +50 pts for Module 1   Yesterday
🔔 New job match: Cloud Engineer      2d ago
```

"View all →" navigates to notifications screen.
If no notifications: hide this section entirely.

### 5. Platform stats (small, bottom of sidebar)
```
KRYD TODAY
👥 500+ members
💼 12 new jobs
📚 3 new courses
```

Static numbers for MVP — update manually or pull from Supabase count queries.

---

## Dual currency throughout dashboard

All money values on the dashboard must show in both Naira and USD:

```
Salary display:    ₦2,070,000 / $1,350 per month
Coins value:       0.00 coins ≈ ₦0 / $0.00
Escrow amount:     ₦154,000 / $100
```

Use a fixed exchange rate for MVP stored in a constants file:
```ts
// lib/constants.ts
export const USD_TO_NGN = 1540  // update this manually as rate changes
export const COIN_TO_USD = 0.10
export const COIN_TO_NGN = USD_TO_NGN * COIN_TO_USD

export function formatDualCurrency(usd: number) {
  const ngn = usd * USD_TO_NGN
  return `₦${ngn.toLocaleString()} / $${usd.toFixed(2)}`
}
```

---

## AI Assistant entry point redesign

The team requested the AI assistant button should not look like a generic icon. Redesign it as a proper branded element wherever it appears on the dashboard:

Instead of a plain icon button, show a small animated card:

```
┌────────────────────────────┐
│  🤖  Kryd AI               │
│  Ask me anything about IT  │
│  or your career path  →    │
└────────────────────────────┘
```

- Robot emoji or a custom robot SVG icon in lime green
- Card has a subtle pulsing lime green border animation
- Appears in the middle column between Daily Challenge and Refer & Earn
- Tapping navigates to /ai-assistant

---

## "Applicants" label fix

On all job listing cards throughout the dashboard (AI recommendations, job cards):
- Replace any text that says "proposals" or "proposal count" with "applicants"
- Format: "14 applicants" not "14 proposals"
- This applies everywhere in the app — do a global find and replace for the word "proposal" and replace with "applicant"

---

## Done when
- Dashboard renders in 3-column layout on desktop
- Left sidebar shows identity card, tier progress, availability, profile completeness, mode toggle
- Middle column shows motivational stat bar, AI recommendations, continue learning, daily challenge, Kryd AI card, refer and earn, recent activity, quick actions
- Right sidebar shows leaderboard, trending topics, live rooms, notification preview, platform stats
- Client mode switches middle and left sidebar content correctly
- All salary and money values show in both ₦ and $
- Kryd AI entry point shows as branded card with robot icon
- "Proposals" replaced with "Applicants" everywhere
- All three themes (Light, Dark, Kryd) apply correctly
- Responsive — collapses to single column on mobile correctly
