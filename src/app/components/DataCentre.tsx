'use client'
import { useState } from 'react'
import { CheckCircle, Plus, Search } from 'lucide-react'
import { useImport } from '../context/ImportContext'
import ImportModal from './ImportModal'

interface Dataset {
  label: string
  records: number
  fields: string[]
}

interface Integration {
  id: string
  name: string
  category: string
  icon: string
  description: string
  comingSoon?: boolean
  datasets?: Dataset[]
}

const integrations: Integration[] = [
  { id:'gsheets',    name:'Google Sheets', category:'Spreadsheets', icon:'📗', description:'Import CRM and customer data from your Google Sheets.', datasets:[{label:'CRM Contacts',records:200,fields:['company','contact','title','industry','stage','deal_value','status']},{label:'Active Customers',records:20,fields:['company','mrr','ltv','plan','seats','health_score','renewal_date']}] },
  { id:'csv',        name:'CSV Upload',    category:'Spreadsheets', icon:'📄', description:'Upload any CSV export from your CRM, billing system, or CS platform.', datasets:[{label:'CS History',records:20,fields:['company','tickets','sentiment','time_to_value','health_trend','risk_flags']}] },
  { id:'hubspot',    name:'HubSpot',       category:'CRM',          icon:'🟠', description:'Sync contacts, deals, and pipeline data automatically.', datasets:[{label:'CRM Contacts',records:200,fields:['company','contact','deal_stage','deal_value','last_activity']}] },
  { id:'salesforce', name:'Salesforce',    category:'CRM',          icon:'🔵', description:'Connect your Salesforce org to sync leads and opportunities.', comingSoon:true },
  { id:'attio',      name:'Attio',         category:'CRM',          icon:'🟣', description:'Powerful CRM integration to track deal flow in real-time.', comingSoon:true },
  { id:'pipedrive',  name:'Pipedrive',     category:'CRM',          icon:'🟢', description:'Pull deal stages and contact activity from Pipedrive.', comingSoon:true },
  { id:'stripe',     name:'Stripe',        category:'Billing',      icon:'💳', description:'Connect Stripe to analyse real LTV, MRR, churn, and expansion by customer.', datasets:[{label:'Billing Data',records:20,fields:['customer','mrr','ltv','plan','churn_date','expansion']}] },
  { id:'chargebee',  name:'Chargebee',     category:'Billing',      icon:'📊', description:'Import subscription billing data to power your best-customer ICP profile.', datasets:[{label:'Subscription Data',records:20,fields:['company','mrr','arr','plan','seats','renewal_date']}] },
  { id:'paddle',     name:'Paddle',        category:'Billing',      icon:'🏓', description:'Sync Paddle billing events and revenue data for LTV analysis.', comingSoon:true },
  { id:'intercom',   name:'Intercom',      category:'CS',           icon:'💬', description:'Pull support ticket volume, type, and sentiment to identify high-maintenance accounts.', datasets:[{label:'CS Tickets',records:20,fields:['company','tickets','ticket_type','sentiment','response_time','health_trend']}] },
  { id:'zendesk',    name:'Zendesk',       category:'CS',           icon:'🎫', description:'Import CS ticket history to surface which customers are truly profitable.', datasets:[{label:'Support History',records:20,fields:['company','open_tickets','sentiment','risk_flags','csm']}] },
  { id:'freshdesk',  name:'Freshdesk',     category:'CS',           icon:'🌿', description:'Connect Freshdesk to analyse support cost per customer.', comingSoon:true },
  { id:'airtable',   name:'Airtable',      category:'Spreadsheets', icon:'🟥', description:'Bi-directional sync with Airtable bases.', comingSoon:true },
  { id:'outreach',   name:'Outreach',      category:'Outreach',     icon:'📤', description:'Push scored accounts and emails directly to Outreach sequences.', comingSoon:true },
  { id:'salesloft',  name:'Salesloft',     category:'Outreach',     icon:'📨', description:'Send high-scoring accounts straight to Salesloft.', comingSoon:true },
  { id:'apollo',     name:'Apollo',        category:'Outreach',     icon:'🚀', description:'Export lookalike prospects to Apollo campaigns.', comingSoon:true },
  { id:'linkedin',   name:'LinkedIn',      category:'Signals',      icon:'🔗', description:'Monitor job changes and hiring signals.', comingSoon:true },
  { id:'harmonic',   name:'Harmonic',      category:'Signals',      icon:'📡', description:'Pull funding, headcount, and hiring signal data.', comingSoon:true },
  { id:'bombora',    name:'Bombora',       category:'Signals',      icon:'🎯', description:'Layer intent signal data to identify in-market accounts.', comingSoon:true },
]

