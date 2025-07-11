"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertCircle, Target, Zap, Calendar, Trophy, Flame, BarChart3, Timer } from "lucide-react"

interface Todo {
  id: string
  title: string
  category: string
  priority: string
  completed: boolean
  completedAt?: string
  createdAt: string
  deadline?: string
}

interface Insight {
  id: string
  type: "productivity" | "pattern" | "suggestion" | "warning" | "achievement" | "optimization"
  title: string
  description: string
  action?: string
  priority: "high" | "medium" | "low"
  icon: any
  value?: number
  trend?: "up" | "down" | "stable"
}

interface ProductivityMetrics {
  completionRate: number
  averageTasksPerDay: number
  bestWorkingHour: number
  mostProductiveCategory: string
  currentStreak: number
  weeklyVelocity: number
  priorityDistribution: { high: number; medium: number; low: number }
  overdueCount: number
  upcomingDeadlines: number
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null)

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
      const calculatedMetrics = calculateMetrics(parsedTodos)
      setMetrics(calculatedMetrics)
      generateAdvancedInsights(parsedTodos, calculatedMetrics)
    }
  }

  const calculateMetrics = (todos: Todo[]): ProductivityMetrics => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Completion rate
    const completedTasks = todos.filter((t) => t.completed).length
    const completionRate = todos.length > 0 ? (completedTasks / todos.length) * 100 : 0

    // Average tasks per day (last 7 days)
    const recentTasks = todos.filter((t) => t.createdAt >= weekAgo)
    const averageTasksPerDay = recentTasks.length / 7

    // Best working hour analysis
    const completionHours = todos
      .filter((t) => t.completed && t.completedAt)
      .map((t) => new Date(t.completedAt!).getHours())

    const hourCounts = completionHours.reduce(
      (acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const bestWorkingHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 9

    // Most productive category
    const categoryStats = todos.reduce(
      (acc, todo) => {
        if (!acc[todo.category]) acc[todo.category] = { total: 0, completed: 0 }
        acc[todo.category].total++
        if (todo.completed) acc[todo.category].completed++
        return acc
      },
      {} as Record<string, { total: number; completed: number }>,
    )

    const mostProductiveCategory =
      Object.entries(categoryStats)
        .map(([cat, stats]) => ({ category: cat, rate: stats.total > 0 ? stats.completed / stats.total : 0 }))
        .sort((a, b) => b.rate - a.rate)[0]?.category || "Development"

    // Current streak
    const currentStreak = calculateStreak(todos)

    // Weekly velocity (tasks completed in last 7 days)
    const weeklyCompleted = todos.filter((t) => t.completed && t.completedAt && t.completedAt >= weekAgo).length

    // Priority distribution
    const priorityDistribution = todos.reduce(
      (acc, todo) => {
        acc[todo.priority as keyof typeof acc]++
        return acc
      },
      { high: 0, medium: 0, low: 0 },
    )

    // Overdue tasks
    const overdueCount = todos.filter((t) => !t.completed && t.deadline && new Date(t.deadline) < now).length

    // Upcoming deadlines (next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const upcomingDeadlines = todos.filter(
      (t) => !t.completed && t.deadline && t.deadline >= today && t.deadline <= threeDaysFromNow,
    ).length

    return {
      completionRate,
      averageTasksPerDay,
      bestWorkingHour: Number.parseInt(bestWorkingHour as string),
      mostProductiveCategory,
      currentStreak,
      weeklyVelocity: weeklyCompleted,
      priorityDistribution,
      overdueCount,
      upcomingDeadlines,
    }
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

    // Check if completed today
    if (completedDates.includes(today)) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Check if completed yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (completedDates.includes(yesterday.toISOString().split("T")[0])) {
        streak = 1
        currentDate = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000)
      } else {
        return 0
      }
    }

    // Count consecutive days
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

  const generateAdvancedInsights = (todos: Todo[], metrics: ProductivityMetrics) => {
    const newInsights: Insight[] = []
    const now = new Date()
    const currentHour = now.getHours()

    // 1. Productivity Performance Insights
    if (metrics.completionRate >= 80) {
      newInsights.push({
        id: "high-performance",
        type: "achievement",
        title: "Exceptional Performance! 🎯",
        description: `${metrics.completionRate.toFixed(1)}% completion rate - you're in the top tier of productivity!`,
        priority: "high",
        icon: Trophy,
        value: metrics.completionRate,
        trend: "up",
      })
    } else if (metrics.completionRate < 50) {
      newInsights.push({
        id: "performance-concern",
        type: "warning",
        title: "Completion Rate Needs Attention",
        description: `${metrics.completionRate.toFixed(1)}% completion rate. Consider breaking tasks into smaller chunks.`,
        action: "Review and simplify current tasks",
        priority: "high",
        icon: AlertCircle,
        value: metrics.completionRate,
        trend: "down",
      })
    }

    // 2. Optimal Timing Insights
    const isOptimalTime = Math.abs(currentHour - metrics.bestWorkingHour) <= 1
    if (isOptimalTime && metrics.bestWorkingHour !== 9) {
      newInsights.push({
        id: "optimal-time",
        type: "optimization",
        title: "Peak Performance Window! ⚡",
        description: `You're most productive around ${metrics.bestWorkingHour}:00. Perfect time for important tasks!`,
        action: "Tackle high-priority tasks now",
        priority: "high",
        icon: Zap,
        value: metrics.bestWorkingHour,
      })
    }

    // 3. Streak and Momentum Insights
    if (metrics.currentStreak >= 7) {
      newInsights.push({
        id: "streak-fire",
        type: "achievement",
        title: "Incredible Streak! 🔥",
        description: `${metrics.currentStreak} days of consistent productivity! You're building unstoppable momentum.`,
        priority: "high",
        icon: Flame,
        value: metrics.currentStreak,
        trend: "up",
      })
    } else if (metrics.currentStreak === 0) {
      newInsights.push({
        id: "streak-restart",
        type: "suggestion",
        title: "Restart Your Momentum",
        description: "Complete at least one task today to start building your productivity streak again.",
        action: "Complete one small task now",
        priority: "medium",
        icon: Target,
      })
    }

    // 4. Velocity and Workload Insights
    if (metrics.weeklyVelocity > metrics.averageTasksPerDay * 7 * 1.5) {
      newInsights.push({
        id: "high-velocity",
        type: "achievement",
        title: "Exceptional Velocity! 🚀",
        description: `${metrics.weeklyVelocity} tasks completed this week - 50% above your average!`,
        priority: "medium",
        icon: TrendingUp,
        value: metrics.weeklyVelocity,
        trend: "up",
      })
    } else if (metrics.weeklyVelocity < metrics.averageTasksPerDay * 7 * 0.5) {
      newInsights.push({
        id: "low-velocity",
        type: "suggestion",
        title: "Velocity Below Average",
        description: `Only ${metrics.weeklyVelocity} tasks completed this week. Consider reviewing your workload.`,
        action: "Focus on smaller, achievable tasks",
        priority: "medium",
        icon: BarChart3,
        value: metrics.weeklyVelocity,
        trend: "down",
      })
    }

    // 5. Category Mastery Insights
    if (metrics.mostProductiveCategory) {
      const categoryStats = todos.reduce(
        (acc, todo) => {
          if (!acc[todo.category]) acc[todo.category] = { total: 0, completed: 0 }
          acc[todo.category].total++
          if (todo.completed) acc[todo.category].completed++
          return acc
        },
        {} as Record<string, { total: number; completed: number }>,
      )

      const categoryRate =
        (categoryStats[metrics.mostProductiveCategory]?.completed /
          categoryStats[metrics.mostProductiveCategory]?.total) *
          100 || 0

      if (categoryRate > 85) {
        newInsights.push({
          id: "category-mastery",
          type: "pattern",
          title: "Category Mastery Detected! 🎯",
          description: `${categoryRate.toFixed(1)}% success rate in ${metrics.mostProductiveCategory}. This is your strength zone!`,
          action: "Schedule more tasks in this category",
          priority: "medium",
          icon: Target,
          value: categoryRate,
        })
      }
    }

    // 6. Deadline Management Insights
    if (metrics.overdueCount > 0) {
      newInsights.push({
        id: "overdue-alert",
        type: "warning",
        title: "Overdue Tasks Alert! ⚠️",
        description: `${metrics.overdueCount} task${metrics.overdueCount > 1 ? "s are" : " is"} overdue. Immediate attention needed.`,
        action: "Review and reschedule overdue tasks",
        priority: "high",
        icon: AlertCircle,
        value: metrics.overdueCount,
      })
    }

    if (metrics.upcomingDeadlines > 0) {
      newInsights.push({
        id: "upcoming-deadlines",
        type: "suggestion",
        title: "Upcoming Deadlines",
        description: `${metrics.upcomingDeadlines} task${metrics.upcomingDeadlines > 1 ? "s have" : " has"} deadline${metrics.upcomingDeadlines > 1 ? "s" : ""} in the next 3 days.`,
        action: "Prioritize deadline-sensitive tasks",
        priority: "medium",
        icon: Calendar,
        value: metrics.upcomingDeadlines,
      })
    }

    // 7. Priority Balance Insights
    const totalTasks =
      metrics.priorityDistribution.high + metrics.priorityDistribution.medium + metrics.priorityDistribution.low
    const highPriorityRatio = totalTasks > 0 ? (metrics.priorityDistribution.high / totalTasks) * 100 : 0

    if (highPriorityRatio > 60) {
      newInsights.push({
        id: "priority-overload",
        type: "warning",
        title: "High Priority Overload",
        description: `${highPriorityRatio.toFixed(1)}% of tasks are high priority. This might cause stress and decision fatigue.`,
        action: "Re-evaluate task priorities",
        priority: "medium",
        icon: AlertCircle,
        value: highPriorityRatio,
      })
    } else if (highPriorityRatio < 20 && totalTasks > 5) {
      newInsights.push({
        id: "priority-balance",
        type: "optimization",
        title: "Well-Balanced Priorities",
        description: `Good priority distribution! ${highPriorityRatio.toFixed(1)}% high priority tasks - sustainable workload.`,
        priority: "low",
        icon: Target,
        value: highPriorityRatio,
      })
    }

    // 8. Time-based Productivity Suggestions
    if (currentHour >= 14 && currentHour <= 16 && metrics.weeklyVelocity < 5) {
      newInsights.push({
        id: "afternoon-boost",
        type: "suggestion",
        title: "Afternoon Productivity Boost",
        description:
          "Post-lunch energy dip? Try the 2-minute rule: do any task that takes less than 2 minutes immediately.",
        action: "Complete 2-3 quick tasks",
        priority: "medium",
        icon: Timer,
      })
    }

    // 9. Weekend Planning Insight
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    if (isWeekend && metrics.averageTasksPerDay > 3) {
      newInsights.push({
        id: "weekend-planning",
        type: "suggestion",
        title: "Weekend Planning Opportunity",
        description: "Great time to plan next week's tasks and review your productivity patterns.",
        action: "Plan next week's priorities",
        priority: "low",
        icon: Calendar,
      })
    }

    // 10. Achievement Recognition
    const recentCompletions = todos.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    ).length

    if (recentCompletions >= 5) {
      newInsights.push({
        id: "daily-champion",
        type: "achievement",
        title: "Daily Champion! 🏆",
        description: `${recentCompletions} tasks completed today! You're crushing your goals.`,
        priority: "high",
        icon: Trophy,
        value: recentCompletions,
      })
    }

    setInsights(newInsights.slice(0, 8)) // Limit to 8 most relevant insights
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "text-green-600 bg-green-100 dark:bg-green-950/20"
      case "warning":
        return "text-red-600 bg-red-100 dark:bg-red-950/20"
      case "optimization":
        return "text-purple-600 bg-purple-100 dark:bg-purple-950/20"
      case "suggestion":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950/20"
      case "pattern":
        return "text-orange-600 bg-orange-100 dark:bg-orange-950/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-950/20"
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
            <span className="text-lg font-semibold">AI Productivity Insights</span>
            <p className="text-sm text-muted-foreground font-normal">Smart analysis & recommendations</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {metrics.completionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500">Completion Rate</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-700 dark:text-green-400">{metrics.currentStreak}</div>
              <div className="text-xs text-green-600 dark:text-green-500">Day Streak</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{metrics.weeklyVelocity}</div>
              <div className="text-xs text-purple-600 dark:text-purple-500">Weekly Tasks</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">{metrics.bestWorkingHour}:00</div>
              <div className="text-xs text-orange-600 dark:text-orange-500">Peak Hour</div>
            </div>
          </div>
        )}

        {/* Insights */}
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
                        <Badge variant="outline" className={`text-xs ${getTypeColor(insight.type)}`}>
                          {insight.type}
                        </Badge>
                        {insight.trend && (
                          <div
                            className={`text-xs ${insight.trend === "up" ? "text-green-600" : insight.trend === "down" ? "text-red-600" : "text-gray-600"}`}
                          >
                            {insight.trend === "up" ? "↗️" : insight.trend === "down" ? "↘️" : "→"}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      {insight.value !== undefined && (
                        <div className="mb-2">
                          <Progress value={Math.min(insight.value, 100)} className="h-2" />
                        </div>
                      )}
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
              <p className="font-medium">Building insights...</p>
              <p className="text-sm">Complete some tasks to get AI-powered insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
