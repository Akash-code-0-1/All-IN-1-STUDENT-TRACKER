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
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
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
  targetFrequency: number
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
const habitColors = [
  { name: "Blue", value: "bg-blue-500", light: "bg-blue-50", border: "border-blue-200" },
  { name: "Green", value: "bg-green-500", light: "bg-green-50", border: "border-green-200" },
  { name: "Purple", value: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200" },
  { name: "Orange", value: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200" },
  { name: "Pink", value: "bg-pink-500", light: "bg-pink-50", border: "border-pink-200" },
  { name: "Cyan", value: "bg-cyan-500", light: "bg-cyan-50", border: "border-cyan-200" },
]

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
    const handleTodosUpdate = () => loadData()
    window.addEventListener("todosUpdated", handleTodosUpdate)
    return () => window.removeEventListener("todosUpdated", handleTodosUpdate)
  }, [])

  const loadData = () => {
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      setTodos(parsedTodos)
      const calculatedMetrics = calculateMetrics(parsedTodos)
      setMetrics(calculatedMetrics)
      generateAdvancedInsights(parsedTodos, calculatedMetrics)
    }

    const savedHabits = localStorage.getItem("productive-me-habits")
    if (savedHabits) setHabits(JSON.parse(savedHabits))

    const savedGoals = localStorage.getItem("productive-me-goals")
    if (savedGoals) setGoals(JSON.parse(savedGoals))
  }

  const calculateMetrics = (todos: Todo[]): ProductivityMetrics => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const completedTasks = todos.filter((t) => t.completed).length
    const completionRate = todos.length > 0 ? (completedTasks / todos.length) * 100 : 0

    const recentTasks = todos.filter((t) => t.createdAt >= weekAgo)
    const averageTasksPerDay = recentTasks.length / 7

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

    const currentStreak = calculateStreak(todos)
    const weeklyCompleted = todos.filter((t) => t.completed && t.completedAt && t.completedAt >= weekAgo).length

    const priorityDistribution = todos.reduce(
      (acc, todo) => {
        acc[todo.priority as keyof typeof acc]++
        return acc
      },
      { high: 0, medium: 0, low: 0 },
    )

    const overdueCount = todos.filter((t) => !t.completed && t.deadline && new Date(t.deadline) < now).length
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const upcomingDeadlines = todos.filter(
      (t) =>
        !t.completed && t.deadline && t.deadline >= now.toISOString().split("T")[0] && t.deadline <= threeDaysFromNow,
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

  const generateAdvancedInsights = (todos: Todo[], metrics: ProductivityMetrics) => {
    const newInsights: Insight[] = []

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
    }

    setInsights(newInsights.slice(0, 4))
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

  const getTodayString = () => new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Productivity Insights
              </h1>
              <p className="text-sm text-muted-foreground">Smart analysis & advanced tracking</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Side - AI Insights */}
          <div className="space-y-6">
            {/* Metrics Overview */}
            {metrics && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                      <div className="relative">
                        <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
                        <div className="text-xs opacity-90">Completion Rate</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                      <div className="relative">
                        <div className="text-2xl font-bold flex items-center gap-1">
                          {metrics.currentStreak}
                          <Flame className="h-4 w-4" />
                        </div>
                        <div className="text-xs opacity-90">Day Streak</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                      <div className="relative">
                        <div className="text-2xl font-bold">{metrics.weeklyVelocity}</div>
                        <div className="text-xs opacity-90">Weekly Tasks</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                      <div className="relative">
                        <div className="text-2xl font-bold">{metrics.bestWorkingHour}:00</div>
                        <div className="text-xs opacity-90">Peak Hour</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Smart Insights
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
                          className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sm">{insight.title}</h4>
                                <Badge
                                  variant={insight.type === "achievement" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {insight.type}
                                </Badge>
                                {insight.trend && (
                                  <div className="flex items-center">
                                    {insight.trend === "up" ? (
                                      <ArrowUp className="h-3 w-3 text-green-600" />
                                    ) : insight.trend === "down" ? (
                                      <ArrowDown className="h-3 w-3 text-red-600" />
                                    ) : (
                                      <Minus className="h-3 w-3 text-gray-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                              {insight.value !== undefined && (
                                <div className="mb-3">
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
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Building insights...</p>
                      <p className="text-sm text-muted-foreground">Complete some tasks to get AI-powered insights</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Advanced Features */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Advanced Tracking
                  </CardTitle>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <Button
                      variant={activeTab === "habits" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("habits")}
                      className="text-xs px-3 py-1.5"
                    >
                      Habits
                    </Button>
                    <Button
                      variant={activeTab === "goals" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("goals")}
                      className="text-xs px-3 py-1.5"
                    >
                      Goals
                    </Button>
                    <Button
                      variant={activeTab === "analytics" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("analytics")}
                      className="text-xs px-3 py-1.5"
                    >
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Habits Tab */}
                {activeTab === "habits" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Daily Habits</h3>
                      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Habit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
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
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="habit-description">Description</Label>
                              <Input
                                id="habit-description"
                                value={newHabit.description}
                                onChange={(e) => setNewHabit((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of the habit"
                                className="mt-1"
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
                                    setNewHabit((prev) => ({
                                      ...prev,
                                      targetFrequency: Number.parseInt(e.target.value),
                                    }))
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="habit-category">Category</Label>
                                <Select
                                  value={newHabit.category}
                                  onValueChange={(value) => setNewHabit((prev) => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger className="mt-1">
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
                                    key={color.value}
                                    onClick={() => setNewHabit((prev) => ({ ...prev, color: color.value }))}
                                    className={`w-8 h-8 rounded-full ${color.value} ${
                                      newHabit.color === color.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                    }`}
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

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {habits.map((habit) => {
                        const todayProgress = getWeeklyHabitProgress(habit)
                        const streak = getHabitStreak(habit)
                        const todayCompleted = habit.completions.find((c) => c.date === getTodayString() && c.completed)
                        const colorConfig = habitColors.find((c) => c.value === habit.color)

                        return (
                          <div
                            key={habit.id}
                            className={`relative overflow-hidden rounded-2xl border ${colorConfig?.light} ${colorConfig?.border} p-4 hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                                <div>
                                  <h4 className="font-medium text-sm">{habit.name}</h4>
                                  <p className="text-xs text-muted-foreground">{habit.description}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">Weekly Progress</span>
                                <span className="font-bold">{Math.round(todayProgress)}%</span>
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
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-green-100 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-emerald-600" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">No habits yet</p>
                          <p className="text-sm text-muted-foreground">Create your first habit to start tracking</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Goals Tab */}
                {activeTab === "goals" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Active Goals</h3>
                      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Goal
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
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
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="goal-description">Description</Label>
                              <Input
                                id="goal-description"
                                value={newGoal.description}
                                onChange={(e) => setNewGoal((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="What you want to achieve"
                                className="mt-1"
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
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="goal-unit">Unit</Label>
                                <Input
                                  id="goal-unit"
                                  value={newGoal.unit}
                                  onChange={(e) => setNewGoal((prev) => ({ ...prev, unit: e.target.value }))}
                                  placeholder="tasks, hours, etc."
                                  className="mt-1"
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
                                className="mt-1"
                              />
                            </div>
                            <Button onClick={addGoal} className="w-full">
                              Create Goal
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {goals.map((goal) => {
                        const progress = (goal.currentValue / goal.targetValue) * 100
                        const isOverdue = goal.deadline && new Date(goal.deadline) < new Date()

                        return (
                          <div
                            key={goal.id}
                            className={`relative overflow-hidden rounded-2xl border p-4 hover:shadow-lg transition-all duration-300 ${
                              isOverdue
                                ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                                : "bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-sm">{goal.title}</h4>
                                <p className="text-xs text-muted-foreground">{goal.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteGoal(goal.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">Progress</span>
                                <span className="font-bold">
                                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                                </span>
                              </div>
                              <Progress value={Math.min(progress, 100)} className="h-2" />

                              <div className="flex items-center justify-between">
                                <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No deadline"}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateGoalProgress(goal.id, goal.currentValue - 1)}
                                    className="text-xs px-2 h-7"
                                  >
                                    -
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                                    className="text-xs px-2 h-7"
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
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Target className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">No goals set</p>
                          <p className="text-sm text-muted-foreground">Create your first goal to track progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-base">Productivity Analytics</h3>

                    {metrics && (
                      <div className="space-y-4">
                        {/* Category Performance */}
                        <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4">
                          <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Category Performance
                          </h4>
                          <div className="space-y-3">
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
                                  <div className="flex items-center gap-3">
                                    <Progress value={rate} className="w-20 h-2" />
                                    <span className="text-xs font-bold w-10 text-right">{rate.toFixed(0)}%</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4">
                          <h4 className="font-medium text-sm mb-4">Priority Distribution</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-red-600">High Priority</span>
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={(metrics.priorityDistribution.high / todos.length) * 100}
                                  className="w-20 h-2"
                                />
                                <span className="text-xs font-bold w-6 text-right">
                                  {metrics.priorityDistribution.high}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-amber-600">Medium Priority</span>
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={(metrics.priorityDistribution.medium / todos.length) * 100}
                                  className="w-20 h-2"
                                />
                                <span className="text-xs font-bold w-6 text-right">
                                  {metrics.priorityDistribution.medium}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-green-600">Low Priority</span>
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={(metrics.priorityDistribution.low / todos.length) * 100}
                                  className="w-20 h-2"
                                />
                                <span className="text-xs font-bold w-6 text-right">
                                  {metrics.priorityDistribution.low}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Habit Analytics */}
                        {habits.length > 0 && (
                          <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4">
                            <h4 className="font-medium text-sm mb-4">Habit Success Rate</h4>
                            <div className="space-y-3">
                              {habits.map((habit) => {
                                const progress = getWeeklyHabitProgress(habit)
                                const colorConfig = habitColors.find((c) => c.value === habit.color)
                                return (
                                  <div key={habit.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                                      <span className="text-xs font-medium">{habit.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Progress value={progress} className="w-20 h-2" />
                                      <span className="text-xs font-bold w-10 text-right">{Math.round(progress)}%</span>
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
        </div>
      </div>
    </div>
  )
}
