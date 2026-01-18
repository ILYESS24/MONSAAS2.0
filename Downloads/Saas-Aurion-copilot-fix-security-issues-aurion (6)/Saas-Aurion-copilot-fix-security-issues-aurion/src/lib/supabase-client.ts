import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otxxjczxwhtngcferckz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les tables
export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description?: string
  type: 'code' | 'image' | 'video' | 'text' | 'app'
  status: 'draft' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'spent'
  description: string
  created_at: string
}