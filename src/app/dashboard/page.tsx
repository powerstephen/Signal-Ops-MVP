'use client'
import { useState } from 'react'
import { Target, RefreshCw, Zap, Database } from 'lucide-react'
import ICPProfile from '../components/ICPProfile'
import RecoverTab from '../components/RecoverTab'
import GenerateTab from '../components/GenerateTab'
import DataCentre from '../components/DataCentre'
import SourcesBar from '../components/SourcesBar'
import { ImportProvider } from '../context/ImportContext'

type Tab = 'icp' | 'recover' | 'generate' | 'data'

function DashboardInner() {
  const [activeTab, setActiveTab] = useState<Tab>('data')
  const tabs = [
    { id: 'data'     as Tab, label: 'Data Centre', icon: Database  },
    { id: 'icp'      as Tab, label: 'ICP Profile',  icon: Target    },
    { id: 'recover'  as Tab, label: 'Recover',      icon: RefreshCw },
    { id: 'generate' as Tab, label: 'Generate',     icon: Zap       },
  ]

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Nav — logo + tagline + status all in one clean bar */}
      <nav className="border-b border-slate-800 px-6 py-0 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SignalOps" className="h-9" />
          <span className="hidden md:block text-xs text-slate-600 border-l border-slate-800 pl-4">
            Precision targeting, powered by your own revenue data.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">Demo</span>
          <span className="text-xs text-slate-500">Koreva · B2B SaaS</span>
          <div className="w-2 h-2 rounded-full bg-teal-500" />
        </div>
      </nav>

      {/* Tab bar — directly under nav, no page title taking up space */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 border-b border-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  active ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={15} />{tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-7">
        {activeTab !== 'data' && <SourcesBar />}
        {activeTab === 'data'     && <DataCentre />}
        {activeTab === 'icp'      && <ICPProfile />}
        {activeTab === 'recover'  && <RecoverTab />}
        {activeTab === 'generate' && <GenerateTab />}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <ImportProvider><DashboardInner /></ImportProvider>
}
