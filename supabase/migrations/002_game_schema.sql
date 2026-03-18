-- ============================================================
-- 002_game_schema.sql
-- Game tables: players, recruits, portal, schedule, results
-- ============================================================

-- ─────────────────────────────────────────────
-- PLAYERS (league-scoped)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,

  -- Identity
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  jersey_number   INTEGER,

  -- Position
  position        TEXT NOT NULL CHECK (position IN ('PG','SG','SF','PF','C')),

  -- Ratings
  overall         INTEGER NOT NULL DEFAULT 70 CHECK (overall BETWEEN 40 AND 99),
  potential       INTEGER NOT NULL DEFAULT 75 CHECK (potential BETWEEN 40 AND 99),
  dev_trait       TEXT NOT NULL DEFAULT 'normal'
                    CHECK (dev_trait IN ('normal','impact','star','elite')),

  -- Key attributes (1-99 each)
  attr_speed          INTEGER DEFAULT 70,
  attr_ball_handling  INTEGER DEFAULT 70,
  attr_shooting_2pt   INTEGER DEFAULT 70,
  attr_shooting_3pt   INTEGER DEFAULT 60,
  attr_defense        INTEGER DEFAULT 70,
  attr_rebounding     INTEGER DEFAULT 60,
  attr_iq             INTEGER DEFAULT 70,
  attr_athleticism    INTEGER DEFAULT 70,
  attr_free_throw     INTEGER DEFAULT 70,
  attr_passing        INTEGER DEFAULT 65,

  -- Eligibility
  year            TEXT NOT NULL DEFAULT 'FR'
                    CHECK (year IN ('FR','SO','JR','SR','GR')),
  is_redshirt     BOOLEAN DEFAULT FALSE,
  eligibility_years_remaining INTEGER DEFAULT 4,
  seasons_played  INTEGER DEFAULT 0,

  -- Status
  is_starter      BOOLEAN DEFAULT FALSE,
  depth_chart_pos INTEGER DEFAULT 99,   -- lower = higher on depth chart
  morale          INTEGER DEFAULT 75 CHECK (morale BETWEEN 0 AND 100),
  is_injured      BOOLEAN DEFAULT FALSE,
  injury_weeks_remaining INTEGER DEFAULT 0,

  -- NIL
  nil_weekly_deal BIGINT DEFAULT 0,

  -- Portal
  in_portal       BOOLEAN DEFAULT FALSE,

  -- Stats (season totals, reset each season)
  stat_games_played    INTEGER DEFAULT 0,
  stat_points_per_game NUMERIC(4,1) DEFAULT 0,
  stat_rebounds_per_game NUMERIC(4,1) DEFAULT 0,
  stat_assists_per_game NUMERIC(4,1) DEFAULT 0,
  stat_minutes_per_game NUMERIC(4,1) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_league ON players(league_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_portal ON players(league_id, in_portal) WHERE in_portal = TRUE;

-- ─────────────────────────────────────────────
-- PLAYER NIL DEALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_nil_deals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id      UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_id      UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id        UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  weekly_amount  BIGINT NOT NULL DEFAULT 0,
  total_value    BIGINT NOT NULL DEFAULT 0,
  signed_week    INTEGER NOT NULL,
  expires_week   INTEGER,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nil_deals_player ON player_nil_deals(player_id);
CREATE INDEX idx_nil_deals_league ON player_nil_deals(league_id);

-- ─────────────────────────────────────────────
-- RECRUIT TEMPLATES (global seed pool)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recruit_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position        TEXT NOT NULL CHECK (position IN ('PG','SG','SF','PF','C')),
  stars           INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  overall         INTEGER NOT NULL,
  potential       INTEGER NOT NULL,
  dev_trait       TEXT NOT NULL DEFAULT 'normal'
                    CHECK (dev_trait IN ('normal','impact','star','elite')),

  -- Preferences (weights 0-100)
  pref_proximity      INTEGER DEFAULT 50,
  pref_prestige       INTEGER DEFAULT 50,
  pref_nil            INTEGER DEFAULT 50,
  pref_playing_time   INTEGER DEFAULT 50,
  pref_coach_stability INTEGER DEFAULT 50,
  pref_academics      INTEGER DEFAULT 50,

  -- Name (fictional)
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,

  -- Location
  home_state TEXT,
  home_city  TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recruit_templates_stars ON recruit_templates(stars);
CREATE INDEX idx_recruit_templates_position ON recruit_templates(position);

-- ─────────────────────────────────────────────
-- LEAGUE RECRUITS (per-league instance)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_recruits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES recruit_templates(id),

  -- Copied fields for performance
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  position        TEXT NOT NULL,
  stars           INTEGER NOT NULL,
  overall         INTEGER NOT NULL,
  potential       INTEGER NOT NULL,
  dev_trait       TEXT NOT NULL,
  home_state      TEXT,

  -- Preferences (copied + slightly varied per league)
  pref_proximity      INTEGER DEFAULT 50,
  pref_prestige       INTEGER DEFAULT 50,
  pref_nil            INTEGER DEFAULT 50,
  pref_playing_time   INTEGER DEFAULT 50,
  pref_coach_stability INTEGER DEFAULT 50,

  -- Status
  status          TEXT NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','considering','committed','signed','passed')),
  interest_team_ids UUID[] DEFAULT '{}',  -- teams with offers
  committed_to_team_id UUID REFERENCES league_teams(id) ON DELETE SET NULL,
  commit_week     INTEGER,

  -- Commitment score (0-100, how close to committing)
  commit_score    INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_league_recruits_league ON league_recruits(league_id);
CREATE INDEX idx_league_recruits_status ON league_recruits(league_id, status);
CREATE INDEX idx_league_recruits_stars ON league_recruits(league_id, stars DESC);

-- ─────────────────────────────────────────────
-- RECRUITING ACTIONS (per team per week)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recruiting_actions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id      UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id        UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  recruit_id     UUID NOT NULL REFERENCES league_recruits(id) ON DELETE CASCADE,
  week           INTEGER NOT NULL,
  action_type    TEXT NOT NULL CHECK (action_type IN ('allocate_points','offer_scholarship','schedule_visit','cancel_offer')),
  points_spent   INTEGER DEFAULT 0,
  scholarship_offered BOOLEAN DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id, recruit_id, week, action_type)
);

