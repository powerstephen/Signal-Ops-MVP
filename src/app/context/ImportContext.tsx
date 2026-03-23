'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface ConnectedSource {
  id: string
  name: string
  type: 'crm' | 'billing' | 'cs' | 'spreadsheet'
  records: number
  label: string
  connectedAt: string
}

interface ImportContextType {
  sources: ConnectedSource[]
  addSource: (source: ConnectedSource) => void
  removeSource: (id: string) => void
  totalRecords: number
  isConnected: (id: string) => boolean
}

const ImportContext = createContext<ImportContextType>({
  sources: [],
  addSource: () => {},
  removeSource: () => {},
  totalRecords: 0,
  isConnected: () => false,
})

export function ImportProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<ConnectedSource[]>([])

  const addSource = (source: ConnectedSource) => {
    setSources(prev => {
      if (prev.find(s => s.id === source.id)) return prev
      return [...prev, source]
    })
  }

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id))
  }

  const totalRecords = sources.reduce((sum, s) => sum + s.records, 0)
  const isConnected = (id: string) => sources.some(s => s.id === id)

  return (
    <ImportContext.Provider value={{ sources, addSource, removeSource, totalRecords, isConnected }}>
      {children}
    </ImportContext.Provider>
  )
}

export const useImport = () => useContext(ImportContext)
