"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertCircle, Lightbulb, Target, Zap } from "lucide-react"

interface Todo {
  id: string
  title: string
  category: string
  priority: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

interface Insight {
  id: string
  type: "productivity" | "pattern" | "suggestion" | "warning"
  title: string
  description: string
  action?: string
  priority: "high" | "medium" | "low"
  icon: any
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    loadTodos()

    const handleTodosUpdate = () => {
      loadTodos()
    }

    window.addEventListener("todosUpdated", handleTodosUpdate)
    return () => window.removeEventListener("todosUpdated", handleTodosUpdate)
  }, [])

  const loadTodos = () => {
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      setTodos(parsedTodos)
      generateInsights(parsedTodos)
    }
  }

  const generateInsights = (todos: Todo[]) => {
    const newInsights: Insight[] = []
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Productivity patterns
    const completedToday = todos.filter((t) => t.completed && t.completedAt?.startsWith(today)).length
    const completedYesterday = todos.filter((t) => t.completed && t.completedAt?.startsWith(yesterday)).length
    const completedLastWeek = todos.filter((t) => t.completed && t.completedAt && t.completedAt >= lastWeek).length

    if (completedToday > completedYesterday && completedToday > 0) {
      newInsights.push({
        id: "productivity-up",
        type: "productivity",
        title: "Productivity Boost!",
        description: `You completed ${completedToday} tasks today vs ${completedYesterday} yesterday. Keep the momentum!`,
        priority: "high",
        icon: TrendingUp,
      })
    }

    // Category analysis
    const categoryStats = todos.reduce(
      (acc, todo) => {
        if (!acc[todo.category]) acc[todo.category] = { total: 0, completed: 0 }
        acc[todo.category].total++
        if (todo.completed) acc[todo.category].completed++
        return acc
      },
      {} as Record<string, { total: number; completed: number }>,
    )

    const bestCategory = Object.entries(categoryStats)
      .map(([cat, stats]) => ({ category: cat, rate: stats.completed / stats.total }))
      .sort((a, b) => b.rate - a.rate)[0]

    if (bestCategory && bestCategory.rate > 0.8) {
      newInsights.push({
        id: "category-strength",
        type: "pattern",
        title: "Category Mastery",
        description: `You excel at ${bestCategory.category} tasks with ${Math.round(bestCategory.rate * 100)}% completion rate!`,
        action: "Focus more energy here",
        priority: "medium",
        icon: Target,
      })
    }

    // Overdue tasks warning
    const overdueTasks = todos.filter((t) => !t.completed && t.deadline && new Date(t.deadline) < now).length

    if (overdueTasks > 0) {
      newInsights.push({
        id: "overdue-warning",
        type: "warning",
        title: "Overdue Tasks Alert",
        description: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}. Consider rescheduling or breaking them down.`,
        action: "Review overdue tasks",
        priority: "high",
        icon: AlertCircle,
      })
    }

    // Time-based suggestions
    const currentHour = now.getHours()
    if (currentHour >= 9 && currentHour <= 11 && completedToday === 0) {
      newInsights.push({
        id: "morning-boost",
        type: "suggestion",
        title: "Morning Productivity Window",
        description: "It's peak morning hours! This is typically the best time for focused work.",
        action: "Start with your most important task",
        priority: "medium",
        icon: Lightbulb,
      })
    }

    // Streak insights
    const streak = calculateStreak(todos)
    if (streak >= 7) {
      newInsights.push({
        id: "streak-celebration",
        type: "productivity",
        title: "Incredible Streak!",
        description: `${streak} days of consistent productivity! You're building excellent habits.`,
        priority: "high",
        icon: Zap,
      })
    }

    // Work-life balance check
    const workTasks = todos.filter((t) =>
      ["Development", "Meeting", "Bug Fix", "Feature", "Review"].includes(t.category),
    )
    const personalTasks = todos.filter((t) => t.category === "Personal")
    const workRatio = workTasks.length / (workTasks.length + personalTasks.length)

    if (workRatio > 0.9 && todos.length > 5) {
      newInsights.push({
        id: "work-life-balance",
        type: "suggestion",
        title: "Work-Life Balance Check",
        description: "Most of your tasks are work-related. Consider adding some personal goals for better balance.",
        action: "Add personal tasks",
        priority: "low",
        icon: Brain,
      })
    }

    setInsights(newInsights)
  }

  const calculateStreak = (todos: Todo[]) => {
    const completedDates = todos
      .filter((todo) => todo.completed && todo.completedAt)
      .map((todo) => todo.completedAt!.split("T")[0])
      .sort()
      .reverse()

    if (completedDates.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    const today = currentDate.toISOString().split("T")[0]

    if (completedDates.includes(today)) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (completedDates.includes(yesterday.toISOString().split("T")[0])) {
        streak = 1
        currentDate = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000)
      } else {
        return 0
      }
    }

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (completedDates.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
      case "medium":
        return "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
      case "low":
        return "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800"
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "productivity":
        return TrendingUp
      case "pattern":
        return Target
      case "suggestion":
        return Lightbulb
      case "warning":
        return AlertCircle
      default:
        return Brain
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <span className="text-lg font-semibold">AI Insights</span>
            <p className="text-sm text-muted-foreground font-normal">Smart productivity analysis</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight) => {
              const IconComponent = insight.icon
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No insights yet</p>
              <p className="text-sm">Complete some tasks to get AI-powered insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