CREATE INDEX idx_rec_actions_league_week ON recruiting_actions(league_id, week);
CREATE INDEX idx_rec_actions_team ON recruiting_actions(team_id, week);

-- ─────────────────────────────────────────────
-- TEAM RECRUITING STATE (points budget per week)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_recruiting_state (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id             UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id               UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  season                INTEGER NOT NULL DEFAULT 1,
  scholarships_total    INTEGER DEFAULT 13,
  scholarships_used     INTEGER DEFAULT 0,
  scholarships_offered  INTEGER DEFAULT 0,
  class_size_target     INTEGER DEFAULT 5,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id, season)
);

-- ─────────────────────────────────────────────
-- TRANSFER PORTAL ENTRIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_team_id    UUID NOT NULL REFERENCES league_teams(id),

  entered_week    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','committed','withdrawn','expired')),
  reason          TEXT,    -- 'depth_chart','nil','coach_change','team_success'
  nil_ask         BIGINT DEFAULT 0,

  committed_to_team_id UUID REFERENCES league_teams(id) ON DELETE SET NULL,
  commit_week          INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_league ON portal_entries(league_id, status);
CREATE INDEX idx_portal_player ON portal_entries(player_id);

-- ─────────────────────────────────────────────
-- PORTAL OFFERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_offers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id      UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  portal_entry_id UUID NOT NULL REFERENCES portal_entries(id) ON DELETE CASCADE,
  team_id        UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  player_id      UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  nil_offer      BIGINT NOT NULL DEFAULT 0,
  points_spent   INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  offered_week   INTEGER NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, portal_entry_id, team_id)
);

CREATE INDEX idx_portal_offers_entry ON portal_offers(portal_entry_id);
CREATE INDEX idx_portal_offers_team ON portal_offers(team_id);

-- ─────────────────────────────────────────────
-- TEAM WEEK STATE (ready/actions per week)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_week_state (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id                UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id                  UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  week                     INTEGER NOT NULL,

  is_ready                 BOOLEAN DEFAULT FALSE,
  ready_at                 TIMESTAMPTZ,

  recruiting_points_used   INTEGER DEFAULT 0,
  recruiting_points_budget INTEGER DEFAULT 100,
  nil_spent_this_week      BIGINT DEFAULT 0,
  nil_budget_this_week     BIGINT DEFAULT 0,

  ad_decision_made         BOOLEAN DEFAULT FALSE,
  ad_choice_key            TEXT,

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id, week)
);

CREATE INDEX idx_tws_league_week ON team_week_state(league_id, week);
CREATE INDEX idx_tws_ready ON team_week_state(league_id, week, is_ready);

