# task_11_wallet.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Day: 11 | Depends on: task_04 | Parallel: can run alongside task_12

---

## Goal
Build the Wallet screen — where users see their points, convert to coins, and view their full transaction history.

---

## File
`/app/wallet.tsx`

Accessible from:
- Dashboard → "Withdraw Coins" quick action (replace the coming soon modal with navigation here)
- Profile screen → "View Wallet" link

---

## Layout (top to bottom)

### Header
- Back button (left)
- Title: "My Wallet"

### Balance cards (2 cards side by side)
**Points card** (left):
- Large number: `1,240`
- Label: "Points"
- Sub: "Earnable through learning and activity"

**Coins card** (right):
- Large number: `4.75`
- Label: "Coins"
- Sub: "1 coin ≈ $0.10"

### Conversion section
Heading: "Convert Points to Coins"

Show:
- Current points available
- Conversion rate: "100 points = 1 coin"
- Platform fee: "5% conversion fee applies"
- Input: "Points to convert" — numeric, minimum 500
- Live calculation below: "You will receive **X coins** after fee"
  - Formula: `Math.floor((input / 100) * 0.95 * 100) / 100`

**Convert** button (lime green, disabled if input < 500 or > user's points balance):

On tap:
1. Show confirmation modal: "Convert [X] points to [Y] coins?"
2. On confirm:
   - Update `profiles.points` — subtract input amount
   - Update `profiles.coins` — add calculated coins amount
   - Insert two rows into `point_transactions`:
     - `{ amount: -input, reason: 'converted_to_coins' }`
     - `{ amount: Math.floor(coins * 100), reason: 'coins_credited' }` (store coins as integer × 100 for precision)
   - Update Zustand store
   - Show success: "Conversion complete! [Y] coins added to your wallet."

### Transaction history
Heading: "Transaction History"

FlatList of all `point_transactions` for the current user, ordered newest first.

Each row:
- Icon: ↑ green arrow for positive, ↓ red arrow for negative
- Reason (formatted nicely):
  - `module_completed` → "Module completed"
  - `daily_challenge` → "Daily challenge"
  - `community_post` → "Community post"
  - `job_applied` → "Job application"
  - `converted_to_coins` → "Converted to coins"
  - `coins_credited` → "Coins credited"
- Amount: "+50 pts" in green or "-500 pts" in red
- Date: "May 6, 2026 at 2:34 PM"

Empty state: "No transactions yet — start learning to earn points."

### Withdraw section (at the bottom)
Heading: "Withdraw Coins"

Show 3 method icons (bank, PayPal, crypto) in a row — all gray and non-interactive.
Text: "Withdrawal methods are launching soon. Every coin you earn is safely tracked and will be redeemable."

A small banner: "Early members will get priority access to withdrawals when we launch."

---

## Done when
- Wallet shows correct points and coins from Supabase
- Conversion calculator updates in real time as user types
- Converting points updates both `profiles.points` and `profiles.coins` in Supabase
- Transaction history shows all past events with correct formatting
- Balance cards update immediately after conversion without a page reload
