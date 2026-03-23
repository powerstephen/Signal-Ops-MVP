'use client'
import { useState } from 'react'
import { Loader2, RefreshCw, Mail, ChevronDown, ChevronUp, Zap } from 'lucide-react'

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
  score_reasons: string[]
  why_now: string
}

interface EmailDraft {
  subject: string
  body: string
}

export default function RecoverTab() {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<ScoredAccount[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<string, EmailDraft>>({})
  const [emailLoading, setEmailLoading] = useState<string | null>(null)

  async function scoreAccounts() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/score-accounts', { method: 'POST' })
      if (!res.ok) throw new Error('Scoring failed')
      const data = await res.json()
      setAccounts(data.accounts)
    } catch {
      setError('Scoring failed. Check your ANTHROPIC_API_KEY is set.')
    } finally {
      setLoading(false)
    }
  }

  async function generateEmail(account: ScoredAccount) {
    setEmailLoading(account.id)
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account }),
      })
      if (!res.ok) throw new Error('Email generation failed')
      const data = await res.json()
      setEmails(prev => ({ ...prev, [account.id]: data }))
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Recover dormant accounts</h2>
        <p className="text-slate-400 text-sm">
          Surface old leads and churned accounts that match your best-customer profile and are worth re-engaging.
        </p>
      </div>

      {accounts.length === 0 && (
        <div className="bg-navy-800 rounded-xl border border-slate-800 p-8 text-center">
          <RefreshCw size={40} className="text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Score your dormant accounts</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            SignalOps compares every dormant account against your ICP profile and scores them
            on best-customer fit, timing, and re-engagement potential.
          </p>
          <button
            onClick={scoreAccounts}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Scoring accounts...</> : 'Score dormant accounts →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {accounts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">{accounts.length} accounts scored — sorted by ICP fit</p>
            <button onClick={scoreAccounts} className="text-xs text-slate-500 hover:text-slate-300">↻ Re-score</button>
          </div>

          {accounts.map(account => (
            <div key={account.id} className={`rounded-xl border p-4 transition-all ${scoreBg(account.icp_score)}`}>
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
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      account.status === 'churned' ? 'bg-red-500/10 text-red-400' :
                      account.status === 'lost' ? 'bg-slate-700 text-slate-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>{account.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{account.contact} · {account.title}</p>
                  <p className="text-xs text-teal-400 mt-1">{account.why_now}</p>
                </div>

                {/* Meta */}
                <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                  <span>{account.employees} employees</span>
                  <span>{account.stage}</span>
                  <span>Last: {new Date(account.last_contact).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}</span>
                </div>

                {expanded === account.id ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
              </div>

              {/* Expanded detail */}
              {expanded === account.id && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Why this account scores well</p>
                      <ul className="space-y-1">
                        {account.score_reasons.map(r => (
                          <li key={r} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">✓</span> {r}
                          </li>
                        ))}
                      </ul>
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

                  {/* Email section */}
                  {!emails[account.id] ? (
                    <button
                      onClick={() => generateEmail(account)}
                      disabled={emailLoading === account.id}
                      className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors border border-slate-700"
                    >
                      {emailLoading === account.id
                        ? <><Loader2 size={14} className="animate-spin" /> Generating email...</>
                        : <><Mail size={14} /> Generate outreach email</>
                      }
                    </button>
                  ) : (
                    <div className="bg-navy-900 rounded-lg p-4 border border-slate-700 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal-grounded outreach</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(`Subject: ${emails[account.id].subject}\n\n${emails[account.id].body}`)}
                          className="text-xs text-teal-400 hover:text-teal-300"
                        >
                          Copy →
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Subject:</p>
                      <p className="text-sm font-medium text-white mb-3">{emails[account.id].subject}</p>
                      <p className="text-xs text-slate-500 mb-1">Body:</p>
                      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{emails[account.id].body}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
