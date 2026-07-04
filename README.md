# Nepal Promise Tracker — वाचा

A civic-tech web app that tracks political promises in Nepal: what was
promised, what was delivered, and the public source for every claim.

Statuses are documented outcomes — **kept**, **broken**, or **in progress** —
never opinions. Built to inform, not to campaign.

**Live demo:** (add your Vercel URL here after deploying)

## How it works

The app has two modes and switches automatically:

- **Demo mode** (default) — runs instantly with clearly-labeled fictional
  sample data. No setup needed. A banner reminds viewers the data isn't real.
- **Live mode** — the moment you add Supabase keys to a `.env` file, the app
  reads real entries from your Postgres database instead.

## Run it right now (demo mode)

```bash
npm install
npm run dev
```

Open the local URL it prints. Done — you're looking at the app with sample data.

## Go live: connect Supabase (~10 minutes)

1. **Create a free account** at [supabase.com](https://supabase.com) →
   New project. Pick any name (e.g. `promise-tracker`), set a database
   password (save it somewhere safe), choose a region, create.

2. **Create the table.** In your project: **SQL Editor → New query** →
   paste the entire contents of `seed.sql` from this repo → **Run**.
   That creates the `promises` table, read-only public access, and demo rows.

3. **Get your keys.** **Settings → API**. Copy two values:
   - Project URL
   - `anon` `public` key

4. **Create your `.env` file.** In the project folder, copy `.env.example`
   to `.env` and paste your two values in. (`.env` is gitignored — keys never
   get committed. You learned why the hard way.)

5. Restart `npm run dev`. The demo banner disappears — you're reading from
   a real database now.

## Adding real promises

Add entries in Supabase: **Table Editor → promises → Insert row**.
The app updates on refresh. Follow the sourcing rules below.

### Sourcing rules (what makes this civic tech, not propaganda)

- **Every entry needs a public source URL** — a news article, official
  document, speech transcript, or manifesto. No source, no entry.
- **Quote the promise as close to verbatim as possible.** Don't paraphrase
  it into something easier to judge.
- **Status must reflect documented outcomes**, not vibes:
  - `kept` — credible public evidence the promise was fulfilled
  - `broken` — the deadline passed with documented non-delivery
  - `in_progress` — before the deadline, or genuinely underway
- **Write the evidence field neutrally.** "Report X states 40% complete" —
  not "as usual, nothing happened."
- **Cover all parties evenly.** A tracker that only tracks one side is a
  campaign tool. Credibility is the entire product.

## Deploy to Vercel

Push to GitHub, import at vercel.com. **One extra step this time:** in the
Vercel project settings → **Environment Variables**, add the same two keys
from your `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(The `.env` file stays on your machine; Vercel needs its own copy.)
Then Deploy. Vite is auto-detected.

## Project structure

```
seed.sql                      # database setup — run once in Supabase
src/
├── lib/supabase.js           # data layer: Supabase client + demo fallback
├── data/demoData.js          # fictional sample data + category list
├── components/
│   ├── StatusPennant.jsx     # the pennant status badge (Nepal-flag shape)
│   ├── PromiseCard.jsx       # one promise with evidence + source link
│   ├── StatsBar.jsx          # kept / broken / in-progress counts
│   └── Controls.jsx          # search + category + status filters
├── App.jsx                   # state, data fetching, filtering
├── index.css
└── main.jsx
```

## Tech

React + Vite + Supabase (Postgres). Row Level Security allows public reads
only; writing happens through the Supabase dashboard. The public `anon` key
is safe to expose in a frontend — that's what it's designed for — but the
database password and `service_role` key must never leave Supabase.

## Roadmap ideas

- Politician profile pages with per-person track records
- Nepali language toggle (नेपाली)
- Promise timeline visualization
- Community submission form with moderation queue
- Party-level scoreboards
