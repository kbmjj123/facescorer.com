const FREE_LIMIT = 20

const KEYS = {
  usage: 'cardscan_usage',
  plan: 'cardscan_plan',
} as const

interface QuotaUsage {
  month: string
  count: number
}

interface PlanState {
  plan: 'one-time' | 'monthly' | 'yearly'
  expiry: number
}

export type PlanType = PlanState['plan']

export function useQuota() {
  const freeLimit = FREE_LIMIT

  function getUsage(): QuotaUsage {
    try {
      const raw = localStorage.getItem(KEYS.usage)
      return raw ? JSON.parse(raw) : { month: '', count: 0 }
    } catch {
      return { month: '', count: 0 }
    }
  }

  function setUsage(usage: QuotaUsage) {
    localStorage.setItem(KEYS.usage, JSON.stringify(usage))
  }

  function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7)
  }

  function getActivePlan(): PlanState | null {
    try {
      const raw = localStorage.getItem(KEYS.plan)
      if (!raw) return null
      const plan = JSON.parse(raw) as PlanState
      if (plan.plan === 'one-time') return plan // never expires
      if (plan.expiry > Date.now()) return plan
      return null // expired
    } catch {
      return null
    }
  }

  function isPaid(): boolean {
    return getActivePlan() !== null
  }

  function canScan(newCount: number): boolean {
    const usage = getUsage()
    const currentMonth = getCurrentMonth()

    // New month reset
    if (usage.month !== currentMonth) {
      setUsage({ month: currentMonth, count: 0 })
      return newCount <= freeLimit
    }

    if (isPaid()) return true

    return usage.count + newCount <= freeLimit
  }

  function recordScan(count: number) {
    const usage = getUsage()
    const currentMonth = getCurrentMonth()

    if (usage.month !== currentMonth) {
      setUsage({ month: currentMonth, count })
    } else {
      setUsage({ month: currentMonth, count: usage.count + count })
    }
  }

  function getRemaining(): number {
    const usage = getUsage()
    const currentMonth = getCurrentMonth()
    if (usage.month !== currentMonth) return freeLimit
    if (isPaid()) return Infinity
    return Math.max(0, freeLimit - usage.count)
  }

  function getUsed(): number {
    const usage = getUsage()
    const currentMonth = getCurrentMonth()
    if (usage.month !== currentMonth) return 0
    return usage.count
  }

  function activatePlan(plan: PlanType) {
    const expiry = plan === 'monthly'
      ? Date.now() + 30 * 24 * 60 * 60 * 1000
      : plan === 'yearly'
        ? Date.now() + 365 * 24 * 60 * 60 * 1000
        : Infinity

    localStorage.setItem(KEYS.plan, JSON.stringify({ plan, expiry }))
  }

  function requirePaid(feature: string, action: () => void): boolean {
    if (isPaid()) {
      action()
      return true
    }
    return false // caller should show upgrade modal
  }

  return {
    freeLimit,
    getUsage,
    getActivePlan,
    isPaid,
    canScan,
    recordScan,
    getRemaining,
    getUsed,
    activatePlan,
    requirePaid,
  }
}
