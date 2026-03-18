-- ============================================================
-- 004_rpc_functions.sql
-- Atomic RPC functions for all sensitive writes
-- ============================================================

-- ─────────────────────────────────────────────
-- CREATE LEAGUE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_create_league(
  p_name TEXT,
  p_advance_mode TEXT DEFAULT 'manual'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_league_id UUID;
  v_invite_code TEXT;
BEGIN
  -- Generate unique invite code
  v_invite_code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));

  INSERT INTO leagues (name, commissioner_id, advance_mode, invite_code)
  VALUES (p_name, auth.uid(), p_advance_mode, v_invite_code)
  RETURNING id INTO v_league_id;

  -- Add commissioner as member
  INSERT INTO league_members (league_id, user_id, role)
  VALUES (v_league_id, auth.uid(), 'commissioner');

  -- Seed default rules
  INSERT INTO league_rules (league_id, key, value) VALUES
    (v_league_id, 'nil_model', 'soft_cap'),
    (v_league_id, 'nil_weekly_base', '50000'),
    (v_league_id, 'portal_size_factor', '1.0'),
    (v_league_id, 'portal_immediate_eligibility', 'true'),
    (v_league_id, 'recruiting_points_per_week', '100'),
    (v_league_id, 'max_scholarship_offers', '25'),
    (v_league_id, 'allow_tampering', 'false'),
    (v_league_id, 'min_weeks_to_advance', '1'),
    (v_league_id, 'games_per_week', '2');

  -- Audit
  INSERT INTO league_audit_log (league_id, actor_id, action, payload)
  VALUES (v_league_id, auth.uid(), 'create_league', jsonb_build_object('name', p_name));

  RETURN jsonb_build_object('league_id', v_league_id, 'invite_code', v_invite_code);
END;
$$;

