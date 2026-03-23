'use client'
import { useState } from 'react'
import { Loader2, Award, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ICPResult {
  summary: string
  top_industries: string[]
  typical_size: string
  typical_stage: string
  avg_ltv: string
  key_traits: string[]
  red_flags: string[]
  best_count: number
}

export default function ICPProfile() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ICPResult | null>(null)
  const [error, setError] = useState('')

  async function analyseICP() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze-icp', { method: 'POST' })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Analysis failed. Check your ANTHROPIC_API_KEY is set in .env.local')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total accounts', value: '100' },
          { label: 'Active customers', value: '72' },
          { label: 'Churned', value: '9' },
          { label: 'At risk', value: '5' },
        ].map(stat => (
          <div key={stat.label} className="bg-navy-800 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analyse button */}
      {!result && (
        <div className="bg-navy-800 rounded-xl border border-slate-800 p-8 text-center">
          <Award size={40} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Build your ICP Profile</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            SignalOps analyses your 100 customer records — CRM data, billing outcomes, CS history —
            to identify the characteristics of your truly best customers.
          </p>
          <button
            onClick={analyseICP}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2 mx-auto"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing 100 accounts...</> : 'Analyse my ICP →'}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-navy-800 rounded-xl border border-teal-500/30 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 bg-teal-500 rounded-sm" />
              <h3 className="font-semibold text-white">Your best customer profile</h3>
              <span className="ml-auto text-xs text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded">
                {result.best_count} accounts analysed
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Profile specs */}
            <div className="bg-navy-800 rounded-xl border border-slate-800 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Profile</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Top industries</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.top_industries.map(i => (
                      <span key={i} className="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded">{i}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Company size</p>
                  <p className="text-sm text-white">{result.typical_size}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stage</p>
                  <p className="text-sm text-white">{result.typical_stage}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Average LTV</p>
                  <p className="text-sm text-white font-semibold">{result.avg_ltv}</p>
                </div>
              </div>
            </div>

            {/* Key traits */}
            <div className="bg-navy-800 rounded-xl border border-slate-800 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">What they have in common</h4>
              <ul className="space-y-2">
                {result.key_traits.map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red flags */}
            <div className="bg-navy-800 rounded-xl border border-slate-800 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Red flags to avoid</h4>
              <ul className="space-y-2">
                {result.red_flags.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={analyseICP}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ↻ Re-analyse
          </button>
        </div>
      )}
    </div>
  )
}
