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
// e.g. formatCoinsValue(4.75) → "4.75 coins ≈ ₦731 / $0.48"
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
