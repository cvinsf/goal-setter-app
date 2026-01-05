/**
 * Database type definitions for Supabase
 * These types are generated based on our database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          subscription_tier: 'free' | 'paid';
        };
        Insert: {
          id?: string;
          email?: string | null;
          created_at?: string;
          subscription_tier?: 'free' | 'paid';
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          subscription_tier?: 'free' | 'paid';
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          parent_goal_id: string | null;
          title: string;
          description: string | null;
          goal_type: 'yearly' | 'monthly' | 'weekly' | 'daily';
          tracking_type: 'checkbox' | 'numeric' | 'hybrid';
          is_completed: boolean;
          current_value: number | null;
          target_value: number | null;
          unit: string | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
          difficulty_level: number | null;
          estimated_time_hours: number | null;
          resources_needed: string[] | null;
          feasibility_notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_goal_id?: string | null;
          title: string;
          description?: string | null;
          goal_type: 'yearly' | 'monthly' | 'weekly' | 'daily';
          tracking_type?: 'checkbox' | 'numeric' | 'hybrid';
          is_completed?: boolean;
          current_value?: number | null;
          target_value?: number | null;
          unit?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          difficulty_level?: number | null;
          estimated_time_hours?: number | null;
          resources_needed?: string[] | null;
          feasibility_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          parent_goal_id?: string | null;
          title?: string;
          description?: string | null;
          goal_type?: 'yearly' | 'monthly' | 'weekly' | 'daily';
          tracking_type?: 'checkbox' | 'numeric' | 'hybrid';
          is_completed?: boolean;
          current_value?: number | null;
          target_value?: number | null;
          unit?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          difficulty_level?: number | null;
          estimated_time_hours?: number | null;
          resources_needed?: string[] | null;
          feasibility_notes?: string | null;
        };
      };
      progress_logs: {
        Row: {
          id: string;
          goal_id: string;
          logged_at: string;
          value: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          goal_id: string;
          logged_at?: string;
          value: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          goal_id?: string;
          logged_at?: string;
          value?: number;
          notes?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      user_api_keys: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          encrypted_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          encrypted_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          encrypted_key?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
