'use client'
import { useState } from 'react'
import { Loader2, Zap, CheckCircle, AlertCircle, Mail } from 'lucide-react'

interface ProspectAccount {
  company: string
  industry: string
  employees: string
  stage: string
  country: string
  contact_name: string
  contact_title: string
  icp_match_score: number
  active_signals: string[]
  why_now: string
  lookalike_reason: string
}

interface EmailDraft { subject: string; body: string }

export default function GenerateTab() {
  const [loading, setLoading] = useState(false)
  const [prospects, setProspects] = useState<ProspectAccount[]>([])
  const [error, setError] = useState('')
  const [emails, setEmails] = useState<Record<string, EmailDraft>>({})
  const [emailLoading, setEmailLoading] = useState<string | null>(null)

  async function generateProspects() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-prospects', { method: 'POST' })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setProspects(data.prospects)
    } catch {
      setError('Generation failed. Check your ANTHROPIC_API_KEY is set.')
    } finally {
      setLoading(false)
    }
  }

  async function generateEmail(prospect: ProspectAccount) {
    const key = prospect.company
    setEmailLoading(key)
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: prospect, type: 'prospect' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEmails(prev => ({ ...prev, [key]: data }))
    } catch {
      console.error('Email failed')
    } finally {
      setEmailLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Generate net-new pipeline</h2>
        <p className="text-slate-400 text-sm">
          Based on your best-customer profile, SignalOps identifies net-new companies that match your highest-LTV,
          lowest-support-cost customers — and are showing live buying signals right now.
        </p>
      </div>

      {prospects.length === 0 && (
        <div className="bg-navy-800 rounded-xl border border-slate-800 p-8 text-center">
          <Zap size={40} className="text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Find your next best customers</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            SignalOps uses your ICP profile to generate a shortlist of net-new companies that look like your
            best customers and are showing active buying signals today.
          </p>
          <button
            onClick={generateProspects}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Building prospect list...</>
              : 'Generate prospect list →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {prospects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">{prospects.length} net-new accounts identified</p>
            <button onClick={generateProspects} className="text-xs text-slate-500 hover:text-slate-300">↻ Regenerate</button>
          </div>

          {prospects.map((p, i) => (
            <div key={i} className="bg-navy-800 rounded-xl border border-slate-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{p.company}</h3>
                    <span className="text-xs text-slate-500">{p.industry}</span>
                    <span className="text-xs bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">{p.icp_match_score}% ICP match</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{p.contact_name} · {p.contact_title}</p>
                </div>
                <div className="text-right text-xs text-slate-500 flex-shrink-0">
                  <p>{p.employees} employees</p>
                  <p>{p.stage} · {p.country}</p>
                </div>
              </div>

              {/* Signals */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active signals</p>
                <div className="flex flex-wrap gap-2">
                  {p.active_signals.map(s => (
                    <span key={s} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <Zap size={10} /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why now + lookalike */}
              <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-navy-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Why now</p>
                  <p className="text-slate-300">{p.why_now}</p>
                </div>
                <div className="bg-navy-900 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Lookalike reason</p>
                  <p className="text-slate-300">{p.lookalike_reason}</p>
                </div>
              </div>

              {/* Email */}
              {!emails[p.company] ? (
                <button
                  onClick={() => generateEmail(p)}
                  disabled={emailLoading === p.company}
                  className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors border border-slate-700"
                >
                  {emailLoading === p.company
                    ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                    : <><Mail size={14} /> Generate outreach email</>
                  }
                </button>
              ) : (
                <div className="bg-navy-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal-grounded outreach</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(`Subject: ${emails[p.company].subject}\n\n${emails[p.company].body}`)}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >Copy →</button>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">Subject:</p>
                  <p className="text-sm font-medium text-white mb-3">{emails[p.company].subject}</p>
                  <p className="text-xs text-slate-500 mb-1">Body:</p>
                  <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{emails[p.company].body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
