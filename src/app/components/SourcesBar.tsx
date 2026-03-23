'use client'
import { Database, CheckCircle, AlertCircle } from 'lucide-react'
import { useImport } from '../context/ImportContext'

const typeColors: Record<string, string> = {
  crm:         'text-blue-400 bg-blue-500/10',
  billing:     'text-teal-400 bg-teal-500/10',
  cs:          'text-purple-400 bg-purple-500/10',
  spreadsheet: 'text-green-400 bg-green-500/10',
}

export default function SourcesBar() {
  const { sources, totalRecords } = useImport()

  if (sources.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-2.5 mb-6">
        <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-400">
          No data sources connected yet. Go to <span className="font-semibold">Data Centre</span> to import your CRM, billing, or CS data.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-teal-500/5 border border-teal-500/20 rounded-lg px-4 py-2.5 mb-6 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Database size={13} className="text-teal-500" />
        <span className="text-xs font-semibold text-teal-400">{totalRecords.toLocaleString()} records</span>
      </div>
      <span className="text-slate-700 text-xs">|</span>
      <div className="flex items-center gap-2 flex-wrap">
        {sources.map(s => (
          <span key={s.id} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${typeColors[s.type] ?? 'text-slate-400 bg-slate-700'}`}>
            <CheckCircle size={10} />
            {s.name} ({s.records.toLocaleString()})
          </span>
        ))}
      </div>
    </div>
  )
}
