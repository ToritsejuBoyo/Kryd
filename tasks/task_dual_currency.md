# task_dual_currency.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_theme_engine
> Quick but important — applies to every screen in the app
> Run this BEFORE task_dashboard_v3 and task_wallet_upgrade

---

## Goal
Add dual currency support (Nigerian Naira ₦ and US Dollars $) throughout the entire Kryd app. The platform is Nigeria-first but globally aware. All money values must display in both currencies simultaneously using a fixed exchange rate stored centrally.

---

## Step 1 — Create the currency constants file

Create `/lib/currency.ts`:

```ts
// Central currency configuration for Kryd
// Update USD_TO_NGN manually when rate changes significantly

export const CURRENCY_CONFIG = {
  USD_TO_NGN: 1540,          // Update this as exchange rate changes
  COIN_TO_USD: 0.10,          // 1 coin = $0.10
  get COIN_TO_NGN() {
    return this.USD_TO_NGN * this.COIN_TO_USD  // 1 coin = ₦154
  }
}

// Format a USD amount as dual currency string
// e.g. formatDual(1350) → "₦2,079,000 / $1,350"
export function formatDual(usd: number, options?: {
  showMonthly?: boolean
  compact?: boolean
}): string {
  const ngn = Math.round(usd * CURRENCY_CONFIG.USD_TO_NGN)
  const ngnStr = `₦${ngn.toLocaleString('en-NG')}`
  const usdStr = `$${usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  if (options?.compact) {
    // For small spaces: ₦2.1M / $1.4K
    const ngnCompact = ngn >= 1000000 
      ? `₦${(ngn/1000000).toFixed(1)}M` 
      : ngn >= 1000 
        ? `₦${(ngn/1000).toFixed(0)}K` 
        : `₦${ngn}`
    const usdCompact = usd >= 1000 
      ? `$${(usd/1000).toFixed(0)}K` 
      : `$${usd}`
    return `${ngnCompact} / ${usdCompact}`
  }

  if (options?.showMonthly) {
    return `${ngnStr} / ${usdStr}/mo`
  }

  return `${ngnStr} / ${usdStr}`
}

// Format salary range
// e.g. formatSalaryRange(1350, 1800) → "₦2,079,000 – ₦2,772,000 / $1,350 – $1,800/mo"
export function formatSalaryRange(minUsd: number, maxUsd: number): string {
  const minNgn = Math.round(minUsd * CURRENCY_CONFIG.USD_TO_NGN)
  const maxNgn = Math.round(maxUsd * CURRENCY_CONFIG.USD_TO_NGN)
  
  return `₦${minNgn.toLocaleString()} – ₦${maxNgn.toLocaleString()} / $${minUsd.toLocaleString()} – $${maxUsd.toLocaleString()}/mo`
}

// Format coins value in both currencies
// e.g. formatCoins(4.75) → "4.75 coins ≈ ₦731 / $0.48"
export function formatCoinsValue(coins: number): string {
  const usd = coins * CURRENCY_CONFIG.COIN_TO_USD
  const ngn = Math.round(usd * CURRENCY_CONFIG.USD_TO_NGN)
  return `${coins.toFixed(2)} coins ≈ ₦${ngn.toLocaleString()} / $${usd.toFixed(2)}`
}

// Format a NGN amount only
export function formatNGN(ngn: number): string {
  return `₦${Math.round(ngn).toLocaleString('en-NG')}`
}

// Format a USD amount only
export function formatUSD(usd: number): string {
  return `$${usd.toFixed(2)}`
}

// Convert USD to NGN
export function usdToNgn(usd: number): number {
  return usd * CURRENCY_CONFIG.USD_TO_NGN
}
```

---

## Step 2 — Apply dual currency to every screen

Go through each screen and replace hardcoded salary/money displays with the currency helpers.

### Jobs listing (/app/(tabs)/jobs.tsx)
Replace salary display on job cards:

```ts
// Before
<Text>${job.salary_min} – ${job.salary_max}/mo</Text>

// After
import { formatSalaryRange } from '../../lib/currency'
<Text>{formatSalaryRange(job.salary_min, job.salary_max)}</Text>
```

For fixed-price freelance jobs:
```ts
// Before
<Text>$800 fixed</Text>

// After
<Text>{formatDual(800)} fixed</Text>
```

### Job detail (/app/job/[id].tsx)
Same replacement for the salary display on the detail screen.

### Wallet (/app/wallet.tsx)
Replace all coin and money displays:

```ts
// Coins value display
<Text>{formatCoinsValue(profile.coins)}</Text>

// Conversion calculator result
<Text>You will receive {formatCoinsValue(coinsToReceive)}</Text>

// Total wallet value
const usdValue = profile.coins * CURRENCY_CONFIG.COIN_TO_USD
const ngnValue = usdToNgn(usdValue)
<Text>₦{ngnValue.toLocaleString()} / ${usdValue.toFixed(2)}</Text>
```

### Dashboard (/app/(tabs)/index.tsx)
Replace earnings display:

```ts
// Total earned stat card
const earnedUsd = totalCoins * CURRENCY_CONFIG.COIN_TO_USD
<Text>{formatDual(earnedUsd, { compact: true })}</Text>

// Job recommendation salary
<Text>{formatSalaryRange(job.salary_min, job.salary_max)}</Text>
```

### Profile (/app/profile.tsx)
Hourly rate display:

```ts
// If user has set hourly_rate (in USD)
<Text>{formatDual(profile.hourly_rate)}/hr</Text>
```

---

## Step 3 — Currency selector in settings (optional for MVP)

Add a simple currency preference to the profile settings so users can choose their primary display currency. Store as `preferred_currency: 'NGN' | 'USD'` in profiles.

If preferred_currency = 'NGN': show Naira first, then dollar
If preferred_currency = 'USD': show dollar first, then Naira

For MVP this can be a simple toggle in profile settings. The dual display always shows both — just the order changes.

---

## Step 4 — Exchange rate update note

Add a small note in the wallet screen footer:

```
Exchange rate: $1 = ₦1,540 · Last updated: manually
```

In Phase 2, connect to an exchange rate API (e.g. ExchangeRate-API free tier) to update automatically. For now the rate is hardcoded in `/lib/currency.ts` and updated manually.

---

## Done when
- `/lib/currency.ts` exists with all helper functions
- Job cards show salary in both ₦ and $ (e.g. "₦2,079,000 – ₦2,772,000 / $1,350 – $1,800/mo")
- Wallet shows coin values in both currencies
- Dashboard earnings stat shows dual currency
- Fixed-price freelance jobs show dual amount
- No screen still shows dollar-only or naira-only for any money value
- Exchange rate constant is in one central file (easy to update)
