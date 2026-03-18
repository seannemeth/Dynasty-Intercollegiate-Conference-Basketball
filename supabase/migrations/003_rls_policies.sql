-- ============================================================
-- 003_rls_policies.sql
-- Row Level Security — League isolation enforced at DB level
-- ============================================================

-- ─────────────────────────────────────────────
-- Helper function: check league membership
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_league_member(p_league_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM league_members
    WHERE league_id = p_league_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION get_league_role(p_league_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM league_members
  WHERE league_id = p_league_id
    AND user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_commissioner(p_league_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM league_members
    WHERE league_id = p_league_id
      AND user_id = auth.uid()
      AND role IN ('commissioner','co_commish')
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION get_user_team_id(p_league_id UUID)
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT team_id FROM league_members
  WHERE league_id = p_league_id
    AND user_id = auth.uid()
    AND is_active = TRUE
  LIMIT 1;
$$;

-- ─────────────────────────────────────────────
-- ENABLE RLS on all tables
-- ─────────────────────────────────────────────
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_nil_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_recruiting_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_week_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- SCHOOLS (global read, no write from client)
-- ─────────────────────────────────────────────
CREATE POLICY "schools_public_read" ON schools FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- USER_PROFILES
-- ─────────────────────────────────────────────
CREATE POLICY "profiles_own_read" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_own_update" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- ─────────────────────────────────────────────
-- LEAGUES
-- ─────────────────────────────────────────────
CREATE POLICY "leagues_member_read" ON leagues FOR SELECT
  USING (is_league_member(id) OR commissioner_id = auth.uid());

CREATE POLICY "leagues_own_insert" ON leagues FOR INSERT
  WITH CHECK (commissioner_id = auth.uid());

CREATE POLICY "leagues_commish_update" ON leagues FOR UPDATE
  USING (commissioner_id = auth.uid() OR is_commissioner(id));

-- ─────────────────────────────────────────────
-- LEAGUE_MEMBERS
-- ─────────────────────────────────────────────
CREATE POLICY "members_league_read" ON league_members FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "members_own_insert" ON league_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_commish_update" ON league_members FOR UPDATE
  USING (user_id = auth.uid() OR is_commissioner(league_id));

CREATE POLICY "members_own_delete" ON league_members FOR DELETE
  USING (user_id = auth.uid() OR is_commissioner(league_id));

-- ─────────────────────────────────────────────
-- LEAGUE_RULES
-- ─────────────────────────────────────────────
CREATE POLICY "rules_member_read" ON league_rules FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "rules_commish_write" ON league_rules FOR ALL
  USING (is_commissioner(league_id))
  WITH CHECK (is_commissioner(league_id));

-- ─────────────────────────────────────────────
-- AUDIT LOG (read: commish; write: append via rpc only)
-- ─────────────────────────────────────────────
CREATE POLICY "audit_commish_read" ON league_audit_log FOR SELECT
  USING (is_commissioner(league_id));

-- No direct client writes — only via service role RPC

-- ─────────────────────────────────────────────
-- LEAGUE_TEAMS
-- ─────────────────────────────────────────────
CREATE POLICY "teams_member_read" ON league_teams FOR SELECT
  USING (is_league_member(league_id));

-- No direct client writes to league_teams — use RPC

-- ─────────────────────────────────────────────
-- TEAM_FINANCES (user sees own team; commish sees all)
-- ─────────────────────────────────────────────
CREATE POLICY "finances_own_team_read" ON team_finances FOR SELECT
  USING (
    is_league_member(league_id) AND (
      team_id = get_user_team_id(league_id) OR is_commissioner(league_id)
    )
  );

-- ─────────────────────────────────────────────
-- PLAYERS
-- ─────────────────────────────────────────────
CREATE POLICY "players_member_read" ON players FOR SELECT
  USING (is_league_member(league_id));

-- No direct client writes — use RPC

-- ─────────────────────────────────────────────
-- PLAYER_NIL_DEALS
-- ─────────────────────────────────────────────
CREATE POLICY "nil_deals_own_read" ON player_nil_deals FOR SELECT
  USING (
    is_league_member(league_id) AND (
      team_id = get_user_team_id(league_id) OR is_commissioner(league_id)
    )
  );

-- ─────────────────────────────────────────────
-- LEAGUE_RECRUITS
-- ─────────────────────────────────────────────
CREATE POLICY "recruits_member_read" ON league_recruits FOR SELECT
  USING (is_league_member(league_id));

-- ─────────────────────────────────────────────
-- RECRUITING_ACTIONS (user writes own team's; commish reads all)
-- ─────────────────────────────────────────────
CREATE POLICY "rec_actions_member_read" ON recruiting_actions FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "rec_actions_own_team_write" ON recruiting_actions FOR INSERT
  WITH CHECK (
    is_league_member(league_id) AND
    team_id = get_user_team_id(league_id)
  );

CREATE POLICY "rec_actions_own_team_update" ON recruiting_actions FOR UPDATE
  USING (
    team_id = get_user_team_id(league_id)
  );

-- ─────────────────────────────────────────────
-- TEAM_RECRUITING_STATE
-- ─────────────────────────────────────────────
CREATE POLICY "rec_state_member_read" ON team_recruiting_state FOR SELECT
  USING (is_league_member(league_id));

-- ─────────────────────────────────────────────
-- PORTAL_ENTRIES + PORTAL_OFFERS
-- ─────────────────────────────────────────────
CREATE POLICY "portal_entries_member_read" ON portal_entries FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "portal_offers_member_read" ON portal_offers FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "portal_offers_own_insert" ON portal_offers FOR INSERT
  WITH CHECK (
    is_league_member(league_id) AND
    team_id = get_user_team_id(league_id)
  );

-- ─────────────────────────────────────────────
-- TEAM_WEEK_STATE
-- ─────────────────────────────────────────────
CREATE POLICY "tws_member_read" ON team_week_state FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "tws_own_team_update" ON team_week_state FOR UPDATE
  USING (
    team_id = get_user_team_id(league_id) OR is_commissioner(league_id)
  );

-- ─────────────────────────────────────────────
-- SCHEDULE_GAMES + GAME_RESULTS
-- ─────────────────────────────────────────────
CREATE POLICY "schedule_member_read" ON schedule_games FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "results_member_read" ON game_results FOR SELECT
  USING (is_league_member(league_id));

-- ─────────────────────────────────────────────
-- TEAM_SEASON_STATS
-- ─────────────────────────────────────────────
CREATE POLICY "stats_member_read" ON team_season_stats FOR SELECT
  USING (is_league_member(league_id));

-- ─────────────────────────────────────────────
-- NEWS_FEED_ITEMS
-- ─────────────────────────────────────────────
CREATE POLICY "news_member_read" ON news_feed_items FOR SELECT
  USING (is_league_member(league_id));

-- ─────────────────────────────────────────────
-- WEEK_PROCESSING_LOG
-- ─────────────────────────────────────────────
CREATE POLICY "wpl_commish_read" ON week_processing_log FOR SELECT
  USING (is_commissioner(league_id));

-- ─────────────────────────────────────────────
-- AD_DECISIONS
-- ─────────────────────────────────────────────
CREATE POLICY "ad_member_read" ON ad_decisions FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "ad_own_insert" ON ad_decisions FOR INSERT
  WITH CHECK (
    is_league_member(league_id) AND
    team_id = get_user_team_id(league_id)
  );

-- ─────────────────────────────────────────────
-- CONFERENCES + CONFERENCE_MEMBERS
-- ─────────────────────────────────────────────
CREATE POLICY "conf_member_read" ON conferences FOR SELECT
  USING (is_league_member(league_id));

CREATE POLICY "conf_members_read" ON conference_members FOR SELECT
  USING (is_league_member(league_id));
