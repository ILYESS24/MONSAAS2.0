/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  // Ajout pour compatibilité avec le code existant qui attend status/due_date
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string; 
  description?: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time?: string;
  color?: string;
  created_at: string;
  // Ajout pour compatibilité
  description?: string;
}

export interface Generation {
  id: string;
  user_id: string;
  type: 'image' | 'video' | 'text';
  prompt: string;
  result_url?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'archived' | 'in_progress' | 'pending';
  progress: number;
  members: string[];
  image?: string;
  description?: string;
  type?: 'video' | 'image' | 'code' | 'website' | 'agent' | 'app';
  created_at?: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'offline' | 'vacation';
  avatar: string;
  salary: number;
  join_date: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer';
  score: number;
  avatar: string;
  applied_date: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'monitor' | 'other';
  assigned_to?: string; // Employee ID
  status: 'active' | 'maintenance' | 'available';
  purchase_date: string;
  serial: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
}

export interface CommunityPost {
  id: string;
  author: { name: string; avatar: string };
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  date: string;
}

// Stats interface for dashboard
export interface StatsState {
  revenue: string;
  users: string;
  bounceRate: string;
  // Ajout pour compatibilité DashboardChat
  interviews?: number;
  hired?: number;
  onboardingProgress?: number;
  output?: number;
  employees?: number;
  hirings?: number;
  projects?: number;
  weeklyHours?: number;
}

export interface TimeEntry {
  id: string;
  task_id?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
}
