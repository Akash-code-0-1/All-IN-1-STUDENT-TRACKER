import { supabase } from "./supabase"
import type { Todo, Revision, FocusSession, Habit, HabitCompletion, QuickNote, UserPreferences } from "./supabase"

export const database = {
  // Todos
  async getTodos(userId: string): Promise<Todo[]> {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTodo(todo: Omit<Todo, "id" | "created_at" | "updated_at">): Promise<Todo> {
    const { data, error } = await supabase.from("todos").insert(todo).select().single()

    if (error) throw error
    return data
  },

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const { data, error } = await supabase
      .from("todos")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase.from("todos").delete().eq("id", id)

    if (error) throw error
  },

  // Revisions
  async getRevisions(userId: string): Promise<Revision[]> {
    const { data, error } = await supabase
      .from("revisions")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: true })

    if (error) throw error
    return data || []
  },

  async createRevisions(revisions: Omit<Revision, "id" | "created_at">[]): Promise<void> {
    const { error } = await supabase.from("revisions").insert(revisions)

    if (error) throw error
  },

  async updateRevision(id: string, updates: Partial<Revision>): Promise<void> {
    const { error } = await supabase.from("revisions").update(updates).eq("id", id)

    if (error) throw error
  },

  // Focus Sessions
  async getFocusSessions(userId: string): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createFocusSession(session: Omit<FocusSession, "id" | "created_at">): Promise<FocusSession> {
    const { data, error } = await supabase.from("focus_sessions").insert(session).select().single()

    if (error) throw error
    return data
  },

  async updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<void> {
    const { error } = await supabase.from("focus_sessions").update(updates).eq("id", id)

    if (error) throw error
  },

  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createHabit(habit: Omit<Habit, "id" | "created_at" | "updated_at">): Promise<Habit> {
    const { data, error } = await supabase.from("habits").insert(habit).select().single()

    if (error) throw error
    return data
  },

  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    const { error } = await supabase
      .from("habits")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from("habits").delete().eq("id", id)

    if (error) throw error
  },

  // Habit Completions
  async getHabitCompletions(userId: string, habitId?: string): Promise<HabitCompletion[]> {
    let query = supabase.from("habit_completions").select("*").eq("user_id", userId)

    if (habitId) {
      query = query.eq("habit_id", habitId)
    }

    const { data, error } = await query.order("completion_date", { ascending: false })

    if (error) throw error
    return data || []
  },

  async toggleHabitCompletion(userId: string, habitId: string, date: string): Promise<void> {
    // Check if completion exists
    const { data: existing } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("completion_date", date)
      .single()

    if (existing) {
      // Remove completion
      const { error } = await supabase.from("habit_completions").delete().eq("id", existing.id)

      if (error) throw error
    } else {
      // Add completion
      const { error } = await supabase.from("habit_completions").insert({
        user_id: userId,
        habit_id: habitId,
        completion_date: date,
      })

      if (error) throw error
    }
  },

  // Quick Notes
  async getQuickNotes(userId: string): Promise<QuickNote[]> {
    const { data, error } = await supabase
      .from("quick_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createQuickNote(note: Omit<QuickNote, "id" | "created_at">): Promise<QuickNote> {
    const { data, error } = await supabase.from("quick_notes").insert(note).select().single()

    if (error) throw error
    return data
  },

  async updateQuickNote(id: string, updates: Partial<QuickNote>): Promise<void> {
    const { error } = await supabase.from("quick_notes").update(updates).eq("id", id)

    if (error) throw error
  },

  async deleteQuickNote(id: string): Promise<void> {
    const { error } = await supabase.from("quick_notes").delete().eq("id", id)

    if (error) throw error
  },

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  },
}
