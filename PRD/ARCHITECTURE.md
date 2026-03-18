# Dynasty Hoops — Architecture Document

## Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, server actions, edge-ready |
| Styling | Tailwind CSS + custom FM-dark theme | Mobile-first, utility-first |
| Backend | Supabase (Postgres + Auth + Edge Functions) | Free tier, RLS, RPC, realtime-ready |
| Auth | Supabase Auth (email+password + magic link) | Built-in, JWT, RLS integration |
| DB | PostgreSQL 15 (via Supabase) | ACID, advisory locks, row-level security |
| Jobs | Supabase Edge Functions + pg_cron | Week processing, auto-advance |
| Hosting | Vercel (Next.js) + Supabase (DB/Functions) | Both free tiers, global CDN |
| State | React Query + Server Actions | No client-side truth; server-authoritative |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Next.js App (App Router)               │  │
│  │  ┌──────────┐  ┌────────────┐  ┌─────────────┐  │  │
│  │  │  Pages   │  │  Server    │  │  API Route  │  │  │
│  │  │ (RSC)    │  │  Actions   │  │  Handlers   │  │  │
│  │  └──────────┘  └────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  Auth        │  │  Edge Fns     │  │  pg_cron    │  │
│  │  (JWT/RLS)   │  │  process-week │  │  auto-adv.  │  │
│  └──────────────┘  │  seed-league  │  └─────────────┘  │
│                    └───────────────┘                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │              PostgreSQL 15                        │  │
│  │  RLS policies on every table                     │  │
│  │  Advisory locks for week processing              │  │
│  │  RPC functions for atomic operations             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model (ERD Summary)

### League Infrastructure
```
users (auth.users)
  └─ league_members (user_id, league_id, role, team_id)
       └─ leagues (id, name, invite_code, phase, current_week, rules_json)
            └─ league_audit_log (actor_id, league_id, action, payload, ts)
            └─ league_rules (league_id, key, value)
```

### Team + Roster
```
schools (global template: id, name, conference, prestige, colors)
  └─ league_teams (league_id, school_id, coach_name, prestige, nil_budget, facilities)
       └─ players (league_id, team_id, position, overall, potential, dev_trait, year, ...)
            └─ player_attributes (player_id, attribute, value)
            └─ player_nil_deals (player_id, league_id, weekly_amount, expires_week)
       └─ team_week_state (team_id, week, is_ready, recruiting_points_used, nil_spent)
       └─ team_finances (team_id, nil_bank, nil_weekly, facilities_level, fundraising_pts)
```

### Recruiting
```
recruit_templates (global: position, stars, overall, potential, dev_trait, preferences_json)
  └─ league_recruits (league_id, template_id, committed_to_team_id, status, ...)
       └─ recruiting_offers (league_id, team_id, recruit_id, points_allocated, scholarship_offered)
       └─ recruiting_results (league_id, week, recruit_id, outcome, winning_team_id)
```

### Transfer Portal
```
portal_entries (league_id, player_id, entered_week, status, nil_ask, reason)
  └─ portal_offers (league_id, team_id, player_id, nil_offer, points)
  └─ portal_results (league_id, week, player_id, outcome, landing_team_id)
```

### Schedule + Results
```
schedule_games (league_id, week, home_team_id, away_team_id, game_type)
  └─ game_results (game_id, home_score, away_score, sim_log_json, key_players_json)
  └─ team_season_stats (team_id, league_id, season, wins, losses, conf_wins, ...)
```

### News Feed
```
news_feed_items (league_id, week, type, headline, body, team_id, player_id, created_at)
```

### Processing
```
week_processing_log (league_id, week, status, started_at, completed_at, error)
```

---

## Security Model

### RLS Principles
1. **League isolation**: Every table with league_id has a policy requiring membership check
2. **Role gates**: Commissioner-only tables checked against league_members.role
3. **No client writes to sim tables**: game_results, week_events, news_feed written only by edge functions (service role key)
4. **Audit log**: append-only, commish can read, nobody can delete

### Key RLS Pattern
```sql
-- Standard league-member read policy
CREATE POLICY "league_members_can_read"
ON table_name FOR SELECT
USING (
  league_id IN (
    SELECT league_id FROM league_members
    WHERE user_id = auth.uid()
  )
);
```

