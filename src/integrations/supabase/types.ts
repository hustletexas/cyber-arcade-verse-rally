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
          email: string
          id: string
          updated_at: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
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
        }
        Insert: {
          cctr_balance?: number | null
          claimable_rewards?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cctr_balance?: number | null
          claimable_rewards?: number | null
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
    }
    Views: {
      [_ in never]: never
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
      claim_user_rewards: { Args: never; Returns: Json }
      complete_solana_tournament: {
        Args: {
          admin_wallet_param?: string
          tournament_id_param: string
          winner_wallet_param: string
        }
        Returns: Json
      }
      deduct_trivia_entry_fee: {
        Args: { category_param: string }
        Returns: Json
      }
      draw_raffle_winner: { Args: { raffle_id_param: string }; Returns: string }
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
    },
  },
} as const