const categories = ['All','CRM','Billing','CS','Spreadsheets','Outreach','Signals']
const catColors: Record<string, string> = {
  CRM:'bg-blue-500/10 text-blue-400',
  Billing:'bg-teal-500/10 text-teal-400',
  CS:'bg-purple-500/10 text-purple-400',
  Spreadsheets:'bg-green-500/10 text-green-400',
  Outreach:'bg-amber-500/10 text-amber-400',
  Signals:'bg-red-500/10 text-red-400',
}

export default function DataCentre() {
  const { sources, removeSource } = useImport()
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [importing, setImporting] = useState<Integration | null>(null)

  const isConn = (id: string) =>
    integrations.find(i => i.id === id)?.datasets?.some(ds =>
      sources.some(s => s.id === `${id}-${ds.label.toLowerCase().replace(/\s/g, '-')}`)
    ) ?? false

  const connCount = integrations.filter(i => isConn(i.id)).length

  const filtered = integrations.filter(i => {
    const mc = activeCat === 'All' || i.category === activeCat
    const ms = i.name.toLowerCase().includes(search.toLowerCase()) ||
               i.description.toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  const handleImportComplete = (ig: Integration) => {
    if (!ig.datasets) return
    setImporting(ig)
  }

  const handleDisconnect = (ig: Integration) => {
    ig.datasets?.forEach(ds =>
      removeSource(`${ig.id}-${ds.label.toLowerCase().replace(/\s/g, '-')}`)
    )
  }

  return (
    <div>
      {importing && importing.datasets && (
        <ImportModal
          source={{ id: importing.id, name: importing.name, icon: importing.icon, datasets: importing.datasets }}
          onClose={() => setImporting(null)}
          onComplete={() => setImporting(null)}
        />
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Data Centre</h2>
          <p className="text-slate-400 text-sm">
            Connect your data sources.{' '}
            {connCount > 0
              ? <span className="text-teal-400 font-medium">{connCount} source{connCount !== 1 ? 's' : ''} active.</span>
              : <span className="text-slate-500">No sources connected yet.</span>
            }
          </p>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {sources.map(s => (
            <div key={s.id} className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3">
              <p className="text-xs text-teal-400 font-semibold mb-0.5 truncate">{s.name}</p>
              <p className="text-xl font-bold text-white">{s.records.toLocaleString()}</p>
              <p className="text-xs text-slate-500">records</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-navy-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCat === c ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(ig => {
          const conn = isConn(ig.id)
          return (
            <div key={ig.id} className={`bg-navy-800 rounded-xl border p-4 flex flex-col transition-all ${conn ? 'border-teal-500/30' : 'border-slate-800'} ${ig.comingSoon ? 'opacity-55' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">{ig.icon}</div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${catColors[ig.category] ?? 'bg-slate-700 text-slate-400'}`}>{ig.category}</span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{ig.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">{ig.description}</p>
              {ig.comingSoon
                ? <div className="text-xs text-slate-600 border border-slate-700 rounded-lg px-3 py-2 text-center">Coming soon</div>
                : conn
                  ? <button onClick={() => handleDisconnect(ig)} className="flex items-center justify-center gap-1.5 text-xs font-medium text-teal-400 border border-teal-500/30 bg-teal-500/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 rounded-lg px-3 py-2 transition-colors w-full">
                      <CheckCircle size={13} /> Connected
                    </button>
                  : <button onClick={() => handleImportComplete(ig)} disabled={!ig.datasets} className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg px-3 py-2 transition-colors w-full">
                      <Plus size={13} /> Connect
                    </button>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
