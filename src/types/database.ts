// Auto-generated type definitions for Supabase tables
// Run: supabase gen types typescript --local > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LeaguePhase = 'setup' | 'preseason' | 'regular_season' | 'conf_tournament' | 'nat_tournament' | 'offseason';
export type AdvanceMode = 'manual' | 'auto_all_ready' | 'auto_timer';
export type MemberRole = 'commissioner' | 'co_commish' | 'user' | 'read_only';
export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type PlayerYear = 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
export type DevTrait = 'normal' | 'impact' | 'star' | 'elite';
export type RecruitStatus = 'available' | 'considering' | 'committed' | 'signed' | 'passed';
export type PortalStatus = 'open' | 'committed' | 'withdrawn' | 'expired';
export type ProcessingStatus = 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          abbreviation: string;
          conference: string;
          division: string;
          prestige: number;
          color_primary: string;
          color_secondary: string;
          city: string | null;
          state: string | null;
          arena_name: string | null;
          arena_capacity: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['schools']['Insert']>;
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          commissioner_id: string;
          season: number;
          current_week: number;
          phase: LeaguePhase;
          advance_mode: AdvanceMode;
          advance_timer_hours: number | null;
          last_advance_at: string | null;
          max_teams: number;
          is_public: boolean;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leagues']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leagues']['Insert']>;
      };
      league_members: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          role: MemberRole;
          team_id: string | null;
          display_name: string | null;
          joined_at: string;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['league_members']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['league_members']['Insert']>;
      };
      league_teams: {
        Row: {
          id: string;
          league_id: string;
          school_id: string;
          coach_first_name: string;
          coach_last_name: string;
          coach_prestige: number;
          coach_offense_style: string;
          coach_defense_style: string;
          prestige: number;
          facilities_level: number;
          program_momentum: number;
          fan_interest: number;
          nil_bank: number;
          nil_weekly_income: number;
          nil_weekly_spent: number;
          operations_budget: number;
          wins: number;
          losses: number;
          conf_wins: number;
          conf_losses: number;
          team_overall: number;
          is_locked: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['league_teams']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['league_teams']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          league_id: string;
          team_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number | null;
          position: PlayerPosition;
          overall: number;
          potential: number;
          dev_trait: DevTrait;
          attr_speed: number;
          attr_ball_handling: number;
          attr_shooting_2pt: number;
          attr_shooting_3pt: number;
          attr_defense: number;
          attr_rebounding: number;
          attr_iq: number;
          attr_athleticism: number;
          attr_free_throw: number;
          attr_passing: number;
          year: PlayerYear;
          is_redshirt: boolean;
          eligibility_years_remaining: number;
          seasons_played: number;
          is_starter: boolean;
          depth_chart_pos: number;
          morale: number;
          is_injured: boolean;
          injury_weeks_remaining: number;
          nil_weekly_deal: number;
          in_portal: boolean;
          stat_games_played: number;
          stat_points_per_game: number;
          stat_rebounds_per_game: number;
          stat_assists_per_game: number;
          stat_minutes_per_game: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      league_recruits: {
        Row: {
          id: string;
          league_id: string;
          template_id: string | null;
          first_name: string;
          last_name: string;
          position: PlayerPosition;
          stars: number;
          overall: number;
          potential: number;
          dev_trait: DevTrait;
          home_state: string | null;
          pref_proximity: number;
          pref_prestige: number;
          pref_nil: number;
          pref_playing_time: number;
          pref_coach_stability: number;
          status: RecruitStatus;
          interest_team_ids: string[];
          committed_to_team_id: string | null;
          commit_week: number | null;
          commit_score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['league_recruits']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['league_recruits']['Insert']>;
      };
      game_results: {
        Row: {
          id: string;
          league_id: string;
          game_id: string;
          season: number;
          week: number;
          home_team_id: string;
          away_team_id: string;
          home_score: number;
          away_score: number;
          winner_team_id: string;
          home_stats_json: Json;
          away_stats_json: Json;
          key_plays_json: Json;
          sim_seed: number | null;
          overtime_periods: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_results']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['game_results']['Insert']>;
      };
      news_feed_items: {
        Row: {
          id: number;
          league_id: string;
          season: number;
          week: number;
          type: string;
          importance: number;
          headline: string;
          body: string | null;
          team_id: string | null;
          player_id: string | null;
          recruit_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['news_feed_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['news_feed_items']['Insert']>;
      };
      team_week_state: {
        Row: {
          id: string;
          league_id: string;
          team_id: string;
          week: number;
          is_ready: boolean;
          ready_at: string | null;
          recruiting_points_used: number;
          recruiting_points_budget: number;
          nil_spent_this_week: number;
          nil_budget_this_week: number;
          ad_decision_made: boolean;
          ad_choice_key: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_week_state']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['team_week_state']['Insert']>;
      };
      team_season_stats: {
        Row: {
          id: string;
          league_id: string;
          team_id: string;
          season: number;
          wins: number;
          losses: number;
          conf_wins: number;
          conf_losses: number;
          points_scored: number;
          points_allowed: number;
          total_games: number;
          conf_tournament_result: string | null;
          nat_tournament_seed: number | null;
          nat_tournament_result: string | null;
          streak_type: string;
          streak_count: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_season_stats']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['team_season_stats']['Insert']>;
      };
      league_audit_log: {
        Row: {
          id: number;
          league_id: string;
          actor_id: string | null;
          action: string;
          payload: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['league_audit_log']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: {
      league_standings: {
        Row: {
          league_id: string;
          season: number;
          team_id: string;
          school_name: string;
          short_name: string;
          abbreviation: string;
          coach_last_name: string;
          prestige: number;
          team_overall: number;
          wins: number;
          losses: number;
          conf_wins: number;
          conf_losses: number;
          points_scored: number;
          points_allowed: number;
          ppg: number;
          papg: number;
          streak_type: string;
          streak_count: number;
          conference_id: string | null;
          conference_name: string | null;
        };
      };
      league_ready_status: {
        Row: {
          league_id: string;
          user_id: string;
          display_name: string | null;
          team_id: string | null;
          team_name: string | null;
          is_ready: boolean;
          ready_at: string | null;
          week: number;
        };
      };
    };
    Functions: {
      rpc_create_league: { Args: { p_name: string; p_advance_mode?: string }; Returns: Json };
      rpc_join_league: { Args: { p_invite_code: string }; Returns: Json };
      rpc_claim_team: { Args: { p_league_id: string; p_team_id: string }; Returns: Json };
      rpc_recruiting_action: { Args: { p_league_id: string; p_recruit_id: string; p_action_type: string; p_points_spent?: number; p_scholarship_offered?: boolean }; Returns: Json };
      rpc_portal_offer: { Args: { p_league_id: string; p_portal_entry_id: string; p_nil_offer: number; p_points_spent?: number }; Returns: Json };
      rpc_mark_ready: { Args: { p_league_id: string }; Returns: Json };
      rpc_ad_decision: { Args: { p_league_id: string; p_choice_key: string; p_choice_label: string }; Returns: Json };
      rpc_commish_assign_team: { Args: { p_league_id: string; p_user_id: string; p_team_id: string }; Returns: Json };
      rpc_commish_edit_rule: { Args: { p_league_id: string; p_key: string; p_value: string }; Returns: Json };
      rpc_commish_lock_team: { Args: { p_league_id: string; p_team_id: string; p_locked: boolean }; Returns: Json };
      rpc_commish_remove_user: { Args: { p_league_id: string; p_user_id: string }; Returns: Json };
    };
    Views: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
