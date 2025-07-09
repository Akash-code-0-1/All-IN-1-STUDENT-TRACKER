"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { database } from "@/lib/database"
import { auth } from "@/lib/auth"
import { Upload, Download, AlertTriangle } from "lucide-react"

export function DataMigration() {
  const [migrating, setMigrating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")

  const migrateLocalStorageToDatabase = async () => {
    setMigrating(true)
    setProgress(0)
    setError("")

    try {
      const user = await auth.getCurrentUser()
      if (!user) throw new Error("User not authenticated")

      // Step 1: Migrate Todos (20%)
      setStatus("Migrating todos...")
      const localTodos = localStorage.getItem("productive-me-todos")
      if (localTodos) {
        const todos = JSON.parse(localTodos)
        for (const todo of todos) {
          await database.createTodo({
            user_id: user.id,
            title: todo.title,
            description: todo.description,
            category: todo.category,
            priority: todo.priority,
            deadline: todo.deadline,
            completed: todo.completed,
            completed_at: todo.completedAt,
          })
        }
      }
      setProgress(20)

      // Step 2: Migrate Revisions (40%)
      setStatus("Migrating revisions...")
      const localRevisions = localStorage.getItem("productive-me-revisions")
      if (localRevisions) {
        const revisions = JSON.parse(localRevisions)
        const revisionData = revisions.map((rev: any) => ({
          user_id: user.id,
          original_task_id: rev.originalTaskId,
          original_title: rev.originalTitle,
          revision_number: rev.revisionNumber,
          scheduled_date: rev.scheduledDate,
          completed: rev.completed,
        }))
        if (revisionData.length > 0) {
          await database.createRevisions(revisionData)
        }
      }
      setProgress(40)

      // Step 3: Migrate Focus Sessions (60%)
      setStatus("Migrating focus sessions...")
      const localSessions = localStorage.getItem("productive-me-focus-sessions")
      if (localSessions) {
        const sessions = JSON.parse(localSessions)
        for (const session of sessions) {
          await database.createFocusSession({
            user_id: user.id,
            task_id: session.taskId,
            task_title: session.taskTitle,
            duration: session.duration,
            start_time: session.startTime,
            end_time: session.endTime,
            completed: session.completed,
          })
        }
      }
      setProgress(60)

      // Step 4: Migrate Habits (80%)
      setStatus("Migrating habits...")
      const localHabits = localStorage.getItem("productive-me-habits")
      if (localHabits) {
        const habits = JSON.parse(localHabits)
        for (const habit of habits) {
          const newHabit = await database.createHabit({
            user_id: user.id,
            name: habit.name,
            description: habit.description,
            color: habit.color,
            streak: habit.streak,
            best_streak: habit.bestStreak,
          })

          // Migrate habit completions
          for (const completionDate of habit.completions || []) {
            await database.toggleHabitCompletion(user.id, newHabit.id, completionDate)
          }
        }
      }
      setProgress(80)

      // Step 5: Migrate Quick Notes (90%)
      setStatus("Migrating quick notes...")
      const localNotes = localStorage.getItem("productive-me-quick-notes")
      if (localNotes) {
        const notes = JSON.parse(localNotes)
        for (const note of notes) {
          await database.createQuickNote({
            user_id: user.id,
            content: note.content,
            type: note.type,
            processed: note.processed,
          })
        }
      }
      setProgress(90)

      // Step 6: Migrate Preferences (100%)
      setStatus("Migrating preferences...")
      const localTheme = localStorage.getItem("productive-me-theme")
      await database.updateUserPreferences(user.id, {
        theme: (localTheme as "light" | "dark") || "dark",
        notifications_enabled: true,
        focus_sound: "none",
      })
      setProgress(100)

      setStatus("Migration completed successfully!")

      // Clear localStorage after successful migration
      const keysToRemove = [
        "productive-me-todos",
        "productive-me-revisions",
        "productive-me-focus-sessions",
        "productive-me-habits",
        "productive-me-quick-notes",
        "productive-me-theme",
      ]
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed")
    } finally {
      setMigrating(false)
    }
  }

  const exportLocalData = () => {
    const data = {
      todos: JSON.parse(localStorage.getItem("productive-me-todos") || "[]"),
      revisions: JSON.parse(localStorage.getItem("productive-me-revisions") || "[]"),
      focusSessions: JSON.parse(localStorage.getItem("productive-me-focus-sessions") || "[]"),
      habits: JSON.parse(localStorage.getItem("productive-me-habits") || "[]"),
      quickNotes: JSON.parse(localStorage.getItem("productive-me-quick-notes") || "[]"),
      theme: localStorage.getItem("productive-me-theme") || "dark",
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productive-me-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasLocalData = () => {
    const keys = [
      "productive-me-todos",
      "productive-me-revisions",
      "productive-me-focus-sessions",
      "productive-me-habits",
      "productive-me-quick-notes",
    ]
    return keys.some((key) => localStorage.getItem(key))
  }

  if (!hasLocalData()) {
    return null
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          Local Data Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          We found existing data in your browser's local storage. You can migrate it to the cloud database or export it
          as a backup.
        </p>

        {migrating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={migrateLocalStorageToDatabase}
            disabled={migrating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {migrating ? "Migrating..." : "Migrate to Cloud"}
          </Button>
          <Button
            onClick={exportLocalData}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Backup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
