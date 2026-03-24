'use client'
import { useState } from 'react'
import { Loader2, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Zap, CheckCircle, XCircle, Clock, Users } from 'lucide-react'

interface ScoredDeal {
  id: string
  company: string
  contact: string
  title: string
  industry: string
  stage: string
  deal_value: number
  close_date_expected: string
  emails_sent: number
  emails_received: number
  calls_answered: number
  calls_attempted: number
  meetings_held: number
  next_meeting_booked: boolean
  prospect_contacts_engaged: number
  reciprocal_commitments: string[]
  champion_active: boolean
  days_in_stage_avg_won: number
  stage_entered_date: string
  health_score: number
  status: 'Accelerating' | 'On Track' | 'At Risk' | 'Stalling'
  engagement_score: number
  commitment_score: number
  velocity_score: number
  stakeholder_score: number
  top_signal: string
  risk_flags: string[]
  next_action: string
  next_action_why: string
}

const statusConfig = {
  'Accelerating': { bg: 'bg-teal-500/10 border-teal-500/30',   text: 'text-teal-400',   dot: 'bg-teal-500',   label: 'Accelerating' },
  'On Track':     { bg: 'bg-blue-500/10 border-blue-500/30',    text: 'text-blue-400',   dot: 'bg-blue-500',   label: 'On Track'     },
  'At Risk':      { bg: 'bg-amber-500/10 border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-500',  label: 'At Risk'      },
  'Stalling':     { bg: 'bg-red-500/10 border-red-500/30',      text: 'text-red-400',    dot: 'bg-red-500',    label: 'Stalling'     },
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
  const color = score >= 75 ? 'bg-teal-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={11} className="text-slate-500" />
          <span className="text-xs text-slate-500">{label}</span>
        </div>
        <span className="text-xs font-semibold text-white">{score}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function DaysInStage({ deal }: { deal: ScoredDeal }) {
  const entered = new Date(deal.stage_entered_date)
  const now = new Date('2024-07-24')
  const days = Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24))
  const overdue = days > deal.days_in_stage_avg_won
  return (
    <div className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${overdue ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
      <Clock size={10} />
      Day {days} <span className="opacity-60">(avg win: {deal.days_in_stage_avg_won}d)</span>
    </div>
  )
}

