bash

cat > /home/claude/kryd-workspace/tasks/task\_wallet\_upgrade.md << 'ENDOFFILE'

\# task\_wallet\_upgrade.md

> Agent task — read KRYD\_SPEC.md first, then follow these instructions.

> Depends on: task\_11\_wallet, task\_theme\_engine

> This is a UI upgrade task — build on the existing wallet screen, do not rebuild from scratch

> Match the same 3-column responsive layout and design quality as the Learn and Community pages



\---



\## Goal

Upgrade the existing wallet screen from a simple single-column layout to a comprehensive 3-column financial hub. The wallet should feel like a real fintech product — not just a balance display. Match the same layout architecture, sidebar depth, and visual quality as the Learn page.



\---



\## Layout architecture — 3 columns (same pattern as Learn and Community)



```

flex-col lg:flex-row



Left Sidebar (w-64)     |  Middle Column (flex-1)  |  Right Sidebar (w-\[300px])

\------------------------|--------------------------|---------------------------

Wallet summary          |  Balance cards           |  Earning opportunities

Quick actions           |  Convert section         |  Points breakdown

Earning streak          |  Transaction history     |  Coming soon: withdrawals

Referral widget         |  Deposit/withdraw        |  Exchange rate info

```



On mobile — stack into single column in order: middle → left sidebar → right sidebar.



\---



\## Left Sidebar (w-64)



\### 1. Total wallet value card

A prominent card at the top of the left sidebar showing the combined value of the user's points and coins in dollar terms.



```

TOTAL WALLET VALUE

$0.00

─────────────────

⭐ 0 pts   🪙 0.00 coins

```



\- Large dollar amount in lime green `colors.accent`

\- Points and coins shown below as a split row

\- Subtitle: "Based on current conversion rate"

\- Small info icon that shows a tooltip: "1 coin = $0.10 · 100 points = 1 coin"



\### 2. Quick action buttons

Three icon buttons in a row below the value card:



| Button | Icon | Action |

|--------|------|--------|

| Deposit | arrow-down-circle | Scrolls to deposit section in middle column |

| Withdraw | arrow-up-circle | Scrolls to withdraw section |

| Transfer | arrow-right-circle | Opens transfer to another Kryd user modal |



Style: each button is a square card with icon centered, label below. Active state shows lime green border.

Withdraw and Transfer show a "Coming Soon" badge overlay until Phase 2.



\### 3. Earning streak

A gamified streak widget matching the style of the Learn page streak tracker.



```

EARNING STREAK

🔥 0 days



M  T  W  T  F  S  S

○  ○  ○  ○  ○  ○  ○

```



Days with earnings fill in lime green. 7-day streak awards a bonus 100 points (show this as a reward hint below the tracker).



\### 4. Referral widget

A simple card at the bottom of the left sidebar:



```

💰 Refer \& Earn

Invite a friend to Kryd and 

earn 100 points when they 

complete their first job or course.



\[Copy referral link]

```



Copy referral link button copies a shareable URL. For MVP this is just a placeholder link — the referral tracking system comes in Phase 2.



\---



\## Middle Column (flex-1) — main content



\### 1. Page header

```

My Wallet

Manage your points, coins, and earnings

```



\### 2. Balance cards row

Two cards side by side (same size, equal width):



\*\*Points card:\*\*

\- Large number: `0` in `colors.textPrimary`

\- Label: "Points"

\- Icon: star or lightning bolt in lime green

\- Sub: "Earnable through learning and activity"

\- Small trend line: "+0 this week"



\*\*Coins card:\*\*

\- Large number: `0.00` in lime green `colors.accent`

\- Label: "Coins"

\- Icon: coin icon in amber/gold

\- Sub: "1 coin ≈ $0.10"

\- Small trend line: "+0.00 this week"



\### 3. Convert Points to Coins section

Keep the existing convert section but redesign it as a proper card with better visual hierarchy:



```

┌─────────────────────────────────────────┐

│  Convert Points to Coins                │

│                                         │

│  Available: 0 pts                       │

│                                         │

│  \[──────────── input ────────────]      │

│   Points to convert (min 500)           │

│                                         │

│  Conversion breakdown:                  │

│  Points entered:        0               │

│  Platform fee (5%):     0               │

│  ─────────────────────────────          │

│  You receive:           0.00 coins      │

│                                         │

│  \[      Convert Now      ]              │

└─────────────────────────────────────────┘

```



Add a visual conversion breakdown table instead of just one line. Shows entered amount, fee deduction, and final coins received. Updates live as user types.



\### 4. Transaction history

Full transaction history section below the convert card.



\*\*Header row:\*\*

```

Transaction History                    \[Filter ▼]  \[Export CSV]

```



Filter dropdown options: All, Points earned, Points spent, Coins credited, Coins spent.



Export CSV button downloads all transactions as a CSV file.



\*\*Each transaction row:\*\*

```

\[icon]  \[reason]                \[date]        \[amount]

⚡      Module completed         May 6 · 2:34PM    +50 pts

🏆      Daily challenge          May 5 · 9:12AM    +50 pts

💼      Job applied              May 5 · 8:00AM    +5 pts

🔄      Converted to coins       May 4 · 6:00PM   -500 pts

🪙      Coins credited           May 4 · 6:00PM   +4.75 coins

```



Icons per transaction type:

\- `module\_completed` → ⚡ lightning bolt

\- `daily\_challenge` → 🏆 trophy

