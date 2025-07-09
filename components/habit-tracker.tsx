"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Repeat, Flame } from "lucide-react"

interface Habit {
  id: string
  name: string
  description: string
  color: string
  streak: number
  bestStreak: number
  completions: string[] // dates when completed
  createdAt: string
}

const habitColors = [
  { name: "Blue", value: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-950/20" },
  { name: "Green", value: "bg-green-500", light: "bg-green-50 dark:bg-green-950/20" },
  { name: "Purple", value: "bg-purple-500", light: "bg-purple-50 dark:bg-purple-950/20" },
  { name: "Orange", value: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-950/20" },
  { name: "Pink", value: "bg-pink-500", light: "bg-pink-50 dark:bg-pink-950/20" },
  { name: "Cyan", value: "bg-cyan-500", light: "bg-cyan-50 dark:bg-cyan-950/20" },
]

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
  })

  useEffect(() => {
    loadHabits()
  }, [])

  useEffect(() => {
    localStorage.setItem("productive-me-habits", JSON.stringify(habits))
  }, [habits])

  const loadHabits = () => {
    const savedHabits = localStorage.getItem("productive-me-habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      color: newHabit.color,
      streak: 0,
      bestStreak: 0,
      completions: [],
      createdAt: new Date().toISOString(),
    }

    setHabits((prev) => [...prev, habit])
    setNewHabit({ name: "", description: "", color: "bg-blue-500" })
    setIsAddDialogOpen(false)
  }

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0]

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit

        const isCompletedToday = habit.completions.includes(today)
        let newCompletions: string[]

        if (isCompletedToday) {
          // Remove today's completion
          newCompletions = habit.completions.filter((date) => date !== today)
        } else {
          // Add today's completion
          newCompletions = [...habit.completions, today].sort()
        }

        // Calculate new streak
        const newStreak = calculateStreak(newCompletions)
        const newBestStreak = Math.max(habit.bestStreak, newStreak)

        return {
          ...habit,
          completions: newCompletions,
          streak: newStreak,
          bestStreak: newBestStreak,
        }
      }),
    )
  }

  const calculateStreak = (completions: string[]) => {
    if (completions.length === 0) return 0

    const sortedDates = completions.sort().reverse()
    const today = new Date().toISOString().split("T")[0]

    let streak = 0
    let currentDate = new Date()

    // Check if completed today
    if (sortedDates.includes(today)) {
      streak = 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Check if completed yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (sortedDates.includes(yesterdayStr)) {
        streak = 1
        currentDate = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000)
      } else {
        return 0
      }
    }

    // Count consecutive days
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (sortedDates.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
  }

  const getWeekDays = () => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        isToday: i === 0,
      })
    }

    return days
  }

  const weekDays = getWeekDays()
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Repeat className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Habit Tracker</span>
              <p className="text-sm text-muted-foreground font-normal">Build consistent routines</p>
            </div>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
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
                    placeholder="e.g., Drink 8 glasses of water"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-description">Description (optional)</Label>
                  <Input
                    id="habit-description"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Why is this habit important?"
                  />
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
      </CardHeader>
      <CardContent className="space-y-6">
        {habits.length > 0 ? (
          <>
            {/* Week View Header */}
            <div className="grid grid-cols-8 gap-2 text-center">
              <div className="text-sm font-medium text-muted-foreground">Habit</div>
              {weekDays.map((day) => (
                <div key={day.date} className="text-sm font-medium text-muted-foreground">
                  <div>{day.day}</div>
                  <div className={`text-xs ${day.isToday ? "text-blue-600 font-bold" : ""}`}>
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Habits List */}
            <div className="space-y-3">
              {habits.map((habit) => {
                const colorConfig = habitColors.find((c) => c.value === habit.color)
                const isCompletedToday = habit.completions.includes(today)

                return (
                  <div key={habit.id} className={`p-4 rounded-xl border ${colorConfig?.light}`}>
                    <div className="grid grid-cols-8 gap-2 items-center">
                      {/* Habit Info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                        <div>
                          <p className="font-medium text-sm">{habit.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Flame className="h-3 w-3 mr-1" />
                              {habit.streak}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Best: {habit.bestStreak}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Week Checkboxes */}
                      {weekDays.map((day) => {
                        const isCompleted = habit.completions.includes(day.date)
                        const isToday = day.isToday

                        return (
                          <div key={day.date} className="flex justify-center">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleHabitCompletion(habit.id)}
                              disabled={!isToday && day.date > today}
                              className={`${isCompleted ? habit.color.replace("bg-", "data-[state=checked]:bg-") : ""} ${
                                isToday ? "ring-2 ring-blue-300" : ""
                              }`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600">{habits.length}</p>
                <p className="text-xs text-muted-foreground">Active Habits</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-orange-600">
                  {habits.filter((h) => h.completions.includes(today)).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed Today</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-600">{Math.max(...habits.map((h) => h.bestStreak), 0)}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Repeat className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No habits yet</p>
            <p className="text-sm">Start building positive routines today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
