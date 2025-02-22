import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://azsydeuklnbqvsvhdcxr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3lkZXVrbG5icXZzdmhkY3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MjAwODMsImV4cCI6MjA1MTE5NjA4M30.CjtnykmV1VAgPzcTWBAivAd41CRANVRAh9sp-sjyq1s";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
}); 