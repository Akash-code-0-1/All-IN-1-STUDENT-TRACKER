import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  deadline?: string
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Revision {
  id: string
  user_id: string
  original_task_id: string
  original_title: string
  revision_number: number
  scheduled_date: string
  completed: boolean
  completed_at?: string
  created_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  task_id?: string
  task_title: string
  duration: number
  start_time: string
  end_time?: string
  completed: boolean
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  streak: number
  best_streak: number
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completion_date: string
  created_at: string
}

export interface QuickNote {
  id: string
  user_id: string
  content: string
  type: "idea" | "task" | "reminder"
  processed: boolean
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: "light" | "dark"
  notifications_enabled: boolean
  focus_sound: string
  created_at: string
  updated_at: string
}
