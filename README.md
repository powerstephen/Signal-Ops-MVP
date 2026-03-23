# SignalOps — Revenue Intelligence Platform

> Precision targeting, powered by your own revenue data.
> Know your best customer. Find more of them.

---

## What this is

SignalOps is a revenue intelligence platform that analyses your CRM, billing, and CS data to build a living ICP profile — then surfaces dormant accounts worth re-engaging and net-new lookalike prospects showing live buying signals.

This demo ships with **100 realistic SaaS customer records** pre-loaded, so it works immediately out of the box.

---

## What it does

| Feature | Description |
|---|---|
| **ICP Profile** | Analyses your customer data with Claude AI to identify your truly best customers by LTV, retention, expansion, and support cost |
| **Recover** | Scores dormant accounts against your ICP profile and surfaces those worth re-engaging |
| **Generate** | Creates a net-new prospect list of companies that look like your best customers and are showing buying signals |
| **Email generation** | Generates signal-grounded outreach emails for any scored account — one click, ready to send |

---

## Deploy in 5 minutes

### Step 1 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** and create a new key
4. Copy it — you'll need it in Step 4

### Step 2 — Push to GitHub

1. Create a new repository at [github.com/new](https://github.com/new)
2. Name it `signalops` (or anything you like)
3. Unzip this folder on your computer
4. Open Terminal and run:

```bash
cd signalops-app
git init
git add .
git commit -m "Initial SignalOps build"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New Project**
3. Import your GitHub repository
4. Leave all build settings as default — Vercel auto-detects Next.js
5. Click **Deploy** (it will fail at first — that's fine, we add the API key next)

### Step 4 — Add your API key

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your API key from Step 1
3. Click **Save**
4. Go to **Deployments** and click **Redeploy** on the latest deployment

### Step 5 — Open your app

Your app is now live at `https://your-project-name.vercel.app`

Click **Open Dashboard** → then try each tab in order:
1. **ICP Profile** → Analyse my ICP
2. **Recover** → Score dormant accounts
3. **Generate** → Generate prospect list

---

## Run locally (optional)

```bash
cd signalops-app
npm install
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Replacing the dummy data

The demo data lives in `/data/customers.json`. Each customer record has these fields:

```json
{
  "id": "c001",
  "company": "Acme Corp",
  "industry": "SaaS",
  "employees": 45,
  "stage": "Series A",
  "country": "USA",
  "contact": "John Smith",
  "title": "VP Sales",
  "email": "j.smith@acme.com",
  "deal_stage": "closed_won",
  "deal_value": 18000,
  "close_date": "2023-01-15",
  "last_contact": "2024-06-01",
  "status": "active",
  "mrr": 1500,
  "ltv": 38000,
  "months_active": 26,
  "expanded": true,
  "churn_date": null,
  "support_tickets": 3,
  "ticket_type": "how_to",
  "time_to_value_days": 14,
  "champion_active": true,
  "nps": 9
}
```

To use real data, export your CRM/billing data and map it to this format, then replace the contents of `customers.json`.

---

## Tech stack

- **Next.js 14** (App Router) — frontend + API routes
- **Tailwind CSS** — styling
- **Anthropic Claude API** — ICP analysis, scoring, email generation
- **JSON files** — data store (no database needed for MVP)

---

## Roadmap ideas

- [ ] CSV upload UI (drag and drop your own data)
- [ ] Supabase integration (persist ICP profiles across sessions)
- [ ] Real signal enrichment via Apollo/Harmonic API
- [ ] HubSpot / Salesforce CRM connect
- [ ] Export scored accounts to CSV
- [ ] Sequence push (direct to Outreach/Salesloft)

---

Built with SignalOps · Revenue intelligence for precision targeting
