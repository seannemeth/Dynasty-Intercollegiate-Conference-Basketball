# Dynasty Hoops 🏀

**Multiplayer college basketball dynasty management game**
Built on Next.js 14 + Supabase. Mobile-first, FM-dark UI. All 362 NCAA D1 programs.

---

## Feature Overview

- 🏀 All 362 NCAA D1 programs with fictional rosters
- 👥 Multiplayer private leagues with commissioner controls
- 📋 Recruiting board (stars, preferences, commit odds)
- 🔄 Transfer portal with NIL offers
- 💰 NIL collective management + AD fundraising decisions
- 🎮 Server-side match simulation with text commentary
- 📊 Live standings, scores, and news feed
- 🔒 Row-Level Security — zero cross-league data leakage
- 📱 Mobile-first FM26-style dark UI

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started): `npm install -g supabase`

### 1. Clone & Install
```bash
git clone <your-repo-url> dynasty-hoops
cd dynasty-hoops
npm install
```

### 2. Set Up Supabase (Local)
```bash
# Start local Supabase stack
supabase start

# Run migrations
supabase db push
# or run each file manually:
# supabase db execute --file supabase/migrations/001_core_schema.sql
# supabase db execute --file supabase/migrations/002_game_schema.sql
# supabase db execute --file supabase/migrations/003_rls_policies.sql
# supabase db execute --file supabase/migrations/004_rpc_functions.sql
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

The keys are printed when you run `supabase start`. You can also get them via:
```bash
supabase status
```

### 4. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Production (Free Tier)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy your **service role key** (keep secret!)

### Step 2: Run Migrations on Supabase
```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

Or paste each migration file into the Supabase SQL Editor:
- `supabase/migrations/001_core_schema.sql`
- `supabase/migrations/002_game_schema.sql`
- `supabase/migrations/003_rls_policies.sql`
- `supabase/migrations/004_rpc_functions.sql`

### Step 3: Deploy Edge Functions
```bash
supabase functions deploy process-week --no-verify-jwt
supabase functions deploy seed-league --no-verify-jwt
```

Set edge function secrets:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

Or connect via [vercel.com](https://vercel.com):
1. Import GitHub repo
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

### Step 5: Configure Supabase Auth
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## How to Play (Demo Checklist)

1. **Sign up** at `/auth` (create an account)
2. **Create a league** at `/dashboard` — give it a name, pick advance mode
   - League seeds automatically (362 teams, ~4700 players, 300 recruits)
3. **Share the invite code** with friends
4. **Claim a team** — browse all D1 programs by conference
5. Each week:
   - Go to **Recruiting** → allocate points, offer scholarships
   - Go to **Portal** → make NIL offers to transfer targets
   - Go to **NIL/AD** → pick your weekly AD decision
   - Click **Mark Ready** on the Hub
6. **Commissioner clicks "Advance Week"** — games simulate instantly
7. View **Results** and **Standings**

---

## Project Structure

```
dynasty-hoops/
├── PRD/
│   ├── PRD.md              — Product requirements (MVP → v2)
│   └── ARCHITECTURE.md     — Technical architecture + data model
├── src/
│   ├── app/                — Next.js App Router pages
│   │   ├── auth/           — Login/signup
│   │   ├── dashboard/      — League hub
│   │   └── league/[id]/    — All league screens
│   ├── components/
│   │   ├── ui/             — RatingBubble, StarRating, etc.
│   │   ├── nav/            — Sidebar + bottom nav
│   │   ├── recruiting/     — RecruitingBoard
│   │   ├── portal/         — PortalBoard
│   │   ├── nil/            — NilAdPanel
│   │   └── commissioner/   — CommissionerPanel
│   ├── actions/            — Server actions (league, recruiting, etc.)
│   ├── data/
│   │   ├── d1_schools.ts   — All 362 D1 programs
│   │   └── name_generator.ts — Fictional player names
│   ├── lib/
│   │   ├── supabase/       — Client + server Supabase setup
│   │   └── game/           — Simulation, recruiting, portal, seeder
│   └── types/
│       └── database.ts     — Full TypeScript types for DB
├── supabase/
│   ├── migrations/
│   │   ├── 001_core_schema.sql
│   │   ├── 002_game_schema.sql
│   │   ├── 003_rls_policies.sql
│   │   └── 004_rpc_functions.sql
│   └── functions/
│       ├── process-week/   — Week simulation edge function
│       └── seed-league/    — League seeding edge function
└── README.md
```

---

## Component Build Order

Build in this order to always have a working slice:

| Step | What to Build | Status |
|------|--------------|--------|
| 1 | SQL migrations + RLS | ✅ Done |
| 2 | Auth (login/signup) | ✅ Done |
| 3 | Dashboard + create/join league | ✅ Done |
| 4 | Seed league edge function | ✅ Done |
| 5 | Team picker + roster view | ✅ Done |
| 6 | Recruiting board | ✅ Done |
| 7 | Portal board | ✅ Done |
| 8 | NIL/AD panel | ✅ Done |
| 9 | Week processing edge function | ✅ Done |
| 10 | Results + Standings views | ✅ Done |
| 11 | Commissioner panel | ✅ Done |
| 12 | Deploy + demo | ← Next |

---

## v1 Roadmap (Next Sprints)

- [ ] Conference tournament bracket view
- [ ] National championship 68-team bracket
- [ ] Offseason: coaching carousel events
- [ ] Player progression/regression system
- [ ] Realtime ready-status polling → Supabase Realtime
- [ ] Mobile PWA install prompt
- [ ] Full season history / archives
- [ ] Facilities upgrade system (multi-week projects)
- [ ] Recruiting visit scheduling
- [ ] Scheme/playbook system (pace, zone, press)

---

## Notes on Content

- **Real school names**: Used for program context. Universities are public institutions.
- **All players are fictional**: Generated names, no real athlete likenesses.
- **Conference names**: Factual public information.
- **Logos/colors**: Not used. Only custom color values derived from school colors.
- For commercial release: consult legal regarding trademark licensing for school names.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (FM-dark theme) |
| Database | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth |
| Edge Functions | Supabase Edge Functions (Deno) |
| Hosting | Vercel (free tier) |
| State | Server Actions + React `useTransition` |
