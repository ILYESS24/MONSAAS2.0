/**
 * Supabase Database Types
 * 
 * This file contains the type definitions for the Supabase database schema.
 * These types provide type safety when interacting with the database.
 * 
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'draft' | 'in_progress' | 'review' | 'completed'
          progress: number
          user_id: string
          team_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'review' | 'completed'
          progress?: number
          user_id: string
          team_size?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'review' | 'completed'
          progress?: number
          user_id?: string
          team_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          user_name: string
          action: string
          target: string
          target_type: 'project' | 'task' | 'file' | 'comment'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          action: string
          target: string
          target_type: 'project' | 'task' | 'file' | 'comment'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          action?: string
          target?: string
          target_type?: 'project' | 'task' | 'file' | 'comment'
          metadata?: Json | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          project_id: string
          assignee_id: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          project_id: string
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          project_id?: string
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'owner'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'owner'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'owner'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          action_url?: string | null
          created_at?: string
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
      project_status: 'draft' | 'in_progress' | 'review' | 'completed'
      task_status: 'todo' | 'in_progress' | 'done'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      user_role: 'user' | 'admin' | 'owner'
      notification_type: 'info' | 'success' | 'warning' | 'error'
      activity_target_type: 'project' | 'task' | 'file' | 'comment'
    }
  }
}

// Utility types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types for convenience
export type Project = Tables<'projects'>
export type ProjectInsert = InsertTables<'projects'>
export type ProjectUpdate = UpdateTables<'projects'>

export type Activity = Tables<'activities'>
export type ActivityInsert = InsertTables<'activities'>

export type Task = Tables<'tasks'>
export type TaskInsert = InsertTables<'tasks'>
export type TaskUpdate = UpdateTables<'tasks'>

export type User = Tables<'users'>
export type UserInsert = InsertTables<'users'>
export type UserUpdate = UpdateTables<'users'>

export type Notification = Tables<'notifications'>
export type NotificationInsert = InsertTables<'notifications'>
export type NotificationUpdate = UpdateTables<'notifications'>
