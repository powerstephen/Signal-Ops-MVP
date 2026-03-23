'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="SignalOps" className="h-12" />
        </div>

        {/* Category pill */}
        <div className="inline-block mb-6">
          <span className="text-xs font-semibold tracking-widest text-teal-500 border border-teal-500 px-3 py-1 rounded-sm uppercase">
            Revenue Intelligence Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
          Know your best customer.<br />Find more of them.
        </h1>

        <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
          Precision targeting, powered by your own revenue data.
          Connect your CRM, billing, and CS data to surface the accounts most likely to become your next best customers.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3 rounded transition-colors text-base"
        >
          Open Dashboard →
        </button>

        {/* Trust line */}
        <p className="text-slate-600 text-sm mt-6">
          Demo loaded with 100 real SaaS company profiles
        </p>
      </div>
    </main>
  )
}