export default function AccelerateTab() {
  const [loading, setLoading] = useState(false)
  const [deals, setDeals] = useState<ScoredDeal[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('All')

  async function scoreDeals() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/accelerate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scoring failed')
      setDeals(data.deals)
    } catch (e: any) {
      setError(e.message || 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  const statusCounts = deals.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalValue = deals.reduce((s, d) => s + d.deal_value, 0)
  const atRiskValue = deals.filter(d => d.status === 'At Risk' || d.status === 'Stalling').reduce((s, d) => s + d.deal_value, 0)

  const filtered = filter === 'All' ? deals : deals.filter(d => d.status === filter)

  return (
    <div>
      <p className="text-slate-400 text-sm mb-6">
        Score every live deal on engagement velocity, stakeholder breadth, commitment depth, and stage trajectory — then surface exactly what to do next.
      </p>

      {deals.length === 0 && (
        <div className="bg-navy-800 rounded-xl border border-slate-800 p-8 text-center">
          <TrendingUp size={40} className="text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Score your live pipeline</h3>
          <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
            SignalOps analyses every active deal across six health dimensions — engagement, stakeholder breadth, commitment depth, stage velocity, meeting momentum, and champion signal.
          </p>
          <p className="text-slate-600 text-xs mb-6 max-w-sm mx-auto">
            Every deal follows a pattern. When it deviates, that's your signal.
          </p>
          <button
            onClick={scoreDeals}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing pipeline...</> : 'Score live pipeline →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {deals.length > 0 && (
        <div>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-navy-800 rounded-lg p-3 border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Total pipeline</p>
              <p className="text-xl font-bold text-white">${(totalValue / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs text-red-400 mb-1">At risk value</p>
              <p className="text-xl font-bold text-red-400">${(atRiskValue / 1000).toFixed(0)}k</p>
            </div>
            {(['Accelerating', 'On Track', 'At Risk', 'Stalling'] as const).slice(0, 2).map(s => (
              <div key={s} className={`rounded-lg p-3 border ${statusConfig[s].bg}`}>
                <p className={`text-xs mb-1 ${statusConfig[s].text}`}>{s}</p>
                <p className="text-xl font-bold text-white">{statusCounts[s] ?? 0} deals</p>
              </div>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {['All', 'Stalling', 'At Risk', 'On Track', 'Accelerating'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === s ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}>
                {s} {s !== 'All' && statusCounts[s] ? `(${statusCounts[s]})` : ''}
              </button>
            ))}
            <button onClick={scoreDeals} className="ml-auto text-xs text-slate-500 hover:text-slate-300">↻ Re-score</button>
          </div>

          {/* Deal cards */}
          <div className="space-y-3">
            {filtered.map(deal => {
              const cfg = statusConfig[deal.status]
              const daysInStage = Math.floor((new Date('2024-07-24').getTime() - new Date(deal.stage_entered_date).getTime()) / (1000 * 60 * 60 * 24))
              const engagementRatio = deal.emails_received / Math.max(deal.emails_sent, 1)

              return (
                <div key={deal.id} className={`rounded-xl border p-4 transition-all ${cfg.bg}`}>
                  {/* Row header */}
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === deal.id ? null : deal.id)}>
                    {/* Health score */}
                    <div className="text-center w-14 flex-shrink-0">
                      <p className={`text-2xl font-bold ${cfg.text}`}>{deal.health_score}</p>
                      <p className="text-xs text-slate-600">health</p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white">{deal.company}</p>
                        <span className="text-xs text-slate-500">{deal.stage}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {deal.status}
                        </span>
                        <DaysInStage deal={deal} />
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{deal.contact} · {deal.title}</p>
                      <p className={`text-xs mt-1 ${deal.risk_flags.length > 0 ? 'text-amber-400' : 'text-teal-400'}`}>
                        {deal.top_signal}
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden md:flex flex-col gap-1 text-xs text-slate-500 flex-shrink-0 text-right">
                      <span>${(deal.deal_value / 1000).toFixed(0)}k</span>
                      <span className={engagementRatio >= 0.7 ? 'text-teal-400' : 'text-red-400'}>
                        {deal.emails_received}/{deal.emails_sent} emails
                      </span>
                      <span>{deal.prospect_contacts_engaged} contacts</span>
                    </div>

                    {expanded === deal.id ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
                  </div>

                  {/* Expanded */}
                  {expanded === deal.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">

                      {/* Next action callout */}
                      <div className="bg-navy-900 rounded-xl border border-teal-500/20 p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Zap size={14} className="text-teal-500" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Next action — do this today</p>
                            <p className="text-sm font-medium text-white mb-1">{deal.next_action}</p>
                            <p className="text-xs text-slate-500">{deal.next_action_why}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {/* Score breakdown */}
                        <div className="bg-navy-900 rounded-xl p-4 border border-slate-700">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Health breakdown</p>
                          <div className="space-y-3">
                            <ScoreBar label="Engagement velocity" score={deal.engagement_score}  icon={TrendingUp} />
                            <ScoreBar label="Stakeholder breadth" score={deal.stakeholder_score} icon={Users}       />
                            <ScoreBar label="Commitment depth"    score={deal.commitment_score}  icon={CheckCircle} />
                            <ScoreBar label="Stage velocity"      score={deal.velocity_score}    icon={Clock}       />
                          </div>
                        </div>

                        {/* Commitments */}
                        <div className="bg-navy-900 rounded-xl p-4 border border-slate-700">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Reciprocal commitments</p>
                          <div className="space-y-1.5">
                            {deal.reciprocal_commitments.map(c => (
                              <div key={c} className="flex items-center gap-2 text-sm text-slate-300">
                                <CheckCircle size={12} className="text-teal-500 flex-shrink-0" /> {c}
                              </div>
                            ))}
                          </div>
                          {deal.next_meeting_booked && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-teal-400">
                              <CheckCircle size={11} className="flex-shrink-0" /> Next meeting booked
                            </div>
                          )}
                        </div>

                        {/* Risk flags / engagement */}
                        <div className="bg-navy-900 rounded-xl p-4 border border-slate-700">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Engagement signals</p>
                          <div className="space-y-2 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Email ratio (in/out)</span>
                              <span className={engagementRatio >= 0.7 ? 'text-teal-400' : 'text-red-400'}>
                                {deal.emails_received}/{deal.emails_sent}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Calls answered</span>
                              <span className={deal.calls_answered / Math.max(deal.calls_attempted, 1) >= 0.5 ? 'text-teal-400' : 'text-amber-400'}>
                                {deal.calls_answered}/{deal.calls_attempted}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Contacts engaged</span>
                              <span className={deal.prospect_contacts_engaged >= 3 ? 'text-teal-400' : 'text-amber-400'}>
                                {deal.prospect_contacts_engaged}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Champion active</span>
                              <span className={deal.champion_active ? 'text-teal-400' : 'text-red-400'}>
                                {deal.champion_active ? 'Yes' : 'Gone quiet'}
                              </span>
                            </div>
                          </div>
                          {deal.risk_flags.length > 0 && (
                            <>
                              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Risk flags</p>
                              {deal.risk_flags.map(f => (
                                <div key={f} className="flex items-start gap-2 text-xs text-red-300 mb-1">
                                  <AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" /> {f}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
