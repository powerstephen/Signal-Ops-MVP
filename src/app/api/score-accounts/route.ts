import { NextResponse } from 'next/server'
import { getAllCustomers, getBestCustomers } from '@/lib/data'

export async function POST() {
  try {
    const all = getAllCustomers()
    const best = getBestCustomers()

    const bestProfile = {
      avg_employees: Math.round(best.reduce((s, c) => s + c.employees, 0) / best.length),
      top_industries: Array.from(new Set(best.slice(0, 10).map(c => c.industry))).slice(0, 5),
      top_stages: Array.from(new Set(best.map(c => c.stage))),
      avg_ltv: Math.round(best.reduce((s, c) => s + c.ltv, 0) / best.length),
    }

    const now = new Date()
    const dormant = all.filter(c => {
      const last = new Date(c.last_contact)
      const monthsAgo = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsAgo > 5 || c.status === 'churned' || c.status === 'lost' || c.deal_stage === 'closed_lost'
    }).slice(0, 25)

    const prompt = `You are a revenue intelligence analyst. Score these dormant/inactive accounts against the ICP profile.

BEST CUSTOMER PROFILE:
${JSON.stringify(bestProfile, null, 2)}

DORMANT ACCOUNTS TO SCORE:
${JSON.stringify(dormant.map(c => ({
  id: c.id, company: c.company, industry: c.industry, employees: c.employees,
  stage: c.stage, country: c.country, contact: c.contact, title: c.title,
  status: c.status, last_contact: c.last_contact, ltv: c.ltv,
  deal_value: c.deal_value, support_tickets: c.support_tickets,
})), null, 2)}

For each account, assign an ICP match score 0-100 based on similarity to the best customer profile.

Return a JSON object with an accounts array:
{
  "accounts": [
    {
      "id": "c001",
      "icp_score": 85,
      "score_label": "Strong fit",
      "score_reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "why_now": "One sentence signal-based reason to re-engage right now"
    }
  ]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    const scores = parsed.accounts

    const scored = scores
      .map((score: any) => {
        const account = dormant.find(d => d.id === score.id)
        if (!account) return null
        return { ...account, ...score }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.icp_score - a.icp_score)

    return NextResponse.json({ accounts: scored })
  } catch (error) {
    console.error('Scoring error:', error)
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
