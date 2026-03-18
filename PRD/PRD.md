# Dynasty Hoops — Product Requirements Document

## Vision
A mobile-first, multiplayer college basketball dynasty management game built for fans in 2026. Inspired by Football Manager's depth, adapted for the modern college basketball landscape: NIL collectives, transfer portal chaos, coaching carousels, and conference realignment. Multiplayer-first with private commissioner-run leagues.

---

## MVP Scope

### Who It's For
- College basketball fans who want coach/GM depth
- Friend groups and communities running private dynasty leagues
- Hardcore simmers and stat nerds

### Core Fantasy
You are the head coach + program director of a real NCAA D1 program. You recruit, portal-raid, manage NIL, make staff decisions, simulate games, and build your dynasty week by week — competing against friends in a private league.

---

## Phase Roadmap

### MVP (v0.1 — Playable Slice)
- Auth (email + password)
- Commissioner creates league → invite code → users join → pick teams
- Preseason setup: choose team, review roster
- Week loop: recruiting actions → portal actions → NIL allocation → "Ready" → advance → sim results
- Match simulation (server-side, deterministic-ish)
- Standings + results view
- Commissioner panel: advance controls, assign teams, rules
- Audit log
- Mobile-first UI (FM-dark theme)
- All 362 NCAA D1 programs seeded with fictional rosters

### v1 (Full Season)
- Full 18-week regular season + conference tournament + 68-team championship bracket
- Full recruiting class (signing periods, official visits, early signing)
- Portal waves (post-season portal window)
- NIL collectives with weekly budgeting
- AD Mode: facility upgrades, fundraising cards
- Coaching reputation + staff hiring
- Player progression + regression
- Redshirt system + eligibility years
- News feed / program story
- Season history + archives

### v2 (Dynasty Depth)
- Conference realignment tool (commish)
- Playbook/scheme trees (up-tempo, halfcourt, zone, press)
- Coordinator tendencies
- Recruiting pipelines by region
- Rivalry games + trophy system
- Sanctions / compliance risk system
- Export season history
- Public league discovery
- Mobile app wrapper (Capacitor or PWA install)

---

## "Fans Want This in 2026" Features

| Feature | MVP | v1 | v2 |
|---------|-----|----|----|
| NIL collectives + weekly budgeting | ✓ | ✓ | ✓ |
| Transfer portal (mid-season + offseason) | ✓ | ✓ | ✓ |
| Real D1 school data (fictional players) | ✓ | ✓ | ✓ |
| Recruiting (stars, preferences, offers) | ✓ | ✓ | ✓ |
| Commissioner-run private leagues | ✓ | ✓ | ✓ |
| Multiplayer ready/advance system | ✓ | ✓ | ✓ |
| Match sim + score + text events | ✓ | ✓ | ✓ |
| AD Mode + fundraising decisions | Light | ✓ | ✓ |
| Coaching carousel | - | ✓ | ✓ |
| Conference realignment | - | - | ✓ |
| Facilities upgrades | - | ✓ | ✓ |
| Program prestige + storylines | - | ✓ | ✓ |
| Scheme / playbook system | - | - | ✓ |
| Season history + legacy mode | - | ✓ | ✓ |
| Sanctions / compliance risk | - | - | ✓ |

---

## Core Game Loop (Season Lifecycle)

```
PRESEASON
  └─ Commissioner creates league
  └─ Users join + claim teams
  └─ Review roster, set lineup, allocate NIL

REGULAR SEASON (Weeks 1-18)
  Each week:
    1. Recruiting actions (offer, points, visit slot)
    2. Portal actions (offer portal players)
    3. NIL/AD decisions (budget allocation, fundraising card)
    4. User marks "Ready"
  Commissioner OR auto-advance triggers:
    5. Server validates all actions
    6. Simulate all games for the week
    7. Process recruiting decisions
    8. Update standings, stats, news feed
    9. Advance to next week

CONFERENCE TOURNAMENT (Weeks 19-20)
  └─ Single-elim bracket seeded by conf record

NATIONAL TOURNAMENT (Weeks 21-23)
  └─ 68-team fictional bracket
  └─ Auto-bid + at-large selection

OFFSEASON
  └─ Coaching carousel (coach fired/hired events)
  └─ Portal wave (players enter portal)
  └─ Signing Day (commits finalized)
  └─ Player progression/regression
  └─ Advance to next season
```

---

## Roles + Permissions

| Action | Read-Only | User | Co-Commish | Commissioner |
|--------|-----------|------|------------|--------------|
| View scores/standings | ✓ | ✓ | ✓ | ✓ |
| Submit recruiting actions | - | ✓ | ✓ | ✓ |
| Mark ready | - | ✓ | ✓ | ✓ |
| View audit log | - | - | ✓ | ✓ |
| Advance week | - | - | ✓ | ✓ |
| Assign teams | - | - | - | ✓ |
| Edit rules | - | - | - | ✓ |
| Remove users | - | - | - | ✓ |
| Apply sanctions | - | - | - | ✓ |

---

## Monetization (Future, Not MVP)
- Free tier: 1 league, 10 users max
- Pro tier ($4.99/mo): unlimited leagues, custom rulesets, full history
- League Pro ($9.99/mo per league): 30+ users, public league page, streamer mode
- No pay-to-win mechanics. Cosmetics only (team colors, banner).

---

## Risks + Mitigations

| Risk | Mitigation |
|------|-----------|
| NCAA trademark issues | Use real school/conference names only; all players fictional; no logos; no official marks |
| Double-advance race condition | DB advisory lock + idempotency check on processed weeks |
| League data leakage | RLS enforced at DB level on every table |
| Supabase free tier limits | Edge function pooling; no realtime subscriptions in MVP (polling) |
| Sim imbalance (one team always wins) | Tunable randomness factors; prestige gap dampener |
| Portal drain makes bad teams unplayable | NIL soft-cap model; portal limits per school |
