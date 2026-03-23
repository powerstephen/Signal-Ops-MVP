'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, X, Database, FileText } from 'lucide-react'
import { useImport, ConnectedSource } from '../context/ImportContext'

interface ImportModalProps {
  source: {
    id: string
    name: string
    type: 'crm' | 'billing' | 'cs' | 'spreadsheet'
    icon: string
    datasets: { label: string; records: number; fields: string[] }[]
  }
  onClose: () => void
  onComplete: () => void
}

const steps = [
  'Connecting to data source...',
  'Authenticating credentials...',
  'Detecting data schema...',
  'Mapping fields...',
  'Ingesting records...',
  'Building relationship graph...',
  'Finalising import...',
]

export default function ImportModal({ source, onClose, onComplete }: ImportModalProps) {
  const { addSource } = useImport()
  const [phase, setPhase] = useState<'preview' | 'importing' | 'done'>('preview')
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [recordCount, setRecordCount] = useState(0)
  const totalRecords = source.datasets.reduce((s, d) => s + d.records, 0)

  function startImport() {
    setPhase('importing')
    setProgress(0)
    setStepIndex(0)
    setRecordCount(0)

    // Animate progress bar and steps
    const duration = 3200
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(elapsed / duration, 1)
      setProgress(Math.round(pct * 100))
      setRecordCount(Math.round(pct * totalRecords))
      setStepIndex(Math.min(Math.floor(pct * steps.length), steps.length - 1))

      if (pct < 1) {
        requestAnimationFrame(tick)
      } else {
        // Register all datasets as connected sources
        source.datasets.forEach(ds => {
          addSource({
            id: `${source.id}-${ds.label.toLowerCase().replace(/\s/g, '-')}`,
            name: `${source.name} — ${ds.label}`,
            type: source.type,
            records: ds.records,
            label: ds.label,
            connectedAt: new Date().toISOString(),
          })
        })
        setPhase('done')
      }
    }
    requestAnimationFrame(tick)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-navy-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
              {source.icon}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{source.name}</p>
              <p className="text-xs text-slate-500">Data import</p>
            </div>
          </div>
          {phase !== 'importing' && (
            <button onClick={onClose}>
              <X size={18} className="text-slate-400 hover:text-white" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* PHASE: PREVIEW */}
          {phase === 'preview' && (
            <>
              <p className="text-slate-400 text-sm mb-4">
                The following datasets will be imported into SignalOps and used to build your ICP profile.
              </p>
              <div className="space-y-3 mb-6">
                {source.datasets.map(ds => (
                  <div key={ds.label} className="bg-navy-900 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white text-sm">{ds.label}</p>
                      <span className="text-xs text-teal-400 font-semibold">{ds.records.toLocaleString()} records</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ds.fields.map(f => (
                        <span key={f} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={startImport}
                className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Import {totalRecords.toLocaleString()} records →
              </button>
            </>
          )}

          {/* PHASE: IMPORTING */}
          {phase === 'importing' && (
            <>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-300 font-medium">{steps[stepIndex]}</p>
                  <p className="text-sm text-teal-400 font-semibold">{progress}%</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-navy-900 rounded-xl p-4 border border-slate-700 font-mono text-xs text-slate-400 space-y-1.5 mb-4 min-h-[100px]">
                {steps.slice(0, stepIndex + 1).map((s, i) => (
                  <p key={i} className={i === stepIndex ? 'text-teal-400' : 'text-slate-600'}>
                    {i < stepIndex ? '✓ ' : '→ '}{s}
                  </p>
                ))}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white">{recordCount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">records ingested of {totalRecords.toLocaleString()}</p>
              </div>
            </>
          )}

          {/* PHASE: DONE */}
          {phase === 'done' && (
            <>
              <div className="text-center py-4 mb-5">
                <div className="w-14 h-14 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-teal-500" />
                </div>
                <p className="font-semibold text-white text-lg mb-1">Import complete</p>
                <p className="text-slate-400 text-sm">{totalRecords.toLocaleString()} records ingested successfully</p>
              </div>

              <div className="space-y-2 mb-5">
                {source.datasets.map(ds => (
                  <div key={ds.label} className="flex items-center justify-between bg-navy-900 rounded-lg px-4 py-2.5 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-teal-500" />
                      <span className="text-sm text-white">{ds.label}</span>
                    </div>
                    <span className="text-xs text-teal-400 font-semibold">{ds.records.toLocaleString()} records</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                View dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
