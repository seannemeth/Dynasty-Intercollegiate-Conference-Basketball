-- ============================================================
-- 001_core_schema.sql
-- Core infrastructure: leagues, members, schools, audit
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- GLOBAL SCHOOL TEMPLATES (not league-scoped)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,       -- "Duke", "UNC"
  abbreviation  TEXT NOT NULL,       -- "DUKE", "UNC"
  conference    TEXT NOT NULL,
  division      TEXT NOT NULL DEFAULT 'D1',
  prestige      INTEGER NOT NULL DEFAULT 3 CHECK (prestige BETWEEN 1 AND 5),
  color_primary TEXT NOT NULL DEFAULT '#003087',
  color_secondary TEXT NOT NULL DEFAULT '#FFFFFF',
  city          TEXT,
  state         TEXT,
  arena_name    TEXT,
  arena_capacity INTEGER DEFAULT 10000,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schools_conference ON schools(conference);

-- ─────────────────────────────────────────────
-- LEAGUES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  invite_code     TEXT NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  commissioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Season state
  season          INTEGER NOT NULL DEFAULT 1,
  current_week    INTEGER NOT NULL DEFAULT 0,
  phase           TEXT NOT NULL DEFAULT 'setup'
                    CHECK (phase IN ('setup','preseason','regular_season','conf_tournament','nat_tournament','offseason')),

  -- Advance settings
  advance_mode    TEXT NOT NULL DEFAULT 'manual'
                    CHECK (advance_mode IN ('manual','auto_all_ready','auto_timer')),
  advance_timer_hours INTEGER DEFAULT 48,
  last_advance_at TIMESTAMPTZ,

  -- Metadata
  max_teams       INTEGER NOT NULL DEFAULT 32,
  is_public       BOOLEAN DEFAULT FALSE,
  is_locked       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leagues_invite ON leagues(invite_code);
CREATE INDEX idx_leagues_commissioner ON leagues(commissioner_id);

-- ─────────────────────────────────────────────
-- LEAGUE RULES (key-value per league)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_rules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id  UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, key)
);

CREATE INDEX idx_league_rules_league ON league_rules(league_id);

-- Default rules inserted on league creation via trigger/rpc:
-- nil_model: 'soft_cap' | 'hard_cap' | 'no_cap'
-- nil_weekly_base: '50000'
-- portal_size_factor: '1.0'
-- portal_immediate_eligibility: 'true'
-- recruiting_points_per_week: '100'
-- max_scholarship_offers: '25'
-- allow_tampering: 'false'
-- auto_advance_timer_hours: '48'

-- ─────────────────────────────────────────────
-- LEAGUE MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id  UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'user'
               CHECK (role IN ('commissioner','co_commish','user','read_only')),
  team_id    UUID,                    -- FK added after league_teams created
  display_name TEXT,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active  BOOLEAN DEFAULT TRUE,
  UNIQUE(league_id, user_id)
);

CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);

-- ─────────────────────────────────────────────
-- AUDIT LOG (append-only)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_audit_log (
  id         BIGSERIAL PRIMARY KEY,
  league_id  UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES auth.users(id),
  action     TEXT NOT NULL,           -- 'advance_week', 'assign_team', 'edit_rules', etc.
  payload    JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_league ON league_audit_log(league_id, created_at DESC);

-- ─────────────────────────────────────────────
-- LEAGUE TEAMS (league-scoped school instance)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_teams (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id         UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  school_id         UUID NOT NULL REFERENCES schools(id),

  -- Coach info (fictional)
  coach_first_name  TEXT NOT NULL DEFAULT 'John',
  coach_last_name   TEXT NOT NULL DEFAULT 'Smith',
  coach_prestige    INTEGER NOT NULL DEFAULT 3 CHECK (coach_prestige BETWEEN 1 AND 5),
  coach_offense_style TEXT NOT NULL DEFAULT 'balanced',
  coach_defense_style TEXT NOT NULL DEFAULT 'man',

  -- Program state
  prestige          INTEGER NOT NULL DEFAULT 3 CHECK (prestige BETWEEN 1 AND 5),
  facilities_level  INTEGER NOT NULL DEFAULT 5 CHECK (facilities_level BETWEEN 1 AND 10),
  program_momentum  INTEGER NOT NULL DEFAULT 50 CHECK (program_momentum BETWEEN 0 AND 100),
  fan_interest      INTEGER NOT NULL DEFAULT 50 CHECK (fan_interest BETWEEN 0 AND 100),

  -- Finances
  nil_bank          BIGINT NOT NULL DEFAULT 500000,
  nil_weekly_income BIGINT NOT NULL DEFAULT 50000,
  nil_weekly_spent  BIGINT NOT NULL DEFAULT 0,
  operations_budget BIGINT NOT NULL DEFAULT 1000000,

  -- Season record (denormalized for speed)
  wins              INTEGER NOT NULL DEFAULT 0,
  losses            INTEGER NOT NULL DEFAULT 0,
  conf_wins         INTEGER NOT NULL DEFAULT 0,
  conf_losses       INTEGER NOT NULL DEFAULT 0,

  -- Team overall rating (computed each week)
  team_overall      INTEGER NOT NULL DEFAULT 70,

  is_locked         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, school_id)
);

CREATE INDEX idx_league_teams_league ON league_teams(league_id);
CREATE INDEX idx_league_teams_school ON league_teams(school_id);

-- Add FK from league_members to league_teams
ALTER TABLE league_members
  ADD CONSTRAINT fk_league_members_team
  FOREIGN KEY (team_id) REFERENCES league_teams(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- USER PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- UPDATED_AT trigger helper
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leagues_updated_at BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
