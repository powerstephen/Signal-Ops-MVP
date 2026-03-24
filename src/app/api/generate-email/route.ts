import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { account, type = 'recover' } = await req.json()
    const isProspect = type === 'prospect'

    const prompt = isProspect
      ? `You are a senior SDR. Write a short personalised cold outreach email to a net-new prospect.

PROSPECT: ${account.company} | ${account.contact_name}, ${account.contact_title} | ${account.industry} | ${account.employees} employees | ${account.stage} | ${account.country}
ACTIVE SIGNALS: ${account.active_signals?.join(', ')}
WHY NOW: ${account.why_now}
LOOKALIKE REASON: ${account.lookalike_reason}

Write an email that references 2-3 signals naturally, feels human not automated, is under 120 words, has a soft CTA.
Do NOT say "I hope this email finds you well". Do NOT mention AI or algorithms.

Return JSON: { "subject": "...", "body": "..." }`

      : `You are a senior SDR. Write a 3-email re-engagement sequence for a dormant account.

ACCOUNT: ${account.company} | ${account.contact}, ${account.title} | ${account.industry} | ${account.employees} employees | ${account.status}
SEGMENT: ${account.segment ?? 'dormant'}
LAST CONTACT: ${account.last_contact} | PREVIOUS LTV: $${account.ltv?.toLocaleString() ?? 'unknown'}
WHY SCORE HIGH: ${account.score_reasons?.join(', ')}
WHY NOW: ${account.why_now}

Write a 3-email sequence:
- Email 1 (Send now): Acknowledge the gap, lead with new value tied to why_now signal, soft question. Under 100 words. Human tone.
- Email 2 (Send day 4 if no reply): Short case study or social proof from a similar company with specific result. One yes/no question. Under 90 words.
- Email 3 (Send day 8 if no reply): Break-up email. Assume they're not interested, ask if they want to be removed, leave door open. Under 75 words. This one gets the most replies — make it feel genuinely final.

Do NOT say "just checking in", "circling back", or "I hope this email finds you well".
Sound like a human who specifically remembers this person.

Return JSON:
{
  "email1": { "subject": "...", "body": "...", "send_timing": "Send now", "goal": "Re-open conversation" },
  "email2": { "subject": "...", "body": "...", "send_timing": "Day 4 if no reply", "goal": "Social proof nudge" },
  "email3": { "subject": "...", "body": "...", "send_timing": "Day 8 if no reply", "goal": "Break-up email" }
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: error?.message ?? 'Email generation failed' }, { status: 500 })
  }
}
