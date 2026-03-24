'use client'
import { useState } from 'react'
import { Loader2, RefreshCw, Mail, ChevronDown, ChevronUp, Zap, Tag, ArrowRight } from 'lucide-react'

interface ScoredAccount {
  id: string
  company: string
  industry: string
  employees: number
  stage: string
  country: string
  contact: string
  title: string
  status: string
  last_contact: string
  ltv: number
  icp_score: number
  score_label: string
  segment: string
  segment_reason: string
  score_reasons: string[]
  why_now: string
  reengagement_angle: string
}

interface EmailSequence {
  email1: { subject: string; body: string; send_timing: string; goal: string }
  email2: { subject: string; body: string; send_timing: string; goal: string }
  email3: { subject: string; body: string; send_timing: string; goal: string }
  subject?: string
  body?: string
}

const segmentColors: Record<string, string> = {
  'Late-stage ghosted':     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Early-stage browser':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Churned — recoverable':  'bg-red-500/10 text-red-400 border-red-500/20',
  'Lost deal':              'bg-slate-700 text-slate-400 border-slate-600',
  'Timing issue':           'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const segmentTips: Record<string, string> = {
  'Late-stage ghosted':    'Lead with a new feature or capability they asked about. Reference the specific proposal.',
  'Early-stage browser':   'Share a quick win case study from a similar company. Keep it under 90 words.',
  'Churned — recoverable': 'Acknowledge what went wrong, show what\'s changed. No hard sell.',
  'Lost deal':             'Ask what made them choose another solution. Position new differentiators.',
  'Timing issue':          'Q1 budgets are open. Use the timing signal as your hook.',
}

