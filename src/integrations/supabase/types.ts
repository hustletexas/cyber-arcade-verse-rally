export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievement_progress: {
        Row: {
          achievement_id: string
          current_progress: number
          id: string
          last_updated: string
          metadata: Json | null
          target_progress: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          current_progress?: number
          id?: string
          last_updated?: string
          metadata?: Json | null
          target_progress?: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          current_progress?: number
          id?: string
          last_updated?: string
          metadata?: Json | null
          target_progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points: number
          requirements: Json | null
          unlock_condition: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          difficulty?: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          requirements?: Json | null
          unlock_condition: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          requirements?: Json | null
          unlock_condition?: string
          updated_at?: string
        }
        Relationships: []
      }
      arcade_tournaments: {
        Row: {
          admin_id: string
          bracket_data: Json | null
          created_at: string | null
          custom_payout_percentages: Json | null
          description: string | null
          entry_fee_usd: number | null
          entry_fee_usdc: number | null
          format: Database["public"]["Enums"]["tournament_format"]
          game: string
          id: string
          max_players: number
          min_players: number
          payout_schema: Database["public"]["Enums"]["payout_schema"]
          prize_pool_usd: number | null
          registration_deadline: string | null
          required_pass_tier: string | null
          requires_pass: boolean | null
          rules: string | null
          start_time: string
          status: Database["public"]["Enums"]["tournament_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          bracket_data?: Json | null
          created_at?: string | null
          custom_payout_percentages?: Json | null
          description?: string | null
          entry_fee_usd?: number | null
          entry_fee_usdc?: number | null
          format?: Database["public"]["Enums"]["tournament_format"]
          game: string
          id?: string
          max_players?: number
          min_players?: number
          payout_schema?: Database["public"]["Enums"]["payout_schema"]
          prize_pool_usd?: number | null
          registration_deadline?: string | null
          required_pass_tier?: string | null
          requires_pass?: boolean | null
          rules?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["tournament_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          bracket_data?: Json | null
          created_at?: string | null
          custom_payout_percentages?: Json | null
          description?: string | null
          entry_fee_usd?: number | null
          entry_fee_usdc?: number | null
          format?: Database["public"]["Enums"]["tournament_format"]
          game?: string
          id?: string
          max_players?: number
          min_players?: number
          payout_schema?: Database["public"]["Enums"]["payout_schema"]
          prize_pool_usd?: number | null
          registration_deadline?: string | null
          required_pass_tier?: string | null
          requires_pass?: boolean | null
          rules?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          room_id: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          room_id: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          room_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_participants: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cyberdrop_plays: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean
          played_on_date: string
          reward_amount: number
          slot_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean
          played_on_date?: string
          reward_amount?: number
          slot_index: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean
          played_on_date?: string
          reward_amount?: number
          slot_index?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_limits: {
        Row: {
          last_play_date: string
          plays_today: number
          user_id: string
        }
        Insert: {
          last_play_date?: string
          plays_today?: number
          user_id: string
        }
        Update: {
          last_play_date?: string
          plays_today?: number
          user_id?: string
        }
        Relationships: []
      }
      dj_completed_mixes: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          is_featured: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          id?: string
          is_featured?: boolean
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          is_featured?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_cues: {
        Row: {
          color: string | null
          created_at: string
          cue_index: number
          id: string
          label: string | null
          time_position: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          cue_index: number
          id?: string
          label?: string | null
          time_position?: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          cue_index?: number
          id?: string
          label?: string | null
          time_position?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_milestones: {
        Row: {
          claim_eligible: boolean
          claim_transaction_hash: string | null
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          milestone_type: string
          mix_count: number
          reached_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_eligible?: boolean
          claim_transaction_hash?: string | null
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          milestone_type: string
          mix_count?: number
          reached_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claim_eligible?: boolean
          claim_transaction_hash?: string | null
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          milestone_type?: string
          mix_count?: number
          reached_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_sets: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          mix_url: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mix_url: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mix_url?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_uploads: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          artist: string
          bpm: number | null
          created_at: string
          duration_seconds: number | null
          file_path: string
          file_size_bytes: number
          genre: string | null
          id: string
          rejection_reason: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          artist: string
          bpm?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          file_size_bytes?: number
          genre?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          artist?: string
          bpm?: number | null
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          file_size_bytes?: number
          genre?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_scores: {
        Row: {
          created_at: string
          id: string
          mismatches: number
          moves: number
          score: number
          time_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mismatches?: number
          moves: number
          score: number
          time_seconds: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mismatches?: number
          moves?: number
          score?: number
          time_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      nft_creation_orders: {
        Row: {
          artwork_url: string | null
          cctr_cost: number
          created_at: string
          creator_name: string
          description: string | null
          id: string
          metadata: Json | null
          mint_address: string | null
          music_url: string | null
          nft_type: string
          status: string
          title: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_url?: string | null
          cctr_cost?: number
          created_at?: string
          creator_name: string
          description?: string | null
          id?: string
          metadata?: Json | null
          mint_address?: string | null
          music_url?: string | null
          nft_type?: string
          status?: string
          title: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_url?: string | null
          cctr_cost?: number
          created_at?: string
          creator_name?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          mint_address?: string | null
          music_url?: string | null
          nft_type?: string
          status?: string
          title?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nft_mints: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          mint_address: string
          nft_name: string
          status: string
          transaction_hash: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          mint_address: string
          nft_name: string
          status?: string
          transaction_hash: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          mint_address?: string
          nft_name?: string
          status?: string
          transaction_hash?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      nft_purchases: {
        Row: {
          created_at: string
          currency: string
          id: string
          nft_id: string
          nft_name: string
          price: number
          status: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          nft_id: string
          nft_name: string
          price: number
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          nft_id?: string
          nft_name?: string
          price?: number
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      node_purchases: {
        Row: {
          created_at: string
          id: string
          mint_address: string | null
          node_type: string
          price_sol: number
          quantity: number
          transaction_hash: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          mint_address?: string | null
          node_type: string
          price_sol: number
          quantity?: number
          transaction_hash: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          mint_address?: string | null
          node_type?: string
          price_sol?: number
          quantity?: number
          transaction_hash?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      node_rewards: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          reward_amount: number
          reward_date: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          reward_amount: number
          reward_date?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          reward_amount?: number
          reward_date?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      portal_breaker_scores: {
        Row: {
          created_at: string
          id: string
          level: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      prizes: {
        Row: {
          contract_address: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          metadata_uri: string | null
          name: string
          prize_type: string
          updated_at: string
        }
        Insert: {
          contract_address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata_uri?: string | null
          name: string
          prize_type?: string
          updated_at?: string
        }
        Update: {
          contract_address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          metadata_uri?: string | null
          name?: string
          prize_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          updated_at: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      radio_listen_sessions: {
        Row: {
          created_at: string
          id: string
          listen_date: string
          session_count: number
          total_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listen_date?: string
          session_count?: number
          total_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listen_date?: string
          session_count?: number
          total_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      radio_milestone_claims: {
        Row: {
          claimed_at: string
          id: string
          milestone_type: string
          milestone_value: number
          reward_description: string | null
          reward_type: string
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          milestone_type: string
          milestone_value: number
          reward_description?: string | null
          reward_type: string
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          milestone_type?: string
          milestone_value?: number
          reward_description?: string | null
          reward_type?: string
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      radio_streaks: {
        Row: {
          current_streak: number
          last_listen_date: string | null
          longest_streak: number
          tier: string
          total_listen_days: number
          total_listen_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_listen_date?: string | null
          longest_streak?: number
          tier?: string
          total_listen_days?: number
          total_listen_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_listen_date?: string | null
          longest_streak?: number
          tier?: string
          total_listen_days?: number
          total_listen_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      raffle_tickets: {
        Row: {
          id: string
          purchased_at: string
          raffle_id: string
          ticket_number: number
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string
          raffle_id: string
          ticket_number: number
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string
          raffle_id?: string
          ticket_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          max_tickets: number
          prize_image: string | null
          prize_name: string
          prize_type: string
          prize_value: number
          start_date: string
          status: string
          ticket_price: number
          tickets_sold: number
          title: string
          updated_at: string
          winner_user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          max_tickets?: number
          prize_image?: string | null
          prize_name: string
          prize_type: string
          prize_value: number
          start_date?: string
          status?: string
          ticket_price?: number
          tickets_sold?: number
          title: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          max_tickets?: number
          prize_image?: string | null
          prize_name?: string
          prize_type?: string
          prize_value?: number
          start_date?: string
          status?: string
          ticket_price?: number
          tickets_sold?: number
          title?: string
          updated_at?: string
          winner_user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          called_at: string
          created_at: string
          function_name: string
          id: string
          user_id: string
        }
        Insert: {
          called_at?: string
          created_at?: string
          function_name: string
          id?: string
          user_id: string
        }
        Update: {
          called_at?: string
          created_at?: string
          function_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          admin_notes: string | null
          amount: number
          claim_reason: string | null
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          source_id: string
          source_type: string
          status: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          claim_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          source_id: string
          source_type: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          claim_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          source_id?: string
          source_type?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      rewards_ledger: {
        Row: {
          claimed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          icon: string | null
          id: string
          requirement: string | null
          reward_name: string
          reward_source: string
          reward_type: string
          status: string
          unlock_info: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          requirement?: string | null
          reward_name: string
          reward_source: string
          reward_type?: string
          status?: string
          unlock_info?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          requirement?: string | null
          reward_name?: string
          reward_source?: string
          reward_type?: string
          status?: string
          unlock_info?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          id: string
          joined_at: string
          last_seen: string
          room_id: string
          user_id: string
          username: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_seen?: string
          room_id: string
          user_id: string
          username: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_seen?: string
          room_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_scores: {
        Row: {
          best_streak: number
          created_at: string
          id: string
          level: number
          mistakes: number
          mode: string
          score: number
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          id?: string
          level?: number
          mistakes?: number
          mode?: string
          score: number
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          id?: string
          level?: number
          mistakes?: number
          mode?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      solana_tournament_entries: {
        Row: {
          created_at: string
          entry_transaction_hash: string
          id: string
          joined_at: string
          placement: number | null
          reward_amount: number | null
          reward_claimed: boolean | null
          reward_transaction_hash: string | null
          score: number | null
          tournament_id: string
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          entry_transaction_hash: string
          id?: string
          joined_at?: string
          placement?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_transaction_hash?: string | null
          score?: number | null
          tournament_id: string
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          entry_transaction_hash?: string
          id?: string
          joined_at?: string
          placement?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_transaction_hash?: string | null
          score?: number | null
          tournament_id?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "solana_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "solana_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      solana_tournaments: {
        Row: {
          admin_wallet: string
          created_at: string
          current_players: number
          end_time: string | null
          entry_fee: number
          id: string
          max_players: number
          name: string
          prize_pool: number
          program_id: string
          start_time: string
          status: string
          tournament_account: string | null
          updated_at: string
          winner_wallet: string | null
        }
        Insert: {
          admin_wallet: string
          created_at?: string
          current_players?: number
          end_time?: string | null
          entry_fee?: number
          id?: string
          max_players?: number
          name: string
          prize_pool?: number
          program_id: string
          start_time: string
          status?: string
          tournament_account?: string | null
          updated_at?: string
          winner_wallet?: string | null
        }
        Update: {
          admin_wallet?: string
          created_at?: string
          current_players?: number
          end_time?: string | null
          entry_fee?: number
          id?: string
          max_players?: number
          name?: string
          prize_pool?: number
          program_id?: string
          start_time?: string
          status?: string
          tournament_account?: string | null
          updated_at?: string
          winner_wallet?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          album: string | null
          artist: string
          audio_url: string | null
          cover_art_url: string | null
          created_at: string
          duration: number | null
          genre: string | null
          id: string
          is_free: boolean
          is_purchasable: boolean
          play_count: number
          price_cctr: number
          release_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          album?: string | null
          artist: string
          audio_url?: string | null
          cover_art_url?: string | null
          created_at?: string
          duration?: number | null
          genre?: string | null
          id?: string
          is_free?: boolean
          is_purchasable?: boolean
          play_count?: number
          price_cctr?: number
          release_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          album?: string | null
          artist?: string
          audio_url?: string | null
          cover_art_url?: string | null
          created_at?: string
          duration?: number | null
          genre?: string | null
          id?: string
          is_free?: boolean
          is_purchasable?: boolean
          play_count?: number
          price_cctr?: number
          release_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      token_purchases: {
        Row: {
          amount: number
          created_at: string
          crypto_transaction_hash: string | null
          id: string
          payment_amount: number
          payment_currency: string
          payment_method: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_transaction_hash?: string | null
          id?: string
          payment_amount: number
          payment_currency?: string
          payment_method: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_transaction_hash?: string | null
          id?: string
          payment_amount?: number
          payment_currency?: string
          payment_method?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          nft_order_id: string | null
          tournament_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          nft_order_id?: string | null
          tournament_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          nft_order_id?: string | null
          tournament_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_nft_order_id_fkey"
            columns: ["nft_order_id"]
            isOneToOne: false
            referencedRelation: "nft_creation_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          bracket_position: string | null
          completed_at: string | null
          created_at: string | null
          dispute_reason: string | null
          disputed: boolean | null
          id: string
          match_code: string | null
          match_metadata: Json | null
          match_number: number
          player_a_id: string | null
          player_a_score: number | null
          player_a_wallet: string | null
          player_b_id: string | null
          player_b_score: number | null
          player_b_wallet: string | null
          reported_at: string | null
          reported_by: string | null
          round_number: number
          scheduled_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          tournament_id: string
          updated_at: string | null
          winner_id: string | null
          winner_wallet: string | null
        }
        Insert: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          disputed?: boolean | null
          id?: string
          match_code?: string | null
          match_metadata?: Json | null
          match_number: number
          player_a_id?: string | null
          player_a_score?: number | null
          player_a_wallet?: string | null
          player_b_id?: string | null
          player_b_score?: number | null
          player_b_wallet?: string | null
          reported_at?: string | null
          reported_by?: string | null
          round_number: number
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id: string
          updated_at?: string | null
          winner_id?: string | null
          winner_wallet?: string | null
        }
        Update: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          disputed?: boolean | null
          id?: string
          match_code?: string | null
          match_metadata?: Json | null
          match_number?: number
          player_a_id?: string | null
          player_a_score?: number | null
          player_a_wallet?: string | null
          player_b_id?: string | null
          player_b_score?: number | null
          player_b_wallet?: string | null
          reported_at?: string | null
          reported_by?: string | null
          round_number?: number
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id?: string
          updated_at?: string | null
          winner_id?: string | null
          winner_wallet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string
          id: string
          placement: number | null
          rewards_claimed: boolean | null
          tournament_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          placement?: number | null
          rewards_claimed?: boolean | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          placement?: number | null
          rewards_claimed?: boolean | null
          tournament_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_payouts: {
        Row: {
          amount_usd: number | null
          amount_usdc: number | null
          attestation_hash: string | null
          created_at: string | null
          deadline: string | null
          id: string
          nonce: string | null
          paid_at: string | null
          payout_method: string | null
          placement: number
          status: string | null
          tournament_id: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount_usd?: number | null
          amount_usdc?: number | null
          attestation_hash?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          nonce?: string | null
          paid_at?: string | null
          payout_method?: string | null
          placement: number
          status?: string | null
          tournament_id: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount_usd?: number | null
          amount_usdc?: number | null
          attestation_hash?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          nonce?: string | null
          paid_at?: string | null
          payout_method?: string | null
          placement?: number
          status?: string | null
          tournament_id?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_payouts_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          id: string
          pass_tier: string | null
          pass_verified: boolean | null
          payment_method: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          registered_at: string | null
          seed_number: number | null
          tournament_id: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          id?: string
          pass_tier?: string | null
          pass_verified?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          registered_at?: string | null
          seed_number?: number | null
          tournament_id: string
          user_id: string
          wallet_address: string
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          id?: string
          pass_tier?: string | null
          pass_verified?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          registered_at?: string | null
          seed_number?: number | null
          tournament_id?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_standings: {
        Row: {
          created_at: string | null
          finalized: boolean | null
          finalized_at: string | null
          id: string
          losses: number | null
          placement: number
          points: number | null
          prize_amount_usd: number | null
          prize_amount_usdc: number | null
          tournament_id: string
          user_id: string
          wallet_address: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          finalized?: boolean | null
          finalized_at?: string | null
          id?: string
          losses?: number | null
          placement: number
          points?: number | null
          prize_amount_usd?: number | null
          prize_amount_usdc?: number | null
          tournament_id: string
          user_id: string
          wallet_address: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          finalized?: boolean | null
          finalized_at?: string | null
          id?: string
          losses?: number | null
          placement?: number
          points?: number | null
          prize_amount_usd?: number | null
          prize_amount_usdc?: number | null
          tournament_id?: string
          user_id?: string
          wallet_address?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_standings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          name: string
          prize_pool: number | null
          start_date: string
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          name: string
          prize_pool?: number | null
          start_date: string
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          name?: string
          prize_pool?: number | null
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      trivia_cosmetics: {
        Row: {
          created_at: string
          css_theme: Json
          id: string
          is_active: boolean
          name: string
          preview_url: string | null
          rarity: Database["public"]["Enums"]["cosmetic_rarity"]
          type: Database["public"]["Enums"]["cosmetic_type"]
        }
        Insert: {
          created_at?: string
          css_theme?: Json
          id?: string
          is_active?: boolean
          name: string
          preview_url?: string | null
          rarity?: Database["public"]["Enums"]["cosmetic_rarity"]
          type: Database["public"]["Enums"]["cosmetic_type"]
        }
        Update: {
          created_at?: string
          css_theme?: Json
          id?: string
          is_active?: boolean
          name?: string
          preview_url?: string | null
          rarity?: Database["public"]["Enums"]["cosmetic_rarity"]
          type?: Database["public"]["Enums"]["cosmetic_type"]
        }
        Relationships: []
      }
      trivia_equipped_cosmetics: {
        Row: {
          avatar_frame_id: string | null
          banner_id: string | null
          button_skin_id: string | null
          card_skin_id: string | null
          updated_at: string
          user_id: string
          victory_fx_id: string | null
        }
        Insert: {
          avatar_frame_id?: string | null
          banner_id?: string | null
          button_skin_id?: string | null
          card_skin_id?: string | null
          updated_at?: string
          user_id: string
          victory_fx_id?: string | null
        }
        Update: {
          avatar_frame_id?: string | null
          banner_id?: string | null
          button_skin_id?: string | null
          card_skin_id?: string | null
          updated_at?: string
          user_id?: string
          victory_fx_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trivia_equipped_cosmetics_avatar_frame_id_fkey"
            columns: ["avatar_frame_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_equipped_cosmetics_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_equipped_cosmetics_button_skin_id_fkey"
            columns: ["button_skin_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_equipped_cosmetics_card_skin_id_fkey"
            columns: ["card_skin_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_equipped_cosmetics_victory_fx_id_fkey"
            columns: ["victory_fx_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_questions_v2: {
        Row: {
          answers: Json
          category: string
          correct_index: number
          created_at: string
          difficulty: string
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answers: Json
          category: string
          correct_index: number
          created_at?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          category?: string
          correct_index?: number
          created_at?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      trivia_run_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          run_id: string
          selected_index: number | null
          time_remaining: number
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id: string
          run_id: string
          selected_index?: number | null
          time_remaining?: number
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          run_id?: string
          selected_index?: number | null
          time_remaining?: number
        }
        Relationships: [
          {
            foreignKeyName: "trivia_run_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "trivia_questions_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_run_answers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "trivia_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trivia_run_answers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "trivia_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_runs: {
        Row: {
          best_streak: number
          combo_multiplier: number
          correct_count: number
          created_at: string
          current_streak: number
          ended_at: string | null
          id: string
          is_active: boolean
          lives_remaining: number | null
          mode: Database["public"]["Enums"]["trivia_mode"]
          score: number
          speed_bonus: number
          started_at: string
          total_questions: number
          user_id: string
        }
        Insert: {
          best_streak?: number
          combo_multiplier?: number
          correct_count?: number
          created_at?: string
          current_streak?: number
          ended_at?: string | null
          id?: string
          is_active?: boolean
          lives_remaining?: number | null
          mode: Database["public"]["Enums"]["trivia_mode"]
          score?: number
          speed_bonus?: number
          started_at?: string
          total_questions?: number
          user_id: string
        }
        Update: {
          best_streak?: number
          combo_multiplier?: number
          correct_count?: number
          created_at?: string
          current_streak?: number
          ended_at?: string | null
          id?: string
          is_active?: boolean
          lives_remaining?: number | null
          mode?: Database["public"]["Enums"]["trivia_mode"]
          score?: number
          speed_bonus?: number
          started_at?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      trivia_user_cosmetics: {
        Row: {
          cosmetic_id: string
          id: string
          owned_at: string
          user_id: string
        }
        Insert: {
          cosmetic_id: string
          id?: string
          owned_at?: string
          user_id: string
        }
        Update: {
          cosmetic_id?: string
          id?: string
          owned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_user_cosmetics_cosmetic_id_fkey"
            columns: ["cosmetic_id"]
            isOneToOne: false
            referencedRelation: "trivia_cosmetics"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_user_stats: {
        Row: {
          accuracy: number
          best_daily_score: number
          best_streak: number
          created_at: string
          daily_spin_used_at: string | null
          last_login_date: string | null
          lifeline_5050_charges: number
          lifeline_skip_charges: number
          lifeline_time_charges: number
          tickets_balance: number
          total_correct: number
          total_questions: number
          total_runs: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          best_daily_score?: number
          best_streak?: number
          created_at?: string
          daily_spin_used_at?: string | null
          last_login_date?: string | null
          lifeline_5050_charges?: number
          lifeline_skip_charges?: number
          lifeline_time_charges?: number
          tickets_balance?: number
          total_correct?: number
          total_questions?: number
          total_runs?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number
          best_daily_score?: number
          best_streak?: number
          created_at?: string
          daily_spin_used_at?: string | null
          last_login_date?: string | null
          lifeline_5050_charges?: number
          lifeline_skip_charges?: number
          lifeline_time_charges?: number
          tickets_balance?: number
          total_correct?: number
          total_questions?: number
          total_runs?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          earned_at: string
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          earned_at?: string
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          cctr_balance: number | null
          claimable_rewards: number | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          cctr_balance?: number | null
          claimable_rewards?: number | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          cctr_balance?: number | null
          claimable_rewards?: number | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prizes: {
        Row: {
          created_at: string
          id: string
          prize_id: string
          redeemed_at: string | null
          redemption_status: string
          redemption_transaction_hash: string | null
          shipping_address: string | null
          source_id: string
          source_type: string
          updated_at: string
          user_id: string
          wallet_address: string | null
          won_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prize_id: string
          redeemed_at?: string | null
          redemption_status?: string
          redemption_transaction_hash?: string | null
          shipping_address?: string | null
          source_id: string
          source_type: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          won_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prize_id?: string
          redeemed_at?: string | null
          redemption_status?: string
          redemption_transaction_hash?: string | null
          shipping_address?: string | null
          source_id?: string
          source_type?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          won_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prizes_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_song_purchases: {
        Row: {
          created_at: string
          id: string
          purchase_price: number
          purchased_at: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_price: number
          purchased_at?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          purchase_price?: number
          purchased_at?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_song_purchases_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string
          id: string
          wallet: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          wallet?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          wallet?: string | null
        }
        Relationships: []
      }
      weekly_reward_distributions: {
        Row: {
          ccc_awarded: number
          chest_awarded: boolean
          created_at: string
          distributed_at: string
          id: string
          placement: number
          raffle_ticket_awarded: boolean
          total_score: number
          wallet_address: string
          week_end: string
          week_start: string
        }
        Insert: {
          ccc_awarded?: number
          chest_awarded?: boolean
          created_at?: string
          distributed_at?: string
          id?: string
          placement: number
          raffle_ticket_awarded?: boolean
          total_score?: number
          wallet_address: string
          week_end: string
          week_start: string
        }
        Update: {
          ccc_awarded?: number
          chest_awarded?: boolean
          created_at?: string
          distributed_at?: string
          id?: string
          placement?: number
          raffle_ticket_awarded?: boolean
          total_score?: number
          wallet_address?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      winner_chest_claims: {
        Row: {
          claimed_at: string
          created_at: string
          id: string
          reward_type: string | null
          reward_value: string | null
          source_id: string
          source_type: string
          wallet_address: string
        }
        Insert: {
          claimed_at?: string
          created_at?: string
          id?: string
          reward_type?: string | null
          reward_value?: string | null
          source_id: string
          source_type: string
          wallet_address: string
        }
        Update: {
          claimed_at?: string
          created_at?: string
          id?: string
          reward_type?: string | null
          reward_value?: string | null
          source_id?: string
          source_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
      winner_chest_eligibility: {
        Row: {
          created_at: string
          earned_at: string
          id: string
          is_claimed: boolean
          source_id: string
          source_type: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          id?: string
          is_claimed?: boolean
          source_id: string
          source_type: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          id?: string
          is_claimed?: boolean
          source_id?: string
          source_type?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      match_scores_leaderboard: {
        Row: {
          created_at: string | null
          id: string | null
          mismatches: number | null
          moves: number | null
          player_id: string | null
          score: number | null
          time_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          mismatches?: number | null
          moves?: number | null
          player_id?: never
          score?: number | null
          time_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          mismatches?: number | null
          moves?: number | null
          player_id?: never
          score?: number | null
          time_seconds?: number | null
        }
        Relationships: []
      }
      nft_mints_secure: {
        Row: {
          created_at: string | null
          id: string | null
          metadata: Json | null
          mint_address: string | null
          nft_name: string | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          mint_address?: never
          nft_name?: string | null
          status?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          mint_address?: never
          nft_name?: string | null
          status?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: []
      }
      nft_purchases_secure: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string | null
          nft_id: string | null
          nft_name: string | null
          price: number | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string | null
          nft_id?: string | null
          nft_name?: string | null
          price?: number | null
          status?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string | null
          nft_id?: string | null
          nft_name?: string | null
          price?: number | null
          status?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: []
      }
      node_purchases_secure: {
        Row: {
          created_at: string | null
          id: string | null
          mint_address: string | null
          node_type: string | null
          price_sol: number | null
          quantity: number | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          mint_address?: never
          node_type?: string | null
          price_sol?: number | null
          quantity?: number | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          mint_address?: never
          node_type?: string | null
          price_sol?: number | null
          quantity?: number | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: []
      }
      node_rewards_secure: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string | null
          reward_amount: number | null
          reward_date: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string | null
          reward_amount?: number | null
          reward_date?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string | null
          reward_amount?: number | null
          reward_date?: string | null
          transaction_hash?: never
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      profiles_secure: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: never
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: never
        }
        Relationships: []
      }
      solana_tournament_entries_secure: {
        Row: {
          created_at: string | null
          entry_transaction_hash: string | null
          id: string | null
          joined_at: string | null
          placement: number | null
          reward_amount: number | null
          reward_claimed: boolean | null
          reward_transaction_hash: string | null
          score: number | null
          tournament_id: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          entry_transaction_hash?: never
          id?: string | null
          joined_at?: string | null
          placement?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_transaction_hash?: never
          score?: number | null
          tournament_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          created_at?: string | null
          entry_transaction_hash?: never
          id?: string | null
          joined_at?: string | null
          placement?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_transaction_hash?: never
          score?: number | null
          tournament_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: [
          {
            foreignKeyName: "solana_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "solana_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      token_purchases_secure: {
        Row: {
          amount: number | null
          created_at: string | null
          crypto_transaction_hash: string | null
          id: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_method: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          crypto_transaction_hash?: never
          id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          crypto_transaction_hash?: never
          id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tournament_bracket_public: {
        Row: {
          bracket_position: string | null
          completed_at: string | null
          created_at: string | null
          disputed: boolean | null
          id: string | null
          match_number: number | null
          player_a_score: number | null
          player_a_wallet: string | null
          player_b_score: number | null
          player_b_wallet: string | null
          round_number: number | null
          scheduled_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          tournament_id: string | null
          winner_wallet: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches_secure: {
        Row: {
          bracket_position: string | null
          completed_at: string | null
          created_at: string | null
          dispute_reason: string | null
          disputed: boolean | null
          id: string | null
          match_code: string | null
          match_metadata: Json | null
          match_number: number | null
          player_a_id: string | null
          player_a_score: number | null
          player_a_wallet: string | null
          player_b_id: string | null
          player_b_score: number | null
          player_b_wallet: string | null
          round_number: number | null
          scheduled_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          tournament_id: string | null
          updated_at: string | null
          winner_id: string | null
          winner_wallet: string | null
        }
        Insert: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          disputed?: boolean | null
          id?: string | null
          match_code?: string | null
          match_metadata?: Json | null
          match_number?: number | null
          player_a_id?: string | null
          player_a_score?: number | null
          player_a_wallet?: never
          player_b_id?: string | null
          player_b_score?: number | null
          player_b_wallet?: never
          round_number?: number | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
          winner_wallet?: never
        }
        Update: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          disputed?: boolean | null
          id?: string | null
          match_code?: string | null
          match_metadata?: Json | null
          match_number?: number | null
          player_a_id?: string | null
          player_a_score?: number | null
          player_a_wallet?: never
          player_b_id?: string | null
          player_b_score?: number | null
          player_b_wallet?: never
          round_number?: number | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id?: string | null
          updated_at?: string | null
          winner_id?: string | null
          winner_wallet?: never
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_payouts_secure: {
        Row: {
          amount_usd: number | null
          amount_usdc: number | null
          attestation_hash: string | null
          created_at: string | null
          deadline: string | null
          id: string | null
          nonce: string | null
          paid_at: string | null
          payout_method: string | null
          placement: number | null
          status: string | null
          tournament_id: string | null
          transaction_hash: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          amount_usd?: number | null
          amount_usdc?: number | null
          attestation_hash?: never
          created_at?: string | null
          deadline?: string | null
          id?: string | null
          nonce?: never
          paid_at?: string | null
          payout_method?: string | null
          placement?: number | null
          status?: string | null
          tournament_id?: string | null
          transaction_hash?: never
          user_id?: string | null
          wallet_address?: never
        }
        Update: {
          amount_usd?: number | null
          amount_usdc?: number | null
          attestation_hash?: never
          created_at?: string | null
          deadline?: string | null
          id?: string | null
          nonce?: never
          paid_at?: string | null
          payout_method?: string | null
          placement?: number | null
          status?: string | null
          tournament_id?: string | null
          transaction_hash?: never
          user_id?: string | null
          wallet_address?: never
        }
        Relationships: [
          {
            foreignKeyName: "tournament_payouts_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_standings_public: {
        Row: {
          created_at: string | null
          finalized: boolean | null
          id: string | null
          losses: number | null
          placement: number | null
          points: number | null
          prize_amount_usd: number | null
          tournament_id: string | null
          wallet_address: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_standings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_standings_secure: {
        Row: {
          created_at: string | null
          finalized: boolean | null
          finalized_at: string | null
          id: string | null
          losses: number | null
          placement: number | null
          points: number | null
          prize_amount_usd: number | null
          prize_amount_usdc: number | null
          tournament_id: string | null
          user_id: string | null
          wallet_address: string | null
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          finalized?: boolean | null
          finalized_at?: string | null
          id?: string | null
          losses?: number | null
          placement?: number | null
          points?: number | null
          prize_amount_usd?: number | null
          prize_amount_usdc?: number | null
          tournament_id?: string | null
          user_id?: string | null
          wallet_address?: never
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          finalized?: boolean | null
          finalized_at?: string | null
          id?: string | null
          losses?: number | null
          placement?: number | null
          points?: number | null
          prize_amount_usd?: number | null
          prize_amount_usdc?: number | null
          tournament_id?: string | null
          user_id?: string | null
          wallet_address?: never
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_standings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arcade_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_daily_leaderboard: {
        Row: {
          best_streak: number | null
          correct_count: number | null
          player_id: string | null
          rank: number | null
          score: number | null
          started_at: string | null
        }
        Relationships: []
      }
      trivia_leaderboard: {
        Row: {
          best_streak: number | null
          combo_multiplier: number | null
          correct_count: number | null
          ended_at: string | null
          id: string | null
          mode: Database["public"]["Enums"]["trivia_mode"] | null
          player_id: string | null
          score: number | null
          speed_bonus: number | null
          started_at: string | null
          total_questions: number | null
        }
        Insert: {
          best_streak?: number | null
          combo_multiplier?: number | null
          correct_count?: number | null
          ended_at?: string | null
          id?: string | null
          mode?: Database["public"]["Enums"]["trivia_mode"] | null
          player_id?: never
          score?: number | null
          speed_bonus?: number | null
          started_at?: string | null
          total_questions?: number | null
        }
        Update: {
          best_streak?: number | null
          combo_multiplier?: number | null
          correct_count?: number | null
          ended_at?: string | null
          id?: string | null
          mode?: Database["public"]["Enums"]["trivia_mode"] | null
          player_id?: never
          score?: number | null
          speed_bonus?: number | null
          started_at?: string | null
          total_questions?: number | null
        }
        Relationships: []
      }
      user_prizes_secure: {
        Row: {
          created_at: string | null
          id: string | null
          prize_id: string | null
          redeemed_at: string | null
          redemption_status: string | null
          redemption_transaction_hash: string | null
          shipping_address: string | null
          source_id: string | null
          source_type: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
          won_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          prize_id?: string | null
          redeemed_at?: string | null
          redemption_status?: string | null
          redemption_transaction_hash?: never
          shipping_address?: never
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
          won_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          prize_id?: string | null
          redeemed_at?: string | null
          redemption_status?: string | null
          redemption_transaction_hash?: never
          shipping_address?: never
          source_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: never
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_prizes_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_airdrop: {
        Args: { amount: number; target_user_id: string }
        Returns: Json
      }
      award_trivia_rewards: {
        Args: {
          category_param: string
          correct_answers_param: number
          total_questions_param: number
        }
        Returns: Json
      }
      check_dj_milestones: { Args: { p_user_id: string }; Returns: Json }
      check_rate_limit: {
        Args: {
          function_name_param: string
          max_calls: number
          time_window_seconds: number
        }
        Returns: boolean
      }
      claim_radio_milestone: {
        Args: {
          p_milestone_type: string
          p_milestone_value: number
          p_reward_description: string
          p_reward_type: string
          p_wallet_address: string
        }
        Returns: Json
      }
      claim_user_rewards: { Args: never; Returns: Json }
      claim_weekly_trivia_bonus: { Args: never; Returns: Json }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      complete_solana_tournament: {
        Args: {
          admin_wallet_param?: string
          tournament_id_param: string
          winner_wallet_param: string
        }
        Returns: Json
      }
      deduct_game_entry_fee: {
        Args: {
          p_amount: number
          p_game_type: string
          p_wallet_address: string
        }
        Returns: Json
      }
      deduct_trivia_entry_fee: {
        Args: { category_param: string }
        Returns: Json
      }
      distribute_weekly_rewards: {
        Args: {
          p_ccc_amount: number
          p_placement: number
          p_total_score: number
          p_wallet: string
          p_week_end: string
          p_week_start: string
        }
        Returns: boolean
      }
      draw_raffle_winner: { Args: { raffle_id_param: string }; Returns: string }
      get_combined_weekly_leaderboard: {
        Args: { p_week_end?: string; p_week_start?: string }
        Returns: {
          match_best_score: number
          rank: number
          sequence_best_score: number
          total_score: number
          trivia_best_score: number
          wallet_address: string
        }[]
      }
      get_current_wallet_address: { Args: never; Returns: string }
      get_own_wallet_address: {
        Args: { record_id: string; table_name: string }
        Returns: string
      }
      get_tournament_leaderboard: {
        Args: { tournament_id_param?: string }
        Returns: {
          joined_at: string
          placement: number
          player_identifier: string
          reward_amount: number
          score: number
          tournament_id: string
          tournament_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_wallet_balance: {
        Args: { p_wallet_address: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      join_solana_tournament: {
        Args: {
          tournament_id_param: string
          transaction_hash_param: string
          user_id_param?: string
          wallet_address_param: string
        }
        Returns: Json
      }
      mask_shipping_address: { Args: { addr: string }; Returns: string }
      mask_stripe_session: { Args: { session_id: string }; Returns: string }
      mask_transaction_hash: { Args: { tx_hash: string }; Returns: string }
      mask_wallet_address: { Args: { wallet_addr: string }; Returns: string }
      play_cyberdrop:
        | { Args: { p_wallet_address: string }; Returns: Json }
        | {
            Args: { p_is_paid?: boolean; p_wallet_address: string }
            Returns: Json
          }
      purchase_nft_with_cctr: {
        Args: {
          nft_id_param: string
          nft_name_param: string
          price_param: number
        }
        Returns: Json
      }
      purchase_song: {
        Args: { song_id_param: string; user_id_param: string }
        Returns: Json
      }
      record_radio_listen: {
        Args: { p_seconds: number; p_wallet_address: string }
        Returns: Json
      }
      submit_tournament_score: {
        Args: {
          game_type_param: string
          score_param: number
          tournament_id_param: string
        }
        Returns: Json
      }
      update_achievement_progress: {
        Args: {
          achievement_type: string
          increment_amount?: number
          user_id_param: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cosmetic_rarity: "common" | "rare" | "epic" | "legendary"
      cosmetic_type:
        | "avatar_frame"
        | "banner"
        | "card_skin"
        | "button_skin"
        | "victory_fx"
      match_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "disputed"
        | "cancelled"
      payout_schema:
        | "winner_takes_all"
        | "top_3"
        | "top_5"
        | "top_10"
        | "custom"
      tournament_format:
        | "single_elimination"
        | "double_elimination"
        | "round_robin"
        | "swiss"
      tournament_status:
        | "draft"
        | "published"
        | "registration_open"
        | "registration_closed"
        | "in_progress"
        | "completed"
        | "cancelled"
      trivia_mode: "free_play" | "daily_run"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      cosmetic_rarity: ["common", "rare", "epic", "legendary"],
      cosmetic_type: [
        "avatar_frame",
        "banner",
        "card_skin",
        "button_skin",
        "victory_fx",
      ],
      match_status: [
        "pending",
        "in_progress",
        "completed",
        "disputed",
        "cancelled",
      ],
      payout_schema: ["winner_takes_all", "top_3", "top_5", "top_10", "custom"],
      tournament_format: [
        "single_elimination",
        "double_elimination",
        "round_robin",
        "swiss",
      ],
      tournament_status: [
        "draft",
        "published",
        "registration_open",
        "registration_closed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      trivia_mode: ["free_play", "daily_run"],
    },
  },
} as const