### Sensitive Writes → RPC Only
These operations use Postgres functions called as RPC (not direct table writes):
- `rpc_create_league` — creates league + seeds teams
- `rpc_join_league` — validates invite code + adds member
- `rpc_submit_recruiting_action` — validates points budget + upserts action
- `rpc_mark_ready` — marks team_week_state.is_ready = true
- `rpc_process_week` — advisory lock + full week sim (service role only)
- `rpc_seed_league` — idempotent seeding (service role only)

---

## Week Processing Engine

```
POST /api/league/[id]/advance
  → Validates caller is commissioner (or auto-advance)
  → Calls Edge Function: process-week
      → SELECT pg_try_advisory_lock(league_id, week)  -- race condition guard
      → Check week_processing_log for duplicate
      → BEGIN TRANSACTION
          → Validate all teams submitted OR deadline passed
          → Simulate all schedule_games for this week
          → Process recruiting decisions
          → Process portal decisions
          → Update team_season_stats
          → Generate news_feed_items
          → Advance league.current_week
          → Update league.phase if needed
          → INSERT week_processing_log (completed)
      → COMMIT
      → SELECT pg_advisory_unlock(league_id, week)
```

### Idempotency Guard
```sql
INSERT INTO week_processing_log (league_id, week, status)
VALUES ($1, $2, 'processing')
ON CONFLICT (league_id, week) DO NOTHING
RETURNING id
-- If no row returned → already processed, exit
```

---

## Concurrency Strategy

- **Advisory locks**: `pg_try_advisory_lock(hashtext(league_id::text), week)` — one process per league per week
- **Idempotency**: `week_processing_log` with `UNIQUE(league_id, week)` prevents double-processing
- **League isolation**: RLS + separate league_id FK on all rows means zero cross-league joins possible
- **Edge function timeout**: Vercel/Supabase 30s limit; week sim designed to complete in < 5s for 30 games

---

## API Surface

### Server Actions (Next.js)
```
auth/login, auth/signup, auth/logout
league/create, league/join, league/leave
team/select, team/setLineup
recruiting/allocatePoints, recruiting/makeOffer
portal/makeOffer, portal/retainPlayer
nil/allocateBudget, nil/fundraisingChoice
week/markReady
commissioner/advanceWeek, commissioner/assignTeam, commissioner/editRules, commissioner/sanction
```

### Edge Functions
```
POST /functions/v1/process-week    — week simulation (service role)
POST /functions/v1/seed-league     — idempotent league seeding (service role)
POST /functions/v1/auto-advance    — cron trigger for auto-advance leagues
```

---

## Performance Considerations (Free Tier)

| Concern | Solution |
|---------|---------|
| Supabase 500MB DB limit | Compact data model; prune old leagues |
| Edge function 50ms CPU limit | Pg-side simulation via RPC, not in function |
| No realtime in MVP | Client polls every 15s; upgrade to Supabase Realtime in v1 |
| Cold starts | Keep edge functions slim; heavy logic in Postgres functions |
| Supabase 2 edge function invocations/s limit | Queue advance requests; one per league per minute max |

---

## File + Folder Structure

```
/
├── README.md
├── PRD/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── middleware.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_core_schema.sql
│   │   ├── 002_game_schema.sql
│   │   ├── 003_rls_policies.sql
│   │   └── 004_rpc_functions.sql
│   └── functions/
│       ├── process-week/index.ts
│       ├── seed-league/index.ts
│       └── auto-advance/index.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/page.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── dashboard/page.tsx
│   │   └── league/[leagueId]/
│   │       ├── layout.tsx
│   │       ├── page.tsx          (hub)
│   │       ├── team/page.tsx
│   │       ├── recruiting/page.tsx
│   │       ├── portal/page.tsx
│   │       ├── nil-ad/page.tsx
│   │       ├── results/page.tsx
│   │       ├── standings/page.tsx
│   │       └── commissioner/page.tsx
│   ├── actions/
│   ├── components/
│   │   ├── ui/          (button, card, badge, modal, data-table, ...)
│   │   ├── nav/         (sidebar, bottom-nav, top-bar)
│   │   ├── league/
│   │   ├── team/
│   │   ├── recruiting/
│   │   ├── portal/
│   │   ├── nil/
│   │   ├── results/
│   │   └── commissioner/
│   ├── data/
│   │   ├── d1_schools.ts     (all 362 D1 programs)
│   │   └── name_generator.ts (fictional player names)
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   └── game/
│   └── types/
└── scripts/
    └── verify-seed.ts
```
