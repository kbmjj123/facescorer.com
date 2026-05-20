# Payment & Quota Rules

## localStorage Keys (canonical, never change)
```ts
const KEYS = {
  usage: 'cardscan_usage',   // { month: 'YYYY-MM', count: number }
  plan: 'cardscan_plan',     // { plan: 'one-time'|'monthly'|'yearly', expiry: number (timestamp) }
}
```

## Quota Check Logic
```ts
function canScan(newCount: number): boolean {
  const usage = JSON.parse(localStorage.getItem(KEYS.usage) ?? '{}')
  const currentMonth = new Date().toISOString().slice(0, 7)  // 'YYYY-MM'
  if (usage.month !== currentMonth) {
    // New month — reset
    localStorage.setItem(KEYS.usage, JSON.stringify({ month: currentMonth, count: 0 }))
    return true
  }
  const plan = JSON.parse(localStorage.getItem(KEYS.plan) ?? '{}')
  const isPaid = plan.expiry > Date.now() || plan.plan === 'one-time'
  const limit = isPaid ? Infinity : FREE_LIMIT  // FREE_LIMIT = 20
  return usage.count + newCount <= limit
}
```

## Payment Return URL Handling (Lemon Squeezy)
```ts
// In pages/index.vue onMounted
const params = new URLSearchParams(window.location.search)
if (params.get('payment') === 'success') {
  const plan = params.get('plan') as PlanType
  const expiry = plan === 'monthly'
    ? Date.now() + 30 * 24 * 60 * 60 * 1000
    : plan === 'yearly'
    ? Date.now() + 365 * 24 * 60 * 60 * 1000
    : Infinity  // one-time: never expires
  localStorage.setItem(KEYS.plan, JSON.stringify({ plan, expiry }))
  useRouter().replace({ query: {} })  // clean URL
  showSuccessToast(' Upgrade successful! Unlimited scanning unlocked.')
}
```

## Lemon Squeezy URLs — Use Env Vars
```ts
// nuxt.config.ts runtimeConfig
runtimeConfig: {
  public: {
    lsOneTime: process.env.NUXT_PUBLIC_LS_ONE_TIME,   // checkout URL
    lsMonthly: process.env.NUXT_PUBLIC_LS_MONTHLY,
    lsYearly: process.env.NUXT_PUBLIC_LS_YEARLY,
  }
}
// Usage: const config = useRuntimeConfig(); config.public.lsOneTime
```

## Pay-gate Pattern (use this consistently)
```ts
// In useQuota.ts
function requirePaid(feature: string, action: () => void) {
  const plan = getActivePlan()
  if (plan) {
    action()
  } else {
    upgradeModal.open({ trigger: feature })  // show UpgradeModal
  }
}
// Usage: requirePaid('excel-export', () => exportExcel(cards))
```

## UpgradeModal Must Show
- What the user tried to do ("To export Excel...")
- All 3 pricing options (one-time, monthly, yearly)
- The free limit clearly ("You've used 20/20 free cards this month")
- A "Maybe later" dismiss option (non-blocking)