\- `community\_post` → 💬 message

\- `job\_applied` → 💼 briefcase

\- `converted\_to\_coins` → 🔄 refresh arrows

\- `coins\_credited` → 🪙 coin

\- `ai\_assistant\_query` → 🤖 robot



Amount column: green text for positive, red for negative.



Empty state: "No transactions yet. Start learning and completing challenges to earn points."



Pagination: show 10 per page with Load more button.



\### 5. Deposit coins section

A card below transaction history:



```

┌─────────────────────────────────────────┐

│  💳 Buy Coins                           │

│  Purchase coins to unlock premium       │

│  features and boost your visibility     │

│                                         │

│  \[50 coins]  \[100 coins]  \[250 coins]   │

│   $5.00       $10.00       $25.00       │

│                                         │

│  \[ Purchase with Paystack ]             │

│                                         │

│  🔒 Secure payment via Paystack         │

└─────────────────────────────────────────┘

```



The purchase button shows a "Coming Soon" overlay for MVP. Show the section so users can see it is coming — this also measures intent (how many users tap it).



\### 6. Withdraw coins section

A card at the bottom of the middle column:



```

┌─────────────────────────────────────────┐

│  🏦 Withdraw Earnings                   │

│                                         │

│  \[Bank Transfer]  \[PayPal]  \[Crypto]    │

│  (grayed out)     (grayed out) (grayed) │

│                                         │

│  Withdrawal options launching soon.     │

│  Every coin you earn is safely tracked  │

│  and will be redeemable when we launch. │

│                                         │

│  🔔 Notify me when withdrawals go live  │

│  \[  ✓ I'm interested  ]                 │

└─────────────────────────────────────────┘

```



The "I'm interested" button inserts a row into `notifications` with type `withdrawal\_interest` so you can measure demand. Button changes to "You'll be notified ✓" after tapping.



\---



\## Right Sidebar (w-\[300px])



\### 1. How to earn more points

A clean card showing all the ways to earn:



```

EARNING OPPORTUNITIES



⚡ Complete a module      +50 pts

🏆 Daily challenge         +50 pts

💬 Community post          +10 pts

💼 Apply to a job           +5 pts

🤖 Use AI assistant         +5 pts

🔗 Refer a friend         +100 pts

```



Each row has a small "Do it →" link that navigates to the relevant screen.

Rows the user has done today show a green checkmark instead of the arrow.



\### 2. Points breakdown chart

A simple horizontal bar chart showing where the user's points have come from:



```

POINTS BREAKDOWN



Learning      ████████░░  0 pts

Challenges    ████░░░░░░  0 pts

Community     ██░░░░░░░░  0 pts

Jobs          █░░░░░░░░░  0 pts

```



For MVP with 0 points, show the empty bars with a hint text: "Complete activities to see your breakdown."

Calculate percentages from `point\_transactions` grouped by reason category.



\### 3. Coin value info card

```

COIN VALUE



1 coin = $0.10 USD

Exchange rate updated daily



Currently:

0.00 coins in your wallet

≈ $0.00 USD value



\[How coins work →]

```



"How coins work →" opens a bottom sheet explaining the full economy: earn points → convert to coins → withdraw as cash. Simple 3-step visual.



\### 4. Leaderboard — top earners this week

Fetch top 3 profiles by points from this week's transactions (or all-time for MVP if weekly is complex):



```

TOP EARNERS THIS WEEK



🥇 Alex O.     1,240 pts

🥈 Jane K.       980 pts

🥉 Emeka B.      875 pts



\[View full leaderboard →]

```



Same gold/silver/bronze styling as the Learn page leaderboard.

Highlight current user's row if they appear in top 10.



\### 5. Security notice (bottom of right sidebar)

```

🔒 Your wallet is secure



All transactions are encrypted 

and logged. KYC verification 

is required for withdrawals.



\[Verify your identity →]

```



"Verify your identity →" navigates to the KYC screen (coming soon state for MVP).



\---



\## Responsive behaviour



\*\*Desktop (lg:):\*\* Full 3-column layout as described above.



\*\*Tablet (md:):\*\* Left sidebar collapses. Middle and right sidebars show side by side.



\*\*Mobile:\*\* Single column. Order: balance cards → convert section → quick actions → transaction history → earning opportunities → withdraw section.



\---



\## Theme compatibility

Every colour must use `colors.\*` tokens from `useTheme()`. No hardcoded hex values anywhere in this screen. Test all three themes (Light, Dark, Kryd) and confirm the wallet looks correct in each.



\---



\## Done when

\- 3-column layout renders on desktop with all three sidebars visible

\- Collapses correctly to single column on mobile

\- Total wallet value card shows combined dollar value in left sidebar

\- Quick action buttons (Deposit, Withdraw, Transfer) show with coming soon states

\- Earning streak tracker shows 7-day row

\- Balance cards show points and coins with weekly trend lines

\- Convert section shows live breakdown table as user types

\- Transaction history shows with filter dropdown and export CSV

\- Each transaction type has correct icon and colour

\- Deposit coins section shows coin packages with coming soon overlay

\- Withdraw section has "Notify me" button that saves interest to Supabase

\- Earning opportunities card shows all earn actions with do-it links

\- Points breakdown shows horizontal bars by category

\- Top earners leaderboard shows top 3 with gold/silver/bronze

\- All three themes apply correctly throughout the entire screen

ENDOFFILE

echo "Done"