-- ─────────────────────────────────────────────
-- TEAM FINANCES (persistent across weeks)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_finances (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id           UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id             UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE UNIQUE,
  season              INTEGER NOT NULL DEFAULT 1,

  -- NIL Collective
  nil_bank            BIGINT NOT NULL DEFAULT 500000,
  nil_weekly_income   BIGINT NOT NULL DEFAULT 50000,
  nil_weekly_cap      BIGINT NOT NULL DEFAULT 200000,
  nil_committed_weekly BIGINT NOT NULL DEFAULT 0,  -- sum of active deal weekly amounts

  -- Operations
  operations_budget   BIGINT NOT NULL DEFAULT 1000000,
  facilities_budget   BIGINT NOT NULL DEFAULT 0,
  staff_budget        BIGINT NOT NULL DEFAULT 0,
  marketing_budget    BIGINT NOT NULL DEFAULT 0,

  -- Fundraising
  fundraising_points  INTEGER NOT NULL DEFAULT 0,

  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finances_league ON team_finances(league_id);

-- ─────────────────────────────────────────────
-- SCHEDULE GAMES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_games (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season          INTEGER NOT NULL DEFAULT 1,
  week            INTEGER NOT NULL,
  game_type       TEXT NOT NULL DEFAULT 'regular'
                    CHECK (game_type IN ('non_conf','conference','conf_tournament','nat_tournament')),
  home_team_id    UUID NOT NULL REFERENCES league_teams(id),
  away_team_id    UUID NOT NULL REFERENCES league_teams(id),
  neutral_site    BOOLEAN DEFAULT FALSE,
  is_played       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedule_league_week ON schedule_games(league_id, week);
CREATE INDEX idx_schedule_league_season ON schedule_games(league_id, season);

-- ─────────────────────────────────────────────
-- GAME RESULTS (immutable after write)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  game_id         UUID NOT NULL REFERENCES schedule_games(id) ON DELETE CASCADE UNIQUE,
  season          INTEGER NOT NULL,
  week            INTEGER NOT NULL,

  home_team_id    UUID NOT NULL REFERENCES league_teams(id),
  away_team_id    UUID NOT NULL REFERENCES league_teams(id),
  home_score      INTEGER NOT NULL,
  away_score      INTEGER NOT NULL,
  winner_team_id  UUID NOT NULL REFERENCES league_teams(id),

  -- Key stats (JSON for flexibility)
  home_stats_json JSONB DEFAULT '{}',
  away_stats_json JSONB DEFAULT '{}',

  -- Text commentary events
  key_plays_json  JSONB DEFAULT '[]',

  -- Sim metadata
  sim_seed        INTEGER,  -- for replay determinism
  overtime_periods INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_results_league_week ON game_results(league_id, week);
CREATE INDEX idx_game_results_teams ON game_results(home_team_id, away_team_id);

-- ─────────────────────────────────────────────
-- TEAM SEASON STATS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_season_stats (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  season          INTEGER NOT NULL,

  wins            INTEGER DEFAULT 0,
  losses          INTEGER DEFAULT 0,
  conf_wins       INTEGER DEFAULT 0,
  conf_losses     INTEGER DEFAULT 0,

  points_scored   INTEGER DEFAULT 0,
  points_allowed  INTEGER DEFAULT 0,
  total_games     INTEGER DEFAULT 0,

  -- Tournament results
  conf_tournament_result TEXT,
  nat_tournament_seed    INTEGER,
  nat_tournament_result  TEXT,

  streak_type     TEXT DEFAULT 'W',  -- 'W' or 'L'
  streak_count    INTEGER DEFAULT 0,

  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id, season)
);

CREATE INDEX idx_season_stats_league ON team_season_stats(league_id, season);

-- ─────────────────────────────────────────────
-- NEWS FEED ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_feed_items (
  id          BIGSERIAL PRIMARY KEY,
  league_id   UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season      INTEGER NOT NULL DEFAULT 1,
  week        INTEGER NOT NULL DEFAULT 0,
  type        TEXT NOT NULL,   -- 'game_result','recruit_commit','portal_move','injury','milestone'
  importance  INTEGER DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),  -- 5 = top story
  headline    TEXT NOT NULL,
  body        TEXT,
  team_id     UUID REFERENCES league_teams(id),
  player_id   UUID REFERENCES players(id),
  recruit_id  UUID REFERENCES league_recruits(id),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_league ON news_feed_items(league_id, created_at DESC);
CREATE INDEX idx_news_league_week ON news_feed_items(league_id, season, week);

-- ─────────────────────────────────────────────
-- WEEK PROCESSING LOG (idempotency guard)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS week_processing_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id    UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season       INTEGER NOT NULL,
  week         INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'processing'
                 CHECK (status IN ('processing','completed','failed')),
  games_simmed INTEGER DEFAULT 0,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_msg    TEXT,
  UNIQUE(league_id, season, week)
);

CREATE INDEX idx_wpl_league ON week_processing_log(league_id, season, week);

-- ─────────────────────────────────────────────
-- AD / FUNDRAISING DECISIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_decisions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id   UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_id     UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  season      INTEGER NOT NULL,
  week        INTEGER NOT NULL,
  choice_key  TEXT NOT NULL,  -- 'facilities_boost','nil_boost','marketing','compliance_risk'
  choice_label TEXT NOT NULL,
  effect_json JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_id, season, week)
);

CREATE INDEX idx_ad_decisions_league ON ad_decisions(league_id);

-- ─────────────────────────────────────────────
-- CONFERENCES (league-aware for realignment)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conferences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id   UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  tier        INTEGER DEFAULT 2 CHECK (tier BETWEEN 1 AND 4), -- 1=P4, 2=major, 3=mid, 4=low
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, name)
);

CREATE TABLE IF NOT EXISTS conference_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id       UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  conference_id   UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
  joined_season   INTEGER DEFAULT 1,
  UNIQUE(league_id, team_id)
);
