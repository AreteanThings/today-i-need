
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          subtitle: string | null;
          start_date: string;
          end_date: string | null;
          repeat_value: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
          is_shared: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          subtitle?: string | null;
          start_date: string;
          end_date?: string | null;
          repeat_value: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
          is_shared?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          subtitle?: string | null;
          start_date?: string;
          end_date?: string | null;
          repeat_value?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
          is_shared?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_completions: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          completed_date: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          completed_date?: string;
          completed_at?: string;
        };
      };
    };
  };
};
