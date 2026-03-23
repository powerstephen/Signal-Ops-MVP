import customersRaw from '../../data/customers.json'

export interface Customer {
  id: string
  company: string
  industry: string
  employees: number
  stage: string
  country: string
  contact: string
  title: string
  email: string
  deal_stage: string
  deal_value: number
  close_date: string | null
  last_contact: string
  status: string
  mrr: number
  ltv: number
  months_active: number
  expanded: boolean
  churn_date: string | null
  support_tickets: number
  ticket_type: string | null
  time_to_value_days: number | null
  champion_active: boolean
  nps: number | null
}

export interface ICPProfile {
  summary: string
  top_industries: string[]
  typical_size: string
  typical_stage: string
  avg_ltv: number
  avg_months_active: number
  avg_support_tickets: number
  avg_time_to_value: number
  key_traits: string[]
  red_flags: string[]
  best_customer_ids: string[]
}

export interface ScoredAccount extends Customer {
  icp_score: number
  score_reasons: string[]
  signal_reasons: string[]
  recommended_action: string
}

export function getAllCustomers(): Customer[] {
  return customersRaw as Customer[]
}

export function getActiveCustomers(): Customer[] {
  return getAllCustomers().filter(c => c.status === 'active')
}

export function getBestCustomers(): Customer[] {
  return getActiveCustomers()
    .filter(c => c.ltv > 30000 && c.support_tickets <= 4 && c.expanded && c.champion_active)
    .sort((a, b) => b.ltv - a.ltv)
}

export function getDormantAccounts(): Customer[] {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 6)
  return getAllCustomers().filter(c => {
    const last = new Date(c.last_contact)
    return last < cutoff && (c.status === 'closed_won' || c.deal_stage === 'closed_lost' || c.status === 'churned')
  })
}

export function getStats() {
  const all = getAllCustomers()
  const active = getActiveCustomers()
  const best = getBestCustomers()
  const totalMrr = active.reduce((sum, c) => sum + c.mrr, 0)
  const avgLtv = Math.round(active.reduce((sum, c) => sum + c.ltv, 0) / active.length)
  return {
    total: all.length,
    active: active.length,
    churned: all.filter(c => c.status === 'churned').length,
    at_risk: all.filter(c => c.status === 'at_risk').length,
    lost: all.filter(c => c.status === 'lost').length,
    best_customers: best.length,
    total_mrr: totalMrr,
    avg_ltv: avgLtv,
  }
}
