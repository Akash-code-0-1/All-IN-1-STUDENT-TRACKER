"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, Pause, Square, RotateCcw, Clock, Target, BookOpen, Timer, Zap } from "lucide-react"

interface Todo {
  id: string
  title: string
  category: string
  priority: string
  deadline?: string
  completed: boolean
}

interface Revision {
  id: string
  originalTaskId: string
  originalTitle: string
  revisionNumber: number
  scheduledDate: string
  completed: boolean
}

const getTodayString = () => {
  return new Date().toISOString().split("T")[0]
}

export function TodayToolkit() {
  const [todayTasks, setTodayTasks] = useState<Todo[]>([])
  const [todayRevisions, setTodayRevisions] = useState<Revision[]>([])

  // Timer states
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)

  const [customTimer, setCustomTimer] = useState({ hours: 0, minutes: 25, seconds: 0 })
  const [customTimerTime, setCustomTimerTime] = useState(0)
  const [customTimerRunning, setCustomTimerRunning] = useState(false)

  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes
  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus")
  const [pomodoroSessions, setPomodoroSessions] = useState(0)

  // Load today's tasks and revisions
  useEffect(() => {
    loadTodayData()

    // Listen for updates
    const handleTodosUpdate = () => {
      loadTodayData()
    }

    const handleRevisionsUpdate = () => {
      loadTodayRevisions()
    }

    window.addEventListener("todosUpdated", handleTodosUpdate)
    window.addEventListener("revisionsUpdated", handleRevisionsUpdate)

    return () => {
      window.removeEventListener("todosUpdated", handleTodosUpdate)
      window.removeEventListener("revisionsUpdated", handleRevisionsUpdate)
    }
  }, [])

  const loadTodayData = () => {
    const today = getTodayString()

    // Load today's tasks
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const todos = JSON.parse(savedTodos)
      const todaysTasks = todos
        .filter((todo: Todo) => todo.deadline === today || (todo.createdAt && todo.createdAt.startsWith(today)))
        .sort((a: Todo, b: Todo) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        })
      setTodayTasks(todaysTasks)
    }

    loadTodayRevisions()
  }

  const loadTodayRevisions = () => {
    const today = getTodayString()

    // Load today's revisions
    const savedRevisions = localStorage.getItem("productive-me-revisions")
    if (savedRevisions) {
      const revisions = JSON.parse(savedRevisions)
      const todaysRevisions = revisions.filter(
        (revision: Revision) => revision.scheduledDate === today && !revision.completed,
      )
      setTodayRevisions(todaysRevisions)
    }
  }

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [stopwatchRunning])

  // Custom timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (customTimerRunning && customTimerTime > 0) {
      interval = setInterval(() => {
        setCustomTimerTime((prev) => {
          if (prev <= 1) {
            setCustomTimerRunning(false)
            // Show notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Timer Complete!", {
                body: "Your custom timer has finished.",
                icon: "/favicon.ico",
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [customTimerRunning, customTimerTime])

  // Pomodoro effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setPomodoroRunning(false)
            if (pomodoroMode === "focus") {
              setPomodoroSessions((prev) => prev + 1)
              setPomodoroMode("break")
              setPomodoroTime(5 * 60) // 5 minute break
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Focus Session Complete!", {
                  body: "Time for a 5-minute break.",
                  icon: "/favicon.ico",
                })
              }
            } else {
              setPomodoroMode("focus")
              setPomodoroTime(25 * 60) // 25 minute focus
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Break Complete!", {
                  body: "Time to focus for 25 minutes.",
                  icon: "/favicon.ico",
                })
              }
            }
            return pomodoroMode === "focus" ? 5 * 60 : 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [pomodoroRunning, pomodoroTime, pomodoroMode])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTodayTask = (id: string) => {
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const todos = JSON.parse(savedTodos)
      const updatedTodos = todos.map((todo: Todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : undefined }
          : todo,
      )
      localStorage.setItem("productive-me-todos", JSON.stringify(updatedTodos))
      setTodayTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))

      // Trigger update event
      window.dispatchEvent(new CustomEvent("todosUpdated"))
    }
  }

  const markRevisionComplete = (id: string) => {
    const savedRevisions = localStorage.getItem("productive-me-revisions")
    if (savedRevisions) {
      const revisions = JSON.parse(savedRevisions)
      const updatedRevisions = revisions.map((revision: Revision) =>
        revision.id === id ? { ...revision, completed: true } : revision,
      )
      localStorage.setItem("productive-me-revisions", JSON.stringify(updatedRevisions))
      setTodayRevisions((prev) => prev.filter((revision) => revision.id !== id))
    }
  }

  const startCustomTimer = () => {
    const totalSeconds = customTimer.hours * 3600 + customTimer.minutes * 60 + customTimer.seconds
    if (totalSeconds > 0) {
      setCustomTimerTime(totalSeconds)
      setCustomTimerRunning(true)
    }
  }

  const resetCustomTimer = () => {
    setCustomTimerRunning(false)
    setCustomTimerTime(0)
  }

  return (
    <div className="space-y-6">
      {/* Today's Tasks */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Today's Focus</span>
              <p className="text-sm text-muted-foreground font-normal">{todayTasks.length} tasks scheduled</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border hover:from-muted/50 hover:to-muted/20 transition-all duration-200"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTodayTask(task.id)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {task.category}
                    </Badge>
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                      className="text-xs font-medium"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No tasks for today</p>
                <p className="text-sm">Add tasks with today's deadline to see them here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Revisions */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Spaced Repetition</span>
              <p className="text-sm text-muted-foreground font-normal">{todayRevisions.length} revisions due</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {todayRevisions.map((revision) => (
              <div
                key={revision.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 hover:from-purple-100/50 hover:to-purple-200/50 dark:hover:from-purple-950/30 dark:hover:to-purple-900/30 transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{revision.originalTitle}</p>
                  <p className="text-sm text-muted-foreground">Revision #{revision.revisionNumber}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => markRevisionComplete(revision.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Complete
                </Button>
              </div>
            ))}
            {todayRevisions.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No revisions scheduled</p>
                <p className="text-sm">Complete tasks to schedule spaced repetition</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Tools */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Time Management</span>
              <p className="text-sm text-muted-foreground font-normal">Focus and productivity tools</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pomodoro" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="pomodoro" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Zap className="h-3 w-3" />
                Pomodoro
              </TabsTrigger>
              <TabsTrigger value="timer" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Timer className="h-3 w-3" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="stopwatch" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Clock className="h-3 w-3" />
                Stopwatch
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pomodoro" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="text-5xl font-mono font-bold text-center mb-4">{formatTime(pomodoroTime)}</div>
                  <div className="absolute -top-2 -right-2">
                    {pomodoroMode === "focus" ? (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                <Badge variant={pomodoroMode === "focus" ? "destructive" : "secondary"} className="text-sm px-4 py-2">
                  {pomodoroMode === "focus" ? <>🍅 Focus Session</> : <>☕ Break Time</>}
                </Badge>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setPomodoroRunning(!pomodoroRunning)}
                    variant={pomodoroRunning ? "secondary" : "default"}
                    size="lg"
                    className="px-8"
                  >
                    {pomodoroRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setPomodoroRunning(false)
                      setPomodoroTime(25 * 60)
                      setPomodoroMode("focus")
                    }}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Sessions completed today</p>
                  <p className="text-2xl font-bold text-orange-600">{pomodoroSessions}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timer" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <div className="text-5xl font-mono font-bold mb-6">{formatTime(customTimerTime)}</div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Hours</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={customTimer.hours}
                      onChange={(e) =>
                        setCustomTimer((prev) => ({ ...prev, hours: Number.parseInt(e.target.value) || 0 }))
                      }
                      disabled={customTimerRunning}
                      className="text-center h-12 text-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={customTimer.minutes}
                      onChange={(e) =>
                        setCustomTimer((prev) => ({ ...prev, minutes: Number.parseInt(e.target.value) || 0 }))
                      }
                      disabled={customTimerRunning}
                      className="text-center h-12 text-lg font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Seconds</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={customTimer.seconds}
                      onChange={(e) =>
                        setCustomTimer((prev) => ({ ...prev, seconds: Number.parseInt(e.target.value) || 0 }))
                      }
                      disabled={customTimerRunning}
                      className="text-center h-12 text-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={customTimerRunning ? () => setCustomTimerRunning(false) : startCustomTimer}
                    variant={customTimerRunning ? "secondary" : "default"}
                    size="lg"
                    className="px-8"
                  >
                    {customTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button onClick={resetCustomTimer} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stopwatch" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <div className="text-5xl font-mono font-bold mb-6">{formatTime(stopwatchTime)}</div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setStopwatchRunning(!stopwatchRunning)}
                    variant={stopwatchRunning ? "secondary" : "default"}
                    size="lg"
                    className="px-8"
                  >
                    {stopwatchRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setStopwatchRunning(false)
                      setStopwatchTime(0)
                    }}
                    variant="outline"
                    size="lg"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
