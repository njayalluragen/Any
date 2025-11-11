import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  monthly_submission_limit: number;
  created_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  submitted_at: string;
  is_read: boolean;
  notes?: string;
};

export type MonthlyUsage = {
  id: string;
  user_id: string;
  month: string;
  submission_count: number;
  created_at: string;
  updated_at: string;
};
