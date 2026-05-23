# task_ui_adjustments.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> This is a focused UI adjustment task — do not rebuild, only adjust what is specified
> Covers: Auth pages, Dashboard, Get Jobs, Wallet
> Run as one agent — these are connected adjustments

---

## Goal
Make targeted UI adjustments across four areas of the app based on product review feedback. The goal is to reduce clutter, fix information hierarchy, and make each page feel focused and intentional.

---

## ADJUSTMENT 1 — Auth pages restructure

### Current problem
There is a welcome page and a login page and the relationship between them is confusing. Users do not know where to start.

### Fix — Login page becomes the entry point
File: `/app/(auth)/login.tsx`

The LOGIN PAGE is now the first screen users see. Redesign it as follows:

**Layout (top to bottom):**
- Kryd logo centered at top
- Heading: "Welcome back."
- Subtitle: "Sign in to your account"

- Email input field
- Password input field
- Forgot password? link (right-aligned, small)
- **Sign In** button (primary, full width, lime green)
- Divider: `─────── or ───────`
- **Create an account** button (ghost, full width, outline style)
  → This button navigates to `/app/(auth)/onboarding/role-select.tsx`
  → NOT to the old welcome page
  → The welcome page (`welcome.tsx`) is now only reached from this button

**At the very bottom:**
- Terms of Service and Privacy Policy links (tiny, secondary colour)

### Fix — Welcome page becomes the onboarding gateway
File: `/app/(auth)/welcome.tsx`

This page is now only reached by tapping "Create an account" from the login page. It should NO LONGER have a Sign In button as the primary action.

**Layout (top to bottom):**
- Kryd logo at top
- Large illustration or abstract geometric graphic (brand colours)
- Heading: **"The IT career platform built for you."**
- Subtitle: "Learn. Earn. Connect. Grow. All in one place."
- **Get Started** button (primary, full width, lime green)
  → navigates to `/app/(auth)/onboarding/role-select.tsx`
- Below the Get Started button, a small subtle link (NOT a button):
  `Already have an account? Sign in`
  → Small font, secondary colour, underlined
  → navigates back to Login page
- Nothing else on this screen

### Fix — All onboarding screens
On EVERY screen in the freelancer and client onboarding flows, the "Already have an account? Sign in" link must be:
- Small text — `font-size: 12px`
- Secondary colour — `colors.textSecondary`
- Positioned below the primary CTA button
- Not styled as a button — just a text link with "Sign in" underlined
- Example: `Already have an account? Sign in`

---

## ADJUSTMENT 2 — Dashboard three-column restructure

### Left sidebar — collapsible, identity and status only

**Content (in order):**

1. **Current tier card**
```
NEW TALENT  🌱
Level 1
─────────────────
Progress to Intermediate
[░░░░░░░░░░░░░░░] 0 / 500 pts
```

2. **Mode toggle** (Freelancer / Client switch)
```
[ 💻 Freelancer ]  [ 🏢 Client ]
```
Active mode in lime green, inactive in secondary colour.

3. **Availability button** (Freelancer mode only)
```
● Available now  ▾
```
Tapping opens a small dropdown: Available now / Open to opportunities / Not available.
Colour changes: green / amber / gray.

4. **Status summary cards** — compact stat rows, NOT large cards:
```
Active courses:      2
Jobs applied:        5
Points this week:    +150
Coins balance:       4.75
```
Each row is a single line with label on left and value on right.
Tapping "Active courses" navigates to Learn tab.
Tapping "Jobs applied" navigates to profile My Applications.

**Collapsible behaviour:**
- A small arrow icon `‹` sits at the RIGHT EDGE of the left sidebar, vertically centered
- Tapping it collapses the sidebar to a thin strip (48px wide) showing only icons:
  - Tier dot (coloured circle matching tier colour)
  - Toggle icon
  - Availability dot
  - Course icon
- The arrow becomes `›` when collapsed
- Tapping `›` expands back to full sidebar
- Store collapsed state in AsyncStorage so it persists between sessions
- This collapse behaviour applies to ALL pages that have a left sidebar:
  Dashboard, Learn, Jobs, Community, Wallet

---

### Middle column — hello bar + job feed + daily challenge

**Remove from middle column:**
- Remove the current stats row (Points card, Active Courses card, Earned card) — these move to left sidebar
- Remove the leaderboard snapshot section
- Remove the platform stats section
- Remove the recent activity feed (this moves to wallet)
- Remove the refer and earn widget from here (move to wallet)

**Add to middle column (in this exact order):**

**1. Hello bar** — a warm greeting strip at the very top of the middle column:
```
┌────────────────────────────────────────────────────────┐
│  👋  Hello, Toritseju        Friday, May 22  ·  31°C  │
└────────────────────────────────────────────────────────┘
```
- Rounded card, subtle background (`colors.cardSurface`)
- Left: wave emoji + "Hello, [first name]" in bold
- Right: current day/date + weather (temperature only, no description)
  - Use a simple free weather API or just show date if weather is complex
