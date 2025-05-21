export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      icons: {
        Row: {
          id: string
          prompt: string
          static_url: string
          animated_url: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          prompt: string
          static_url: string
          animated_url?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          prompt?: string
          static_url?: string
          animated_url?: string | null
          created_at?: string
          user_id?: string
        }
      }
      purchases: {
        Row: {
          id: string
          amount: number
          credits: number
          status: string
          provider: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          amount: number
          credits: number
          status?: string
          provider?: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          amount?: number
          credits?: number
          status?: string
          provider?: string
          created_at?: string
          user_id?: string
        }
      }
      icon_cache: {
        Row: {
          id: string
          prompt_hash: string
          prompt: string
          static_url: string
          animated_url: string | null
          created_at: string
          last_accessed_at: string
          access_count: number
        }
        Insert: {
          id?: string
          prompt_hash: string
          prompt: string
          static_url: string
          animated_url?: string | null
          created_at?: string
          last_accessed_at?: string
          access_count?: number
        }
        Update: {
          id?: string
          prompt_hash?: string
          prompt?: string
          static_url?: string
          animated_url?: string | null
          created_at?: string
          last_accessed_at?: string
          access_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