export default function RecoverTab() {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<ScoredAccount[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sequences, setSequences] = useState<Record<string, EmailSequence>>({})
  const [emailLoading, setEmailLoading] = useState<string | null>(null)
  const [activeEmail, setActiveEmail] = useState<Record<string, 'email1' | 'email2' | 'email3'>>({})

  async function scoreAccounts() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/score-accounts', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scoring failed')
      setAccounts(data.accounts)
    } catch (e: any) {
      setError(e.message || 'Scoring failed — check Vercel function logs for details')
    } finally {
      setLoading(false)
    }
  }

  async function generateSequence(account: ScoredAccount) {
    setEmailLoading(account.id)
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account }),
      })
      if (!res.ok) throw new Error('Email generation failed')
      const data = await res.json()
      setSequences(prev => ({ ...prev, [account.id]: data }))
      setActiveEmail(prev => ({ ...prev, [account.id]: 'email1' }))
    } catch {
      console.error('Email generation failed')
    } finally {
      setEmailLoading(null)
    }
  }

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-teal-400' : score >= 60 ? 'text-amber-400' : 'text-slate-400'

  const scoreBg = (score: number) =>
    score >= 80 ? 'border-teal-500/30 bg-teal-500/5' : score >= 60 ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700 bg-navy-800'

  // Group accounts by segment for the summary
  const segmentCounts = accounts.reduce((acc, a) => {
    acc[a.segment] = (acc[a.segment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <p className="text-slate-400 text-sm mb-6">
        Surface dormant accounts that match your best-customer profile, segmented by why they went cold — with a tailored 3-email sequence for each.
      </p>

      {accounts.length === 0 && (
        <div className="bg-navy-800 rounded-xl border border-slate-800 p-8 text-center">
          <RefreshCw size={40} className="text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Score your dormant accounts</h3>
          <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
            SignalOps analyses every dormant account, scores them on ICP fit, and segments them by why they went cold — so your outreach hits the right nerve every time.
          </p>
          <p className="text-slate-600 text-xs mb-6 max-w-sm mx-auto">
            Different accounts went cold for different reasons. Generic "just checking in" emails don't work. Segmented, signal-grounded sequences do.
          </p>
          <button
            onClick={scoreAccounts}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing dormant accounts...</> : 'Score & segment dormant accounts →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4 max-w-lg mx-auto">{error}</p>}
        </div>
      )}

      {accounts.length > 0 && (
        <div>
          {/* Segment summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
            {Object.entries(segmentCounts).map(([seg, count]) => (
              <div key={seg} className={`rounded-lg border px-3 py-2 text-center ${segmentColors[seg] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs leading-tight mt-0.5">{seg}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">{accounts.length} accounts scored and segmented — sorted by ICP fit</p>
            <button onClick={scoreAccounts} className="text-xs text-slate-500 hover:text-slate-300">↻ Re-score</button>
          </div>

          <div className="space-y-3">
            {accounts.map(account => (
              <div key={account.id} className={`rounded-xl border p-4 transition-all ${scoreBg(account.icp_score)}`}>
                {/* Row header */}
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === account.id ? null : account.id)}
                >
                  {/* Score */}
                  <div className="text-center w-12 flex-shrink-0">
                    <p className={`text-2xl font-bold ${scoreColor(account.icp_score)}`}>{account.icp_score}</p>
                    <p className="text-xs text-slate-600">score</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{account.company}</p>
                      <span className="text-xs text-slate-500">{account.industry}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${segmentColors[account.segment] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {account.segment}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{account.contact} · {account.title}</p>
                    <p className="text-xs text-teal-400 mt-1">{account.why_now}</p>
                  </div>

                  {/* Meta */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                    <span>{account.employees} emp</span>
                    <span>{account.stage}</span>
                    <span>Last: {new Date(account.last_contact).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}</span>
                  </div>

                  {expanded === account.id
                    ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" />
                    : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
                  }
                </div>

                {/* Expanded */}
                {expanded === account.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">

                    {/* Segment tip */}
                    {segmentTips[account.segment] && (
                      <div className={`rounded-lg border px-4 py-2.5 mb-4 flex items-start gap-2 ${segmentColors[account.segment] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        <Tag size={13} className="mt-0.5 flex-shrink-0" />
                        <p className="text-xs"><span className="font-semibold">{account.segment} playbook:</span> {segmentTips[account.segment]}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Why this scores well</p>
                        <ul className="space-y-1">
                          {account.score_reasons?.map(r => (
                            <li key={r} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-teal-500 mt-0.5">✓</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Re-engagement angle</p>
                        <p className="text-sm text-slate-300">{account.reengagement_angle}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Account details</p>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p>Country: <span className="text-white">{account.country}</span></p>
                          <p>LTV when active: <span className="text-white">${account.ltv?.toLocaleString() ?? '—'}</span></p>
                          <p>Last contact: <span className="text-white">{new Date(account.last_contact).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Email sequence */}
                    {!sequences[account.id] ? (
                      <button
                        onClick={() => generateSequence(account)}
                        disabled={emailLoading === account.id}
                        className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors border border-slate-700"
                      >
                        {emailLoading === account.id
                          ? <><Loader2 size={14} className="animate-spin" /> Generating 3-email sequence...</>
                          : <><Mail size={14} /> Generate 3-email re-engagement sequence</>
                        }
                      </button>
                    ) : (
                      <div className="bg-navy-900 rounded-xl border border-slate-700 overflow-hidden">
                        {/* Sequence tabs */}
                        <div className="flex border-b border-slate-700">
                          {(['email1', 'email2', 'email3'] as const).map((key, i) => {
                            const seq = sequences[account.id]
                            const email = seq[key]
                            const active = (activeEmail[account.id] ?? 'email1') === key
                            return (
                              <button
                                key={key}
                                onClick={() => setActiveEmail(prev => ({ ...prev, [account.id]: key }))}
                                className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${active ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                              >
                                Email {i + 1} · {email?.goal ?? ''}
                              </button>
                            )
                          })}
                        </div>

                        {/* Active email */}
                        {(() => {
                          const key = activeEmail[account.id] ?? 'email1'
                          const seq = sequences[account.id]
                          const email = seq[key]
                          if (!email) return null
                          return (
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">{email.send_timing}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)}
                                  className="text-xs text-teal-400 hover:text-teal-300"
                                >
                                  Copy →
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 mb-1">Subject:</p>
                              <p className="text-sm font-medium text-white mb-3">{email.subject}</p>
                              <p className="text-xs text-slate-500 mb-1">Body:</p>
                              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{email.body}</p>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