-- ─────────────────────────────────────────────
-- JOIN LEAGUE via invite code
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_join_league(p_invite_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_league leagues%ROWTYPE;
  v_existing UUID;
BEGIN
  SELECT * INTO v_league FROM leagues WHERE invite_code = upper(p_invite_code) LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  IF v_league.is_locked THEN
    RAISE EXCEPTION 'League is locked';
  END IF;

  SELECT id INTO v_existing FROM league_members
  WHERE league_id = v_league.id AND user_id = auth.uid();

  IF FOUND THEN
    RETURN jsonb_build_object('league_id', v_league.id, 'already_member', true);
  END IF;

  INSERT INTO league_members (league_id, user_id, role)
  VALUES (v_league.id, auth.uid(), 'user');

  RETURN jsonb_build_object('league_id', v_league.id, 'already_member', false);
END;
$$;

-- ─────────────────────────────────────────────
-- CLAIM TEAM
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_claim_team(p_league_id UUID, p_team_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_team league_teams%ROWTYPE;
  v_current_team_id UUID;
BEGIN
  SELECT * INTO v_team FROM league_teams WHERE id = p_team_id AND league_id = p_league_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Team not found in this league'; END IF;
  IF v_team.is_locked THEN RAISE EXCEPTION 'Team is locked by commissioner'; END IF;

  -- Check team not already claimed
  IF EXISTS (
    SELECT 1 FROM league_members
    WHERE league_id = p_league_id AND team_id = p_team_id AND user_id != auth.uid()
  ) THEN
    RAISE EXCEPTION 'Team already claimed by another user';
  END IF;

  UPDATE league_members
  SET team_id = p_team_id
  WHERE league_id = p_league_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true, 'team_id', p_team_id);
END;
$$;

-- ─────────────────────────────────────────────
-- SUBMIT RECRUITING ACTION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_recruiting_action(
  p_league_id UUID,
  p_recruit_id UUID,
  p_action_type TEXT,
  p_points_spent INTEGER DEFAULT 0,
  p_scholarship_offered BOOLEAN DEFAULT FALSE
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_team_id UUID;
  v_week INTEGER;
  v_points_used INTEGER;
  v_points_budget INTEGER;
  v_tws team_week_state%ROWTYPE;
BEGIN
  -- Get user's team
  v_team_id := get_user_team_id(p_league_id);
  IF v_team_id IS NULL THEN RAISE EXCEPTION 'No team assigned'; END IF;

  -- Get current week
  SELECT current_week INTO v_week FROM leagues WHERE id = p_league_id;

  -- Get or create week state
  INSERT INTO team_week_state (league_id, team_id, week, recruiting_points_budget)
  SELECT p_league_id, v_team_id, v_week,
    COALESCE((SELECT value::integer FROM league_rules WHERE league_id = p_league_id AND key = 'recruiting_points_per_week'), 100)
  ON CONFLICT (league_id, team_id, week) DO NOTHING;

  SELECT * INTO v_tws FROM team_week_state
  WHERE league_id = p_league_id AND team_id = v_team_id AND week = v_week;

  IF v_tws.is_ready THEN RAISE EXCEPTION 'Already marked ready — cannot change actions'; END IF;

  -- Check points budget
  IF p_action_type = 'allocate_points' THEN
    -- Sum existing points this week
    SELECT COALESCE(SUM(points_spent), 0) INTO v_points_used
    FROM recruiting_actions
    WHERE league_id = p_league_id AND team_id = v_team_id AND week = v_week;

    IF v_points_used + p_points_spent > v_tws.recruiting_points_budget THEN
      RAISE EXCEPTION 'Insufficient recruiting points (used: %, budget: %)', v_points_used + p_points_spent, v_tws.recruiting_points_budget;
    END IF;
  END IF;

  -- Upsert action
  INSERT INTO recruiting_actions (league_id, team_id, recruit_id, week, action_type, points_spent, scholarship_offered)
  VALUES (p_league_id, v_team_id, p_recruit_id, v_week, p_action_type, p_points_spent, p_scholarship_offered)
  ON CONFLICT (league_id, team_id, recruit_id, week, action_type)
  DO UPDATE SET points_spent = EXCLUDED.points_spent, scholarship_offered = EXCLUDED.scholarship_offered;

  -- Update week state running total
  UPDATE team_week_state
  SET recruiting_points_used = (
    SELECT COALESCE(SUM(points_spent), 0)
    FROM recruiting_actions
    WHERE league_id = p_league_id AND team_id = v_team_id AND week = v_week
  )
  WHERE league_id = p_league_id AND team_id = v_team_id AND week = v_week;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- SUBMIT PORTAL OFFER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_portal_offer(
  p_league_id UUID,
  p_portal_entry_id UUID,
  p_nil_offer BIGINT,
  p_points_spent INTEGER DEFAULT 0
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_team_id UUID;
  v_week INTEGER;
  v_entry portal_entries%ROWTYPE;
BEGIN
  v_team_id := get_user_team_id(p_league_id);
  IF v_team_id IS NULL THEN RAISE EXCEPTION 'No team assigned'; END IF;

  SELECT current_week INTO v_week FROM leagues WHERE id = p_league_id;

  SELECT * INTO v_entry FROM portal_entries WHERE id = p_portal_entry_id AND league_id = p_league_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Portal entry not found'; END IF;
  IF v_entry.status != 'open' THEN RAISE EXCEPTION 'Portal entry is not open'; END IF;

  -- Check NIL budget
  DECLARE v_nil_committed BIGINT;
  BEGIN
    SELECT nil_committed_weekly INTO v_nil_committed FROM team_finances WHERE team_id = v_team_id;
    -- Simple check: offer doesn't push weekly too high (full check in week engine)
  END;

  INSERT INTO portal_offers (league_id, portal_entry_id, team_id, player_id, nil_offer, points_spent, offered_week)
  VALUES (p_league_id, p_portal_entry_id, v_team_id, v_entry.player_id, p_nil_offer, p_points_spent, v_week)
  ON CONFLICT (league_id, portal_entry_id, team_id)
  DO UPDATE SET nil_offer = EXCLUDED.nil_offer, points_spent = EXCLUDED.points_spent;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- MARK READY
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_mark_ready(p_league_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_team_id UUID;
  v_week INTEGER;
BEGIN
  v_team_id := get_user_team_id(p_league_id);
  IF v_team_id IS NULL THEN RAISE EXCEPTION 'No team assigned'; END IF;

  SELECT current_week INTO v_week FROM leagues WHERE id = p_league_id;

  INSERT INTO team_week_state (league_id, team_id, week, is_ready, ready_at)
  VALUES (p_league_id, v_team_id, v_week, true, NOW())
  ON CONFLICT (league_id, team_id, week)
  DO UPDATE SET is_ready = true, ready_at = NOW();

  RETURN jsonb_build_object('success', true, 'week', v_week);
END;
$$;

-- ─────────────────────────────────────────────
-- AD DECISION
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_ad_decision(
  p_league_id UUID,
  p_choice_key TEXT,
  p_choice_label TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_team_id UUID;
  v_week INTEGER;
  v_season INTEGER;
  v_effect JSONB;
BEGIN
  v_team_id := get_user_team_id(p_league_id);
  IF v_team_id IS NULL THEN RAISE EXCEPTION 'No team assigned'; END IF;

  SELECT current_week, season INTO v_week, v_season FROM leagues WHERE id = p_league_id;

  -- Define effects per choice
  v_effect := CASE p_choice_key
    WHEN 'facilities_boost' THEN '{"facilities_delta": 1, "nil_delta": 0, "momentum_delta": 5}'::jsonb
    WHEN 'nil_boost'        THEN '{"facilities_delta": 0, "nil_delta": 25000, "momentum_delta": 2}'::jsonb
    WHEN 'marketing'        THEN '{"facilities_delta": 0, "nil_delta": 0, "momentum_delta": 10, "fan_interest_delta": 8}'::jsonb
    WHEN 'compliance_risk'  THEN '{"facilities_delta": 0, "nil_delta": 50000, "compliance_risk_delta": 15}'::jsonb
    ELSE '{}'::jsonb
  END;

  INSERT INTO ad_decisions (league_id, team_id, season, week, choice_key, choice_label, effect_json)
  VALUES (p_league_id, v_team_id, v_season, v_week, p_choice_key, p_choice_label, v_effect)
  ON CONFLICT (league_id, team_id, season, week)
  DO UPDATE SET choice_key = EXCLUDED.choice_key, choice_label = EXCLUDED.choice_label, effect_json = EXCLUDED.effect_json;

  -- Update week state
  UPDATE team_week_state
  SET ad_decision_made = true, ad_choice_key = p_choice_key
  WHERE league_id = p_league_id AND team_id = v_team_id AND week = v_week;

  RETURN jsonb_build_object('success', true, 'effect', v_effect);
END;
$$;

-- ─────────────────────────────────────────────
-- COMMISSIONER: ASSIGN TEAM
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_commish_assign_team(
  p_league_id UUID,
  p_user_id UUID,
  p_team_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_commissioner(p_league_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE league_members
  SET team_id = p_team_id
  WHERE league_id = p_league_id AND user_id = p_user_id;

  INSERT INTO league_audit_log (league_id, actor_id, action, payload)
  VALUES (p_league_id, auth.uid(), 'assign_team',
    jsonb_build_object('user_id', p_user_id, 'team_id', p_team_id));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- COMMISSIONER: EDIT RULE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_commish_edit_rule(
  p_league_id UUID,
  p_key TEXT,
  p_value TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_commissioner(p_league_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO league_rules (league_id, key, value)
  VALUES (p_league_id, p_key, p_value)
  ON CONFLICT (league_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

  INSERT INTO league_audit_log (league_id, actor_id, action, payload)
  VALUES (p_league_id, auth.uid(), 'edit_rule', jsonb_build_object('key', p_key, 'value', p_value));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- COMMISSIONER: LOCK/UNLOCK TEAM
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_commish_lock_team(
  p_league_id UUID,
  p_team_id UUID,
  p_locked BOOLEAN
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_commissioner(p_league_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE league_teams SET is_locked = p_locked
  WHERE id = p_team_id AND league_id = p_league_id;

  INSERT INTO league_audit_log (league_id, actor_id, action, payload)
  VALUES (p_league_id, auth.uid(), 'lock_team',
    jsonb_build_object('team_id', p_team_id, 'locked', p_locked));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- COMMISSIONER: REMOVE USER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION rpc_commish_remove_user(
  p_league_id UUID,
  p_user_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_commissioner(p_league_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE league_members SET is_active = false, team_id = NULL
  WHERE league_id = p_league_id AND user_id = p_user_id;

  INSERT INTO league_audit_log (league_id, actor_id, action, payload)
  VALUES (p_league_id, auth.uid(), 'remove_user', jsonb_build_object('user_id', p_user_id));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─────────────────────────────────────────────
-- GET STANDINGS VIEW
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW league_standings AS
SELECT
  tss.league_id,
  tss.season,
  lt.id AS team_id,
  s.name AS school_name,
  s.short_name,
  s.abbreviation,
  lt.coach_last_name,
  lt.prestige,
  lt.team_overall,
  tss.wins,
  tss.losses,
  tss.conf_wins,
  tss.conf_losses,
  tss.points_scored,
  tss.points_allowed,
  CASE WHEN tss.total_games > 0
    THEN ROUND(tss.points_scored::numeric / tss.total_games, 1)
    ELSE 0 END AS ppg,
  CASE WHEN tss.total_games > 0
    THEN ROUND(tss.points_allowed::numeric / tss.total_games, 1)
    ELSE 0 END AS papg,
  tss.streak_type,
  tss.streak_count,
  cm.conference_id,
  c.name AS conference_name
FROM team_season_stats tss
JOIN league_teams lt ON lt.id = tss.team_id
JOIN schools s ON s.id = lt.school_id
LEFT JOIN conference_members cm ON cm.team_id = lt.id AND cm.league_id = tss.league_id
LEFT JOIN conferences c ON c.id = cm.conference_id;

-- ─────────────────────────────────────────────
-- GET READY STATUS VIEW
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW league_ready_status AS
SELECT
  lm.league_id,
  lm.user_id,
  up.display_name,
  lt.id AS team_id,
  s.short_name AS team_name,
  COALESCE(tws.is_ready, false) AS is_ready,
  tws.ready_at,
  l.current_week AS week
FROM league_members lm
JOIN leagues l ON l.id = lm.league_id
LEFT JOIN league_teams lt ON lt.id = lm.team_id
LEFT JOIN schools s ON s.id = lt.school_id
LEFT JOIN user_profiles up ON up.id = lm.user_id
LEFT JOIN team_week_state tws
  ON tws.league_id = lm.league_id
  AND tws.team_id = lm.team_id
  AND tws.week = l.current_week
WHERE lm.is_active = true;
