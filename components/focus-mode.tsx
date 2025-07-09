"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Zap, Volume2, VolumeX } from "lucide-react"

interface FocusSession {
  id: string
  taskId: string
  taskTitle: string
  duration: number
  startTime: string
  endTime?: string
  completed: boolean
}

export function FocusMode() {
  const [isActive, setIsActive] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [focusDuration, setFocusDuration] = useState(25)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [todos, setTodos] = useState<any[]>([])
  const [ambientSound, setAmbientSound] = useState<string>("none")
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    loadTodos()
    loadSessions()

    const handleTodosUpdate = () => {
      loadTodos()
    }

    window.addEventListener("todosUpdated", handleTodosUpdate)
    return () => window.removeEventListener("todosUpdated", handleTodosUpdate)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            completeFocusSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  const loadTodos = () => {
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      const pendingTodos = parsedTodos.filter((todo: any) => !todo.completed)
      setTodos(pendingTodos)
    }
  }

  const loadSessions = () => {
    const savedSessions = localStorage.getItem("productive-me-focus-sessions")
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }

  const saveSessions = (newSessions: FocusSession[]) => {
    localStorage.setItem("productive-me-focus-sessions", JSON.stringify(newSessions))
    setSessions(newSessions)
  }

  const startFocusSession = () => {
    if (!selectedTask) return

    const task = todos.find((t) => t.id === selectedTask)
    if (!task) return

    const session: FocusSession = {
      id: Date.now().toString(),
      taskId: selectedTask,
      taskTitle: task.title,
      duration: focusDuration,
      startTime: new Date().toISOString(),
      completed: false,
    }

    setCurrentSession(session)
    setTimeRemaining(focusDuration * 60)
    setIsActive(true)

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // Enable focus mode styling
    document.body.classList.add("focus-mode")
  }

  const completeFocusSession = () => {
    if (!currentSession) return

    const completedSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      completed: true,
    }

    const newSessions = [...sessions, completedSession]
    saveSessions(newSessions)

    setIsActive(false)
    setCurrentSession(null)
    setTimeRemaining(0)
    document.body.classList.remove("focus-mode")

    // Show completion notification
    if ("Notification" in window && Notification.permission === "granted" && soundEnabled) {
      new Notification("Focus Session Complete!", {
        body: `Great job! You focused on "${currentSession.taskTitle}" for ${focusDuration} minutes.`,
        icon: "/favicon.ico",
      })
    }
  }

  const cancelFocusSession = () => {
    setIsActive(false)
    setCurrentSession(null)
    setTimeRemaining(0)
    document.body.classList.remove("focus-mode")
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const todaysSessions = sessions.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.startsWith(today) && session.completed
  })

  const totalFocusTime = todaysSessions.reduce((total, session) => total + session.duration, 0)

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Eye className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-lg font-semibold">Focus Mode</span>
            <p className="text-sm text-muted-foreground font-normal">Deep work sessions</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isActive ? (
          <>
            {/* Session Setup */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Task</label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task to focus on" />
                  </SelectTrigger>
                  <SelectContent>
                    {todos.map((todo) => (
                      <SelectItem key={todo.id} value={todo.id}>
                        <div className="flex items-center gap-2">
                          <span>{todo.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {todo.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Select value={focusDuration.toString()} onValueChange={(value) => setFocusDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes (Deep Work)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ambient Sound</label>
                <Select value={ambientSound} onValueChange={setAmbientSound}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="rain">Rain</SelectItem>
                    <SelectItem value="forest">Forest</SelectItem>
                    <SelectItem value="coffee">Coffee Shop</SelectItem>
                    <SelectItem value="white-noise">White Noise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startFocusSession}
                disabled={!selectedTask}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Focus Session
              </Button>
            </div>

            {/* Today's Stats */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Today's Focus</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{todaysSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{totalFocusTime}m</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Active Session */
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="text-6xl font-mono font-bold text-indigo-600 mb-2">{formatTime(timeRemaining)}</div>
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-muted-foreground mb-1">Focusing on</p>
              <p className="font-semibold">{currentSession?.taskTitle}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={cancelFocusSession} variant="outline" size="lg">
                <EyeOff className="h-4 w-4 mr-2" />
                Exit Focus
              </Button>
              <Button onClick={() => setSoundEnabled(!soundEnabled)} variant="ghost" size="lg">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Stay focused! Minimize distractions and give your full attention to the task.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