- Lime green left border (3px) on the card

**2. Job feed with search and filters** (Freelancer mode)

Section heading: "Jobs for you"

Search bar immediately below the hello bar:
```
[🔍 Search jobs, skills, companies...          ] [Filters ▼]
```

Filter chips below search bar (horizontal scroll):
```
[All]  [Remote]  [Freelance]  [Full-time]  [Hybrid]  [Saved]
```

Job cards below — same style as the Get Jobs page.
Show 5 jobs initially with a "Load more" button.
"View all jobs →" link top right of section.

**In Client mode** replace job feed with:
Section heading: "Your active listings"
Show the client's posted jobs with applicant counts.
A large "Post a new job +" card at the top.

**3. Daily challenge card** — below the job feed:
```
┌────────────────────────────────────────────────────────┐
│  🏆  Daily Challenge                    +50 pts        │
│  Answer today's IT question and grow your career.      │
│                                                        │
│  [  Start today's challenge →  ]                       │
└────────────────────────────────────────────────────────┘
```
Lime green border on the card.
If completed today: show green checkmark + "Completed · Come back tomorrow."

**4. Kryd AI card** — below daily challenge:
```
┌────────────────────────────────────────────────────────┐
│  🤖  Kryd AI Assistant                                 │
│  Ask me anything about IT or your career path.         │
│                                                        │
│  [  Ask Kryd AI →  ]                                  │
└────────────────────────────────────────────────────────┘
```
Subtle pulsing lime green border animation.

---

### Right sidebar — two focused sections only

**Remove from right sidebar:**
- Remove leaderboard snapshot
- Remove trending topics (move to Community page only)
- Remove platform stats
- Remove notification preview strip

**Keep only these two sections:**

**1. AI Career Tip of the Day**
```
┌─────────────────────────────┐
│  💡 Career Tip              │
│                             │
│  "Adding a CompTIA          │
│  certification to your      │
│  profile increases job      │
│  match rates by up to 40%   │
│  on Kryd."                  │
│                             │
│  [  Explore certifications ]│
└─────────────────────────────┘
```
For MVP: rotate through 7 hardcoded tips (one per day of week).
The tip changes daily based on `new Date().getDay()`.
The CTA button changes based on the tip content.

Tip rotation:
- Monday: "Complete your profile to unlock better job matches."
- Tuesday: "Users who post in the community earn 3x more points per week."
- Wednesday: "A verified certification badge increases your visibility to clients by 60%."
- Thursday: "Set your availability to 'Available now' to appear at the top of client searches."
- Friday: "Freelancers who apply to 5+ jobs per week are 4x more likely to land a contract."
- Saturday: "Completing a daily challenge every day for 7 days unlocks a streak bonus of +100 pts."
- Sunday: "Your profile photo increases profile views by 35%. Add one in your settings."

**2. Upcoming on Kryd**
```
┌─────────────────────────────┐
│  📅 Coming up               │
│                             │
│  🏆 Weekly Challenge        │
│     Ends in 3 days          │
│                             │
│  📚 New Course Added        │
│     Azure Administrator     │
│     AZ-104                  │
│                             │
│  🎯 Community Q&A           │
│     Live room · Tonight     │
└─────────────────────────────┘
```
For MVP: hardcode 2-3 items. Update them manually as real events happen.
In Phase 2 connect to a platform_events table.

---

### Top navigation bar — final arrangement

Left: Kryd logo
Center: Dashboard · Get Jobs · Learn · Wallet · Community
Right (in this order, left to right):
- 💬 Messages icon (with unread badge)
- 🔔 Notifications icon (with unread badge)
- Mode toggle pill: `[💻 Freelancer] [🏢 Client]`
  → Move the mode toggle INTO the top nav bar
  → Remove it from the left sidebar (it is now in both top nav and left sidebar — pick ONE location: top nav bar)
  → Left sidebar toggle can be removed since it is in the top nav
- 🟢 YU — User avatar circle (clickable)
  → Tapping avatar opens the profile dropdown (Settings, Theme, Sign Out etc.)

---

## ADJUSTMENT 3 — Get Jobs page cleanup

### Remove from middle column top:
- Remove the "Find Jobs" button
- Remove the "Update Profile" button
- Remove any introductory text or CTA section that sits above the search bar

### New middle column top:
The VERY FIRST element in the middle column of the Get Jobs page must be the search bar:

```
[🔍 Search jobs, skills, companies...          ] [Filters ▼]
```

Immediately below the search bar — filter chips:
```
[All]  [Remote]  [Freelance]  [Full-time]  [Hybrid]  [Saved Jobs]
```

Then immediately below — the job feed.

