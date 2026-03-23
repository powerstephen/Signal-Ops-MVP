import { NextResponse } from 'next/server'
import { getBestCustomers } from '@/lib/data'

export async function POST() {
  try {
    const best = getBestCustomers()

    const bestProfile = best.slice(0, 15).map(c => ({
      company: c.company, industry: c.industry, employees: c.employees,
      stage: c.stage, country: c.country, ltv: c.ltv,
      months_active: c.months_active, expanded: c.expanded,
      support_tickets: c.support_tickets, time_to_value_days: c.time_to_value_days, nps: c.nps,
    }))

    const prompt = `You are a revenue intelligence analyst helping a B2B SaaS company find net-new prospects.

Based on these best customers (highest LTV, retained, expanded, low support cost):
${JSON.stringify(bestProfile, null, 2)}

Generate 8 realistic net-new prospect companies that closely match this profile and are showing active buying signals.

Return a JSON object with a prospects array:
{
  "prospects": [
    {
      "company": "Company Name",
      "industry": "Industry",
      "employees": "45-60",
      "stage": "Series A",
      "country": "USA",
      "contact_name": "First Last",
      "contact_title": "VP Sales",
      "icp_match_score": 88,
      "active_signals": ["Hired 3 SDRs in last 45 days", "Series A announced $8M", "New VP Sales hired 6 weeks ago"],
      "why_now": "Building outbound motion from scratch after Series A — exact moment your product is most valuable",
      "lookalike_reason": "Matches profile of your top 5 customers: SaaS, Series A, 40-60 employees, outbound-first growth motion"
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
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return NextResponse.json({ prospects: parsed.prospects })
  } catch (error) {
    console.error('Prospect generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
