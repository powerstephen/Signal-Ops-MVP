import { NextResponse } from 'next/server'
import pipelineDeals from '../../../../data/pipeline-deals.json'

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 })
    }

    const deals = pipelineDeals

    const prompt = `You are a senior sales intelligence analyst. Score each active pipeline deal on health and identify which are accelerating, on track, at risk, or stalling.

For each deal, analyse:
1. ENGAGEMENT VELOCITY: ratio of emails/calls received vs sent (bidirectional = healthy, one-way = bad)
2. STAKEHOLDER BREADTH: number of prospect contacts engaged (multi-threaded = healthy)
3. MEETING MOMENTUM: next meeting booked, frequency trend
4. RECIPROCAL COMMITMENTS: depth of commitments made by prospect (trial, data connected, legal review, exec engaged)
5. STAGE VELOCITY: days in current stage vs days_in_stage_avg_won (overdue = at risk)
6. CHAMPION SIGNAL: is the champion still active and responsive

DEALS TO ANALYSE:
${JSON.stringify(deals.map(d => ({
  id: d.id,
  company: d.company,
  contact: d.contact,
  title: d.title,
  stage: d.stage,
  deal_value: d.deal_value,
  stage_entered_date: d.stage_entered_date,
  close_date_expected: d.close_date_expected,
  emails_sent: d.emails_sent,
  emails_received: d.emails_received,
  calls_attempted: d.calls_attempted,
  calls_answered: d.calls_answered,
  meetings_held: d.meetings_held,
  next_meeting_booked: d.next_meeting_booked,
  prospect_contacts_engaged: d.prospect_contacts_engaged,
  last_prospect_email: d.last_prospect_email,
  reciprocal_commitments: d.reciprocal_commitments,
  champion_active: d.champion_active,
  days_in_stage_avg_won: d.days_in_stage_avg_won,
})), null, 2)}

Today's date for reference: 2024-07-24

Return a JSON object with a deals array. For each deal:
- health_score: 0-100
- status: "Accelerating" | "On Track" | "At Risk" | "Stalling"
- engagement_score: 0-100 (bidirectional communication quality)
- commitment_score: 0-100 (depth of reciprocal commitments)
- velocity_score: 0-100 (stage velocity vs average)
- stakeholder_score: 0-100 (multi-threading quality)
- top_signal: the single most important positive or negative signal right now
- risk_flags: array of 1-3 specific concerns (empty array if accelerating)
- next_action: the single most important thing the rep should do TODAY
- next_action_why: one sentence explaining why this action, why now

{
  "deals": [
    {
      "id": "d001",
      "health_score": 85,
      "status": "Accelerating",
      "engagement_score": 88,
      "commitment_score": 75,
      "velocity_score": 90,
      "stakeholder_score": 80,
      "top_signal": "...",
      "risk_flags": [],
      "next_action": "...",
      "next_action_why": "..."
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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    // Merge scores back with full deal data
    const scored = parsed.deals.map((score: any) => {
      const deal = deals.find(d => d.id === score.id)
      if (!deal) return null
      return { ...deal, ...score }
    }).filter(Boolean)
     .sort((a: any, b: any) => {
       const order = { 'Stalling': 0, 'At Risk': 1, 'On Track': 2, 'Accelerating': 3 }
       return (order[a.status as keyof typeof order] ?? 2) - (order[b.status as keyof typeof order] ?? 2)
     })

    return NextResponse.json({ deals: scored })
  } catch (error: any) {
    console.error('Accelerate error:', error)
    return NextResponse.json({ error: error?.message ?? 'Scoring failed' }, { status: 500 })
  }
}