No headings, no intro text, no buttons above the search bar.
The page heading "Get Jobs" in the top of the middle column can stay as a small label above the search bar but should be small — not a big hero heading.

### Left sidebar on Get Jobs page:
Keep the same collapsible left sidebar as the dashboard.
Content for Get Jobs left sidebar:
- Job search filters (more detailed than the chips):
  - Salary range slider
  - Job type checkboxes
  - Experience level filter
  - Location filter
- Saved searches (coming soon state for MVP)
- "AI will match jobs to your skills automatically" info card

### Right sidebar on Get Jobs page:
- Top companies hiring (3 company logos/names with "View jobs →")
- AI match explanation: "Your AI Match % is based on your skills, experience, and profile completeness."
- Profile strength nudge if profile is under 80% complete

---

## ADJUSTMENT 4 — Wallet page cleanup

### Currency display — single currency only

Read the user's `preferred_currency` from their profiles row.
If `preferred_currency = 'NGN_USD'` → show Naira (₦) as primary
If `preferred_currency = 'USD'` → show Dollar ($) as primary
If `preferred_currency = 'NGN'` → show Naira (₦) only

Do NOT show both currencies simultaneously on the wallet page.
Show ONE currency — the one they chose during onboarding.

Add a small settings link: "Change currency →" that navigates to profile settings.

### Remove from wallet entirely:
- Remove the leaderboard / top earners section — does not belong on a financial page
- Remove the repeated points explanation text
  (e.g. remove any text that explains "points are earned by..." — users learned this during onboarding)
- Remove the "Points breakdown chart" from the right sidebar
  → Replace with the currency info card showing exchange rate only

### Wallet right sidebar — simplified:
Remove all of these:
- Leaderboard
- Points breakdown chart
- "How to earn more points" list

Replace with only TWO items:

**1. Your currency**
```
YOUR CURRENCY
₦ Nigerian Naira
─────────────────
Exchange rate:
$1 = ₦1,540
1 coin = ₦154

[Change currency →]
```

**2. Security and trust**
```
🔒 WALLET SECURITY
Your balance is encrypted
and protected.

Withdrawals require
identity verification (KYC).

[Verify your identity →]
```

### Wallet left sidebar — simplified:
Remove the earning streak tracker from the wallet page.
The earning streak belongs on the Learn page (where learning happens) not the wallet.

Left sidebar on wallet should only show:
- Total wallet value (points + coins in preferred currency)
- Quick action buttons: Deposit / Withdraw / Transfer
- Referral widget

### Wallet middle column — cleaned up order:

1. Balance cards (Points and Coins) — side by side
2. Convert Points to Coins section
3. Buy Coins section (with coming soon overlay)
4. Withdraw section (with "Notify me" button)
5. Transaction history (with filter and export)

No leaderboard. No points explanation. No repeated content.

---

## Polish suggestions (implement alongside the above)

### Consistency across all pages
Every page with a 3-column layout must have the SAME left sidebar collapse behaviour. The collapse arrow `‹` / `›` must appear in the same position on every page. When the user collapses it on the Dashboard, it stays collapsed when they navigate to Learn, Jobs, and Community.

Store in Zustand:
```ts
interface UIStore {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}
```
Persist to AsyncStorage so it survives app restarts.

### Page transitions
When navigating between main tabs (Dashboard → Learn → Jobs etc.) use a subtle fade transition rather than the default instant switch. 150ms opacity fade.

### Search bar consistency
Every search bar across the app (Dashboard job feed, Get Jobs, Learn, Community) must look identical:
- Same height, same border radius, same placeholder style
- Same filter button style to the right
- This creates visual consistency and reduces cognitive load

---

## Done when

**Auth:**
- Login page is the entry point with Sign In form + "Create an account" ghost button
- Welcome page only shows Get Started + small "Already have an account? Sign in" text link
- All onboarding screens have small "Already have an account? Sign in" text only (no button)

**Dashboard:**
- Left sidebar contains only: tier card, mode toggle (or remove if in top nav), availability, status summary
- Left sidebar collapses to icon strip via `‹` arrow on ALL pages
- Collapsed state persists across pages and app restarts
- Middle column contains: hello bar, job feed with search + filters, daily challenge, Kryd AI card
- Right sidebar contains only: AI Career Tip of the Day, Upcoming on Kryd
- Top nav right side: Messages icon, Notifications icon, Mode toggle pill, Avatar

**Get Jobs:**
- No Find Jobs or Update Profile buttons
- Search bar is the very first element in the middle column
- Filter chips immediately below search bar
- Job feed immediately below filter chips

**Wallet:**
- Shows only the currency from user's onboarding preference
- No leaderboard anywhere on this page
- No repeated points explanation text
- Right sidebar has only: Your Currency card, Security card
- Left sidebar has only: total value, quick actions, referral widget
- Middle column order: balances → convert → buy → withdraw → transactions
