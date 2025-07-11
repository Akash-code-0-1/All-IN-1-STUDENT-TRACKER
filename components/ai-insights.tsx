"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  Trophy,
  Flame,
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react"

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

interface Habit {
  id: string
  name: string
  description: string
  targetFrequency: number // times per week
  category: string
  color: string
  createdAt: string
  completions: { date: string; completed: boolean }[]
}

interface Goal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  category: string
  createdAt: string
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

const habitCategories = ["Health", "Learning", "Productivity", "Social", "Personal", "Fitness", "Mindfulness"]
const habitColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"]

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null)
  const [activeTab, setActiveTab] = useState<"habits" | "goals" | "analytics">("habits")

  // Dialog states
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Form states
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    targetFrequency: 7,
    category: "Health",
    color: "bg-blue-500",
  })

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetValue: 10,
    unit: "tasks",
    deadline: "",
    category: "Productivity",
  })

  useEffect(() => {
    loadData()

    const handleTodosUpdate = () => {
      loadData()
    }

    window.addEventListener("todosUpdated", handleTodosUpdate)
    return () => window.removeEventListener("todosUpdated", handleTodosUpdate)
  }, [])

  const loadData = () => {
    // Load todos
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      setTodos(parsedTodos)
      const calculatedMetrics = calculateMetrics(parsedTodos)
      setMetrics(calculatedMetrics)
      generateAdvancedInsights(parsedTodos, calculatedMetrics)
    }

    // Load habits
    const savedHabits = localStorage.getItem("productive-me-habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }

    // Load goals
    const savedGoals = localStorage.getItem("productive-me-goals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
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

    setInsights(newInsights.slice(0, 6)) // Limit to 6 insights for better layout
  }

  // Habit Management Functions
  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newHabit.name,
      description: newHabit.description,
      targetFrequency: newHabit.targetFrequency,
      category: newHabit.category,
      color: newHabit.color,
      createdAt: new Date().toISOString(),
      completions: [],
    }

    const updatedHabits = [...habits, habit]
    setHabits(updatedHabits)
    localStorage.setItem("productive-me-habits", JSON.stringify(updatedHabits))

    setNewHabit({
      name: "",
      description: "",
      targetFrequency: 7,
      category: "Health",
      color: "bg-blue-500",
    })
    setIsHabitDialogOpen(false)
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const existingCompletion = habit.completions.find((c) => c.date === date)
        if (existingCompletion) {
          return {
            ...habit,
            completions: habit.completions.map((c) => (c.date === date ? { ...c, completed: !c.completed } : c)),
          }
        } else {
          return {
            ...habit,
            completions: [...habit.completions, { date, completed: true }],
          }
        }
      }
      return habit
    })

    setHabits(updatedHabits)
    localStorage.setItem("productive-me-habits", JSON.stringify(updatedHabits))
  }

  const getHabitStreak = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0]
    let streak = 0
    const currentDate = new Date()

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const completion = habit.completions.find((c) => c.date === dateStr)

      if (completion && completion.completed) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const getWeeklyHabitProgress = (habit: Habit) => {
    const today = new Date()
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)

    let completedThisWeek = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const completion = habit.completions.find((c) => c.date === dateStr && c.completed)
      if (completion) completedThisWeek++
    }

    return (completedThisWeek / habit.targetFrequency) * 100
  }

  // Goal Management Functions
  const addGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      description: newGoal.description,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      category: newGoal.category,
      createdAt: new Date().toISOString(),
    }

    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    localStorage.setItem("productive-me-goals", JSON.stringify(updatedGoals))

    setNewGoal({
      title: "",
      description: "",
      targetValue: 10,
      unit: "tasks",
      deadline: "",
      category: "Productivity",
    })
    setIsGoalDialogOpen(false)
  }

  const updateGoalProgress = (goalId: string, newValue: number) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, currentValue: Math.max(0, newValue) } : goal,
    )
    setGoals(updatedGoals)
    localStorage.setItem("productive-me-goals", JSON.stringify(updatedGoals))
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId)
    setGoals(updatedGoals)
    localStorage.setItem("productive-me-goals", JSON.stringify(updatedGoals))
  }

  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId)
    setHabits(updatedHabits)
    localStorage.setItem("productive-me-habits", JSON.stringify(updatedHabits))
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

  const getTodayString = () => new Date().toISOString().split("T")[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - AI Insights */}
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
            <div className="grid grid-cols-2 gap-3 mb-6">
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
                <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {metrics.bestWorkingHour}:00
                </div>
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

      {/* Right Side - Advanced Features */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Advanced Tracking</span>
                <p className="text-sm text-muted-foreground font-normal">Habits, goals & analytics</p>
              </div>
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={activeTab === "habits" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("habits")}
                className="text-xs"
              >
                Habits
              </Button>
              <Button
                variant={activeTab === "goals" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("goals")}
                className="text-xs"
              >
                Goals
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("analytics")}
                className="text-xs"
              >
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Habits Tab */}
          {activeTab === "habits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Daily Habits</h3>
                <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Habit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Habit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="habit-name">Habit Name</Label>
                        <Input
                          id="habit-name"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Morning Exercise, Read 30 minutes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="habit-description">Description</Label>
                        <Input
                          id="habit-description"
                          value={newHabit.description}
                          onChange={(e) => setNewHabit((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the habit"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="habit-frequency">Target per Week</Label>
                          <Input
                            id="habit-frequency"
                            type="number"
                            min="1"
                            max="7"
                            value={newHabit.targetFrequency}
                            onChange={(e) =>
                              setNewHabit((prev) => ({ ...prev, targetFrequency: Number.parseInt(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="habit-category">Category</Label>
                          <Select
                            value={newHabit.category}
                            onValueChange={(value) => setNewHabit((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {habitCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2 mt-2">
                          {habitColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewHabit((prev) => ({ ...prev, color }))}
                              className={`w-6 h-6 rounded-full ${color} ${newHabit.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={addHabit} className="w-full">
                        Create Habit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {habits.map((habit) => {
                  const todayProgress = getWeeklyHabitProgress(habit)
                  const streak = getHabitStreak(habit)
                  const todayCompleted = habit.completions.find((c) => c.date === getTodayString() && c.completed)

                  return (
                    <div key={habit.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                          <div>
                            <h4 className="font-medium text-sm">{habit.name}</h4>
                            <p className="text-xs text-muted-foreground">{habit.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteHabit(habit.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Weekly Progress</span>
                          <span>{Math.round(todayProgress)}%</span>
                        </div>
                        <Progress value={todayProgress} className="h-2" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Flame className="w-3 h-3 mr-1" />
                              {streak} day streak
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {habit.targetFrequency}x/week
                            </Badge>
                          </div>
                          <Button
                            variant={todayCompleted ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleHabitCompletion(habit.id, getTodayString())}
                            className="text-xs"
                          >
                            {todayCompleted ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            Today
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {habits.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No habits yet</p>
                    <p className="text-sm">Create your first habit to start tracking</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Active Goals</h3>
                <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="goal-title">Goal Title</Label>
                        <Input
                          id="goal-title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Complete 50 tasks this month"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-description">Description</Label>
                        <Input
                          id="goal-description"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="What you want to achieve"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="goal-target">Target Value</Label>
                          <Input
                            id="goal-target"
                            type="number"
                            min="1"
                            value={newGoal.targetValue}
                            onChange={(e) =>
                              setNewGoal((prev) => ({ ...prev, targetValue: Number.parseInt(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-unit">Unit</Label>
                          <Input
                            id="goal-unit"
                            value={newGoal.unit}
                            onChange={(e) => setNewGoal((prev) => ({ ...prev, unit: e.target.value }))}
                            placeholder="tasks, hours, etc."
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="goal-deadline">Deadline</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>
                      <Button onClick={addGoal} className="w-full">
                        Create Goal
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {goals.map((goal) => {
                  const progress = (goal.currentValue / goal.targetValue) * 100
                  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date()

                  return (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : "bg-card"}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-sm">{goal.title}</h4>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />

                        <div className="flex items-center justify-between">
                          <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs">
                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No deadline"}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGoalProgress(goal.id, goal.currentValue - 1)}
                              className="text-xs px-2"
                            >
                              -
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                              className="text-xs px-2"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {goals.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No goals set</p>
                    <p className="text-sm">Create your first goal to track progress</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Productivity Analytics</h3>

              {metrics && (
                <div className="space-y-4">
                  {/* Category Performance */}
                  <div className="p-4 rounded-xl border bg-card">
                    <h4 className="font-medium text-sm mb-3">Category Performance</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        todos.reduce(
                          (acc, todo) => {
                            if (!acc[todo.category]) acc[todo.category] = { total: 0, completed: 0 }
                            acc[todo.category].total++
                            if (todo.completed) acc[todo.category].completed++
                            return acc
                          },
                          {} as Record<string, { total: number; completed: number }>,
                        ),
                      ).map(([category, stats]) => {
                        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-xs font-medium">{category}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={rate} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground w-8">{rate.toFixed(0)}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Distribution */}
                  <div className="p-4 rounded-xl border bg-card">
                    <h4 className="font-medium text-sm mb-3">Priority Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-red-600">High Priority</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(metrics.priorityDistribution.high / todos.length) * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-xs text-muted-foreground w-8">{metrics.priorityDistribution.high}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-600">Medium Priority</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(metrics.priorityDistribution.medium / todos.length) * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-xs text-muted-foreground w-8">
                            {metrics.priorityDistribution.medium}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">Low Priority</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(metrics.priorityDistribution.low / todos.length) * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-xs text-muted-foreground w-8">{metrics.priorityDistribution.low}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Habit Analytics */}
                  {habits.length > 0 && (
                    <div className="p-4 rounded-xl border bg-card">
                      <h4 className="font-medium text-sm mb-3">Habit Success Rate</h4>
                      <div className="space-y-2">
                        {habits.map((habit) => {
                          const progress = getWeeklyHabitProgress(habit)
                          return (
                            <div key={habit.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${habit.color}`} />
                                <span className="text-xs font-medium">{habit.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground w-8">{Math.round(progress)}%</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
