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
      : `You are a senior SDR. Write a short re-engagement email to a dormant account.

ACCOUNT: ${account.company} | ${account.contact}, ${account.title} | ${account.industry} | ${account.employees} employees | ${account.status}
LAST CONTACT: ${account.last_contact} | PREVIOUS LTV: $${account.ltv?.toLocaleString() ?? 'unknown'}
WHY SCORE HIGH: ${account.score_reasons?.join(', ')}
WHY NOW: ${account.why_now}

Write a warm re-engagement email, under 110 words, that acknowledges the gap naturally and ends with a simple question.
Do NOT say "I hope this email finds you well" or "just checking in".

Return JSON: { "subject": "...", "body": "..." }`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: 'Email generation failed' }, { status: 500 })
  }
}
