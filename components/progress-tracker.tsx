"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Target, Flame, Trophy, CheckCircle, Calendar, Activity } from "lucide-react"

interface Todo {
  id: string
  title: string
  category: string
  priority: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

interface ProgressData {
  date: string
  completed: number
  total: number
  percentage: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

// Utility functions for date operations
const subDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

const formatDateShort = (date: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

const formatMonth = (date: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months[date.getMonth()]
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}`
}

const startOfWeek = (date: Date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day
  return new Date(result.setDate(diff))
}

const endOfWeek = (date: Date) => {
  const result = startOfWeek(date)
  return new Date(result.setDate(result.getDate() + 6))
}

const startOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const endOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function ProgressTracker() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [streak, setStreak] = useState(0)
  const [dailyData, setDailyData] = useState<ProgressData[]>([])
  const [weeklyData, setWeeklyData] = useState<ProgressData[]>([])
  const [monthlyData, setMonthlyData] = useState<ProgressData[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    loadTodos()

    // Listen for todo updates
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
      calculateProgressData(parsedTodos)
      calculateStreak(parsedTodos)
    }
  }

  const calculateProgressData = (todos: Todo[]) => {
    // Daily data for last 7 days
    const daily = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = date.toISOString().split("T")[0]
      const dayTodos = todos.filter(
        (todo) => todo.createdAt.startsWith(dateStr) || (todo.completedAt && todo.completedAt.startsWith(dateStr)),
      )
      const completed = dayTodos.filter(
        (todo) => todo.completed && todo.completedAt && todo.completedAt.startsWith(dateStr),
      ).length
      const total = dayTodos.length

      daily.push({
        date: formatDateShort(date),
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }
    setDailyData(daily)

    // Weekly data for last 4 weeks
    const weekly = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7))
      const weekEnd = endOfWeek(subDays(new Date(), i * 7))
      const weekTodos = todos.filter((todo) => {
        const createdDate = new Date(todo.createdAt)
        return createdDate >= weekStart && createdDate <= weekEnd
      })
      const completed = weekTodos.filter((todo) => todo.completed).length
      const total = weekTodos.length

      weekly.push({
        date: `Week ${4 - i}`,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }
    setWeeklyData(weekly)

    // Monthly data for last 6 months
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subDays(new Date(), i * 30))
      const monthEnd = endOfMonth(subDays(new Date(), i * 30))
      const monthTodos = todos.filter((todo) => {
        const createdDate = new Date(todo.createdAt)
        return createdDate >= monthStart && createdDate <= monthEnd
      })
      const completed = monthTodos.filter((todo) => todo.completed).length
      const total = monthTodos.length

      monthly.push({
        date: formatMonth(monthStart),
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }
    setMonthlyData(monthly)

    // Category data
    const categories = todos.reduce(
      (acc, todo) => {
        if (!acc[todo.category]) {
          acc[todo.category] = { total: 0, completed: 0 }
        }
        acc[todo.category].total++
        if (todo.completed) {
          acc[todo.category].completed++
        }
        return acc
      },
      {} as Record<string, { total: number; completed: number }>,
    )

    const categoryArray = Object.entries(categories).map(([name, data], index) => ({
      name,
      value: data.completed,
      total: data.total,
      percentage: Math.round((data.completed / data.total) * 100),
      color: COLORS[index % COLORS.length],
    }))
    setCategoryData(categoryArray)
  }

  const calculateStreak = (todos: Todo[]) => {
    const completedDates = todos
      .filter((todo) => todo.completed && todo.completedAt)
      .map((todo) => todo.completedAt!.split("T")[0])
      .sort()
      .reverse()

    if (completedDates.length === 0) {
      setStreak(0)
      return
    }

    let currentStreak = 0
    let currentDate = new Date()

    // Check if there's a task completed today
    const today = currentDate.toISOString().split("T")[0]
    if (completedDates.includes(today)) {
      currentStreak = 1
      currentDate = subDays(currentDate, 1)
    } else {
      // Check if there's a task completed yesterday
      const yesterday = subDays(new Date(), 1).toISOString().split("T")[0]
      if (completedDates.includes(yesterday)) {
        currentStreak = 1
        currentDate = subDays(currentDate, 2)
      } else {
        setStreak(0)
        return
      }
    }

    // Count consecutive days
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (completedDates.includes(dateStr)) {
        currentStreak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }

    setStreak(currentStreak)
  }

  const totalTasks = todos.length
  const completedTasks = todos.filter((todo) => todo.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = todos.filter((todo) => {
    return todo.createdAt.startsWith(today) || (todo.completedAt && todo.completedAt.startsWith(today))
  })
  const todayCompleted = todayTasks.filter((todo) => todo.completed).length

  const recentlyCompleted = todos
    .filter((todo) => todo.completed && todo.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completionRate}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{streak}</p>
                <p className="text-xs text-orange-600 dark:text-orange-500 font-medium">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{todayCompleted}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Today's Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{completedTasks}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500 font-medium">Total Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Progress Analytics</span>
              <p className="text-sm text-muted-foreground font-normal">Track your productivity trends</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="daily" className="data-[state=active]:bg-background">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-background">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-background">
                Monthly
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4 mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4 mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Completion %"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Category Distribution</span>
                <p className="text-sm text-muted-foreground font-normal">Task breakdown by category</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name, props) => [
                          `${value} completed (${props.payload.percentage}%)`,
                          props.payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {category.value}/{category.total}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">Complete some tasks to see distribution</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Recently Completed</span>
                <p className="text-sm text-muted-foreground font-normal">Latest achievements</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyCompleted.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{todo.title}</p>
                    <p className="text-sm text-muted-foreground font-mono">{formatDateTime(todo.completedAt!)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    {todo.category}
                  </Badge>
                </div>
              ))}
              {recentlyCompleted.length === 0 && (
                <div className="text-center text-muted-foreground py-16">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No completed tasks yet</p>
                  <p className="text-sm">Complete some tasks to see them here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
