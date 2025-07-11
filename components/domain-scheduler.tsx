"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  FolderOpen,
  Target,
  BarChart3,
  Copy,
  Download,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Settings,
  ArrowRight,
} from "lucide-react"

interface Domain {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  targetTasksPerWeek?: number
}

interface DomainTask {
  id: string
  domainId: string
  title: string
  description: string
  scheduledDate: string
  completed: boolean
  completedAt?: string
  createdAt: string
  canConvertToTodo?: boolean
  estimatedHours?: number
  actualHours?: number
}

interface TaskTemplate {
  id: string
  name: string
  description: string
  estimatedHours: number
  category: string
  domainId?: string
}

const domainColors = [
  {
    name: "Blue",
    value: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Green",
    value: "bg-green-500",
    light: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-green-600",
  },
  {
    name: "Purple",
    value: "bg-purple-500",
    light: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Orange",
    value: "bg-orange-500",
    light: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "Pink",
    value: "bg-pink-500",
    light: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    name: "Cyan",
    value: "bg-cyan-500",
    light: "bg-cyan-50 dark:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-800",
    gradient: "from-cyan-500 to-cyan-600",
  },
]

export function DomainScheduler() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [domainTasks, setDomainTasks] = useState<DomainTask[]>([])
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"scheduler" | "analytics" | "templates">("scheduler")

  // Dialog states
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editingTask, setEditingTask] = useState<DomainTask | null>(null)

  // Form states
  const [newDomain, setNewDomain] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    targetTasksPerWeek: 5,
  })

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    canConvertToTodo: false,
    estimatedHours: 1,
  })

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    estimatedHours: 1,
    category: "General",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    localStorage.setItem("productive-me-domains", JSON.stringify(domains))
  }, [domains])

  useEffect(() => {
    localStorage.setItem("productive-me-domain-tasks", JSON.stringify(domainTasks))
  }, [domainTasks])

  useEffect(() => {
    localStorage.setItem("productive-me-task-templates", JSON.stringify(taskTemplates))
  }, [taskTemplates])

  const loadData = () => {
    const savedDomains = localStorage.getItem("productive-me-domains")
    if (savedDomains) setDomains(JSON.parse(savedDomains))

    const savedTasks = localStorage.getItem("productive-me-domain-tasks")
    if (savedTasks) setDomainTasks(JSON.parse(savedTasks))

    const savedTemplates = localStorage.getItem("productive-me-task-templates")
    if (savedTemplates) setTaskTemplates(JSON.parse(savedTemplates))
  }

  const addDomain = () => {
    if (!newDomain.name.trim()) return

    const domain: Domain = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newDomain.name,
      description: newDomain.description,
      color: newDomain.color,
      createdAt: new Date().toISOString(),
      targetTasksPerWeek: newDomain.targetTasksPerWeek,
    }

    setDomains((prev) => [...prev, domain])
    setNewDomain({ name: "", description: "", color: "bg-blue-500", targetTasksPerWeek: 5 })
    setIsDomainDialogOpen(false)
  }

  const addTemplate = () => {
    if (!newTemplate.name.trim()) return

    const template: TaskTemplate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newTemplate.name,
      description: newTemplate.description,
      estimatedHours: newTemplate.estimatedHours,
      category: newTemplate.category,
      domainId: selectedDomain !== "all" ? selectedDomain : undefined,
    }

    setTaskTemplates((prev) => [...prev, template])
    setNewTemplate({ name: "", description: "", estimatedHours: 1, category: "General" })
    setIsTemplateDialogOpen(false)
  }

  const createTaskFromTemplate = (template: TaskTemplate) => {
    if (selectedDomain === "all") return

    const task: DomainTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      domainId: selectedDomain,
      title: template.name,
      description: template.description,
      scheduledDate: new Date().toISOString().split("T")[0],
      completed: false,
      createdAt: new Date().toISOString(),
      canConvertToTodo: false,
      estimatedHours: template.estimatedHours,
    }

    setDomainTasks((prev) => [task, ...prev])
  }

  const addTask = () => {
    if (!newTask.title.trim() || selectedDomain === "all" || !newTask.scheduledDate) return

    const task: DomainTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      domainId: selectedDomain,
      title: newTask.title,
      description: newTask.description,
      scheduledDate: newTask.scheduledDate,
      completed: false,
      createdAt: new Date().toISOString(),
      canConvertToTodo: newTask.canConvertToTodo,
      estimatedHours: newTask.estimatedHours,
    }

    setDomainTasks((prev) => [task, ...prev])

    if (newTask.canConvertToTodo) {
      setTimeout(() => convertTaskToTodo(task), 100)
    }

    setNewTask({ title: "", description: "", scheduledDate: "", canConvertToTodo: false, estimatedHours: 1 })
    setIsTaskDialogOpen(false)
  }

  const toggleTaskCompletion = (taskId: string) => {
    setDomainTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )
  }

  const convertTaskToTodo = (task: DomainTask) => {
    const domain = domains.find((d) => d.id === task.domainId)
    const savedTodos = localStorage.getItem("productive-me-todos")
    const todos = savedTodos ? JSON.parse(savedTodos) : []

    const newTodo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: task.title,
      description:
        task.description || `From ${domain?.name || "Domain"} - Scheduled for ${formatDate(task.scheduledDate)}`,
      category: domain?.name || "Personal",
      priority: "medium",
      deadline: task.scheduledDate,
      completed: false,
      createdAt: new Date().toISOString(),
      enableSpacedRepetition: false,
    }

    const updatedTodos = [newTodo, ...todos]
    localStorage.setItem("productive-me-todos", JSON.stringify(updatedTodos))
    window.dispatchEvent(new CustomEvent("todosUpdated"))
  }

  const getDomainAnalytics = (domainId: string) => {
    const tasks = domainTasks.filter((task) => task.domainId === domainId)
    const completedTasks = tasks.filter((task) => task.completed)
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekTasks = tasks.filter((task) => new Date(task.createdAt) >= weekStart)
    const weekCompleted = weekTasks.filter((task) => task.completed).length

    const domain = domains.find((d) => d.id === domainId)
    const weeklyTarget = domain?.targetTasksPerWeek || 5
    const weeklyProgress = (weekCompleted / weeklyTarget) * 100

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      totalEstimatedHours,
      weeklyProgress,
      weekCompleted,
      weeklyTarget,
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  const getTodayString = () => new Date().toISOString().split("T")[0]

  const selectedDomainData = domains.find((d) => d.id === selectedDomain)
  const selectedDomainColor = selectedDomainData ? domainColors.find((c) => c.value === selectedDomainData.color) : null
  const filteredTasks =
    selectedDomain === "all" ? domainTasks : domainTasks.filter((task) => task.domainId === selectedDomain)

  const todayTasks = filteredTasks.filter((task) => task.scheduledDate === getTodayString())
  const upcomingTasks = filteredTasks.filter((task) => task.scheduledDate > getTodayString())
  const completedTasks = filteredTasks.filter((task) => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Domain Scheduler
              </h1>
              <p className="text-sm text-muted-foreground">Organize tasks by domain & intelligence</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Side - Domain Scheduler */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    Domain Management
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog
                      open={isDomainDialogOpen}
                      onOpenChange={(open) => {
                        setIsDomainDialogOpen(open)
                        if (!open) {
                          setEditingDomain(null)
                          setNewDomain({ name: "", description: "", color: "bg-blue-500", targetTasksPerWeek: 5 })
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Domain
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingDomain ? "Edit Domain" : "Create New Domain"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="domain-name">Domain Name</Label>
                            <Input
                              id="domain-name"
                              value={newDomain.name}
                              onChange={(e) => setNewDomain((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Web Development, Data Science"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="domain-description">Description</Label>
                            <Textarea
                              id="domain-description"
                              value={newDomain.description}
                              onChange={(e) => setNewDomain((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description of this domain"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="target-tasks">Target Tasks per Week</Label>
                            <Input
                              id="target-tasks"
                              type="number"
                              min="1"
                              max="50"
                              value={newDomain.targetTasksPerWeek}
                              onChange={(e) =>
                                setNewDomain((prev) => ({
                                  ...prev,
                                  targetTasksPerWeek: Number.parseInt(e.target.value),
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Color</Label>
                            <div className="flex gap-2 mt-2">
                              {domainColors.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => setNewDomain((prev) => ({ ...prev, color: color.value }))}
                                  className={`w-8 h-8 rounded-full ${color.value} ${
                                    newDomain.color === color.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <Button onClick={addDomain} className="w-full">
                            {editingDomain ? "Update Domain" : "Create Domain"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isTaskDialogOpen}
                      onOpenChange={(open) => {
                        setIsTaskDialogOpen(open)
                        if (!open) {
                          setEditingTask(null)
                          setNewTask({
                            title: "",
                            description: "",
                            scheduledDate: "",
                            canConvertToTodo: false,
                            estimatedHours: 1,
                          })
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={selectedDomain === "all"}>
                          <Plus className="h-4 w-4 mr-2" />
                          Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingTask ? "Edit Task" : "Schedule New Task"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input
                              id="task-title"
                              value={newTask.title}
                              onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="What needs to be done?"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-description">Description</Label>
                            <Textarea
                              id="task-description"
                              value={newTask.description}
                              onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Additional details"
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="task-date">Scheduled Date</Label>
                              <Input
                                id="task-date"
                                type="date"
                                value={newTask.scheduledDate}
                                onChange={(e) => setNewTask((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="estimated-hours">Estimated Hours</Label>
                              <Input
                                id="estimated-hours"
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={newTask.estimatedHours}
                                onChange={(e) =>
                                  setNewTask((prev) => ({ ...prev, estimatedHours: Number.parseFloat(e.target.value) }))
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="convert-to-todo"
                              checked={newTask.canConvertToTodo}
                              onChange={(e) => setNewTask((prev) => ({ ...prev, canConvertToTodo: e.target.checked }))}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="convert-to-todo" className="text-sm font-medium">
                              Add to Todo Manager (can be scheduled and managed as regular task)
                            </Label>
                          </div>
                          <Button onClick={addTask} className="w-full">
                            Schedule Task
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Domain Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Domain</Label>
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a domain to view tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map((domain) => {
                        const colorConfig = domainColors.find((c) => c.value === domain.color)
                        return (
                          <SelectItem key={domain.id} value={domain.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                              {domain.name}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain List */}
                {domains.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Domains ({domains.length})
                    </h4>
                    <div className="grid gap-3 max-h-64 overflow-y-auto">
                      {domains.map((domain) => {
                        const colorConfig = domainColors.find((c) => c.value === domain.color)
                        const analytics = getDomainAnalytics(domain.id)

                        return (
                          <div
                            key={domain.id}
                            className={`relative overflow-hidden rounded-2xl border ${colorConfig?.light} ${colorConfig?.border} p-4 hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${domain.color}`} />
                                <div>
                                  <h5 className="font-medium text-sm">{domain.name}</h5>
                                  {domain.description && (
                                    <p className="text-xs text-muted-foreground">{domain.description}</p>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {analytics.totalTasks} tasks
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {analytics.completionRate.toFixed(0)}% complete
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setEditingDomain(domain)
                                    setNewDomain({
                                      name: domain.name,
                                      description: domain.description,
                                      color: domain.color,
                                      targetTasksPerWeek: domain.targetTasksPerWeek || 5,
                                    })
                                    setIsDomainDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setDomains((prev) => prev.filter((d) => d.id !== domain.id))
                                    setDomainTasks((prev) => prev.filter((task) => task.domainId !== domain.id))
                                    if (selectedDomain === domain.id) setSelectedDomain("all")
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Task Display */}
                {selectedDomain === "all" && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-indigo-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No domain selected</p>
                    <p className="text-sm text-muted-foreground">Select a domain to view and manage tasks</p>
                  </div>
                )}

                {selectedDomain !== "all" && selectedDomainData && (
                  <div className="space-y-6">
                    <div className={`rounded-2xl ${selectedDomainColor?.light} ${selectedDomainColor?.border} p-4`}>
                      <h4 className="font-semibold flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${selectedDomainData.color}`} />
                        {selectedDomainData.name} Tasks
                      </h4>
                    </div>

                    {/* Today's Tasks */}
                    {todayTasks.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Today ({todayTasks.length})
                        </h5>
                        <div className="space-y-2">
                          {todayTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              domain={selectedDomainData}
                              onToggle={toggleTaskCompletion}
                              convertTaskToTodo={convertTaskToTodo}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Tasks */}
                    {upcomingTasks.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-600" />
                          Upcoming ({upcomingTasks.length})
                        </h5>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {upcomingTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              domain={selectedDomainData}
                              onToggle={toggleTaskCompletion}
                              convertTaskToTodo={convertTaskToTodo}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-muted-foreground">
                          Completed ({completedTasks.length})
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {completedTasks.slice(0, 5).map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              domain={selectedDomainData}
                              onToggle={toggleTaskCompletion}
                              convertTaskToTodo={convertTaskToTodo}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                          <Target className="h-10 w-10 text-orange-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No tasks in this domain</p>
                        <p className="text-sm text-muted-foreground">Schedule your first task to get started</p>
                      </div>
                    )}
                  </div>
                )}

                {domains.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-indigo-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No domains yet</p>
                    <p className="text-sm text-muted-foreground">Create your first domain to organize tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Domain Intelligence */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-600" />
                    Domain Intelligence
                  </CardTitle>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <Button
                      variant={activeTab === "analytics" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("analytics")}
                      className="text-xs px-3 py-1.5"
                    >
                      Analytics
                    </Button>
                    <Button
                      variant={activeTab === "templates" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("templates")}
                      className="text-xs px-3 py-1.5"
                    >
                      Templates
                    </Button>
                    <Button
                      variant={activeTab === "scheduler" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("scheduler")}
                      className="text-xs px-3 py-1.5"
                    >
                      Automation
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-base">Domain Performance</h3>

                    {selectedDomain !== "all" && selectedDomainData ? (
                      <div className="space-y-6">
                        {(() => {
                          const analytics = getDomainAnalytics(selectedDomain)
                          return (
                            <>
                              {/* Key Metrics */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                                  <div className="relative">
                                    <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
                                    <div className="text-xs opacity-90">Completion Rate</div>
                                  </div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                                  <div className="relative">
                                    <div className="text-2xl font-bold">
                                      {analytics.weekCompleted}/{analytics.weeklyTarget}
                                    </div>
                                    <div className="text-xs opacity-90">Weekly Progress</div>
                                  </div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                                  <div className="relative">
                                    <div className="text-2xl font-bold">{analytics.totalEstimatedHours}h</div>
                                    <div className="text-xs opacity-90">Estimated Hours</div>
                                  </div>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                                  <div className="relative">
                                    <div className="text-2xl font-bold">{analytics.totalTasks}</div>
                                    <div className="text-xs opacity-90">Total Tasks</div>
                                  </div>
                                </div>
                              </div>

                              {/* Weekly Progress */}
                              <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-6">
                                <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Weekly Target Progress
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Tasks Completed This Week</span>
                                    <span className="font-bold">
                                      {analytics.weekCompleted} / {analytics.weeklyTarget}
                                    </span>
                                  </div>
                                  <Progress value={analytics.weeklyProgress} className="h-3" />
                                  <p className="text-xs text-muted-foreground">
                                    {analytics.weeklyProgress >= 100
                                      ? "🎉 Weekly target achieved! Great work!"
                                      : `${analytics.weeklyTarget - analytics.weekCompleted} tasks remaining to reach your weekly goal`}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-6">
                                <h4 className="font-medium text-sm mb-4">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start bg-transparent"
                                    onClick={() => {
                                      const domain = domains.find((d) => d.id === selectedDomain)
                                      const tasks = domainTasks.filter((t) => t.domainId === selectedDomain)
                                      const exportData = {
                                        domain,
                                        tasks,
                                        exportDate: new Date().toISOString(),
                                        analytics,
                                      }
                                      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                                        type: "application/json",
                                      })
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement("a")
                                      a.href = url
                                      a.download = `${domain?.name || "domain"}-export.json`
                                      a.click()
                                      URL.revokeObjectURL(url)
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    Export Data
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start bg-transparent"
                                    onClick={() => {
                                      const tasks = []
                                      const today = new Date()
                                      for (let i = 0; i < 5; i++) {
                                        const scheduleDate = new Date(today)
                                        scheduleDate.setDate(today.getDate() + i)
                                        const task: DomainTask = {
                                          id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                                          domainId: selectedDomain,
                                          title: `${selectedDomainData.name} Task ${i + 1}`,
                                          description: `Auto-generated task for ${selectedDomainData.name}`,
                                          scheduledDate: scheduleDate.toISOString().split("T")[0],
                                          completed: false,
                                          createdAt: new Date().toISOString(),
                                          canConvertToTodo: false,
                                          estimatedHours: 1,
                                        }
                                        tasks.push(task)
                                      }
                                      setDomainTasks((prev) => [...tasks, ...prev])
                                    }}
                                  >
                                    <Zap className="h-3 w-3 mr-2" />
                                    Bulk Schedule
                                  </Button>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center">
                          <BarChart3 className="h-10 w-10 text-cyan-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Select a domain</p>
                        <p className="text-sm text-muted-foreground">Choose a domain to view detailed analytics</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Templates Tab */}
                {activeTab === "templates" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Task Templates</h3>
                      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Template
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create Task Template</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="template-name">Template Name</Label>
                              <Input
                                id="template-name"
                                value={newTemplate.name}
                                onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Code Review, Research Task"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="template-description">Description</Label>
                              <Textarea
                                id="template-description"
                                value={newTemplate.description}
                                onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Template description and instructions"
                                className="mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="template-hours">Estimated Hours</Label>
                                <Input
                                  id="template-hours"
                                  type="number"
                                  min="0.5"
                                  max="24"
                                  step="0.5"
                                  value={newTemplate.estimatedHours}
                                  onChange={(e) =>
                                    setNewTemplate((prev) => ({
                                      ...prev,
                                      estimatedHours: Number.parseFloat(e.target.value),
                                    }))
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="template-category">Category</Label>
                                <Input
                                  id="template-category"
                                  value={newTemplate.category}
                                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, category: e.target.value }))}
                                  placeholder="e.g., Development, Research"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <Button onClick={addTemplate} className="w-full">
                              Create Template
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {taskTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setTaskTemplates((prev) => prev.filter((t) => t.id !== template.id))}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {template.estimatedHours}h
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => createTaskFromTemplate(template)}
                              disabled={selectedDomain === "all"}
                              className="text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Use Template
                            </Button>
                          </div>
                        </div>
                      ))}

                      {taskTemplates.length === 0 && (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center">
                            <Copy className="h-10 w-10 text-cyan-600" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No templates yet</p>
                          <p className="text-sm text-muted-foreground">Create templates for recurring tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Automation Tab */}
                {activeTab === "scheduler" && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-base">Smart Automation</h3>

                    {selectedDomain !== "all" && selectedDomainData ? (
                      <div className="space-y-6">
                        {/* Auto Scheduling */}
                        <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-6">
                          <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Bulk Task Scheduling
                          </h4>
                          <p className="text-xs text-muted-foreground mb-4">
                            Automatically create multiple tasks for the selected domain
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tasks = []
                                const today = new Date()
                                for (let i = 0; i < 3; i++) {
                                  const scheduleDate = new Date(today)
                                  scheduleDate.setDate(today.getDate() + i)
                                  const task: DomainTask = {
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                                    domainId: selectedDomain,
                                    title: `${selectedDomainData.name} Task ${i + 1}`,
                                    description: `Auto-generated task for ${selectedDomainData.name}`,
                                    scheduledDate: scheduleDate.toISOString().split("T")[0],
                                    completed: false,
                                    createdAt: new Date().toISOString(),
                                    canConvertToTodo: false,
                                    estimatedHours: 1,
                                  }
                                  tasks.push(task)
                                }
                                setDomainTasks((prev) => [...tasks, ...prev])
                              }}
                              className="text-xs"
                            >
                              3 Tasks
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tasks = []
                                const today = new Date()
                                for (let i = 0; i < 5; i++) {
                                  const scheduleDate = new Date(today)
                                  scheduleDate.setDate(today.getDate() + i)
                                  const task: DomainTask = {
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                                    domainId: selectedDomain,
                                    title: `${selectedDomainData.name} Task ${i + 1}`,
                                    description: `Auto-generated task for ${selectedDomainData.name}`,
                                    scheduledDate: scheduleDate.toISOString().split("T")[0],
                                    completed: false,
                                    createdAt: new Date().toISOString(),
                                    canConvertToTodo: false,
                                    estimatedHours: 1,
                                  }
                                  tasks.push(task)
                                }
                                setDomainTasks((prev) => [...tasks, ...prev])
                              }}
                              className="text-xs"
                            >
                              5 Tasks
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tasks = []
                                const today = new Date()
                                for (let i = 0; i < 7; i++) {
                                  const scheduleDate = new Date(today)
                                  scheduleDate.setDate(today.getDate() + i)
                                  const task: DomainTask = {
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
                                    domainId: selectedDomain,
                                    title: `${selectedDomainData.name} Task ${i + 1}`,
                                    description: `Auto-generated task for ${selectedDomainData.name}`,
                                    scheduledDate: scheduleDate.toISOString().split("T")[0],
                                    completed: false,
                                    createdAt: new Date().toISOString(),
                                    canConvertToTodo: false,
                                    estimatedHours: 1,
                                  }
                                  tasks.push(task)
                                }
                                setDomainTasks((prev) => [...tasks, ...prev])
                              }}
                              className="text-xs"
                            >
                              Week
                            </Button>
                          </div>
                        </div>

                        {/* Smart Suggestions */}
                        <div className="rounded-2xl border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-6">
                          <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Smart Suggestions
                          </h4>
                          {(() => {
                            const analytics = getDomainAnalytics(selectedDomain)
                            const suggestions = []

                            if (analytics.weeklyProgress < 50) {
                              suggestions.push({
                                text: "You're behind on weekly targets. Consider scheduling smaller, more manageable tasks.",
                                action: "Schedule Quick Tasks",
                                variant: "outline" as const,
                              })
                            }

                            if (analytics.completionRate > 80) {
                              suggestions.push({
                                text: "Excellent completion rate! Consider increasing your weekly targets for more challenge.",
                                action: "Update Target",
                                variant: "default" as const,
                              })
                            }

                            if (analytics.totalTasks === 0) {
                              suggestions.push({
                                text: "No tasks in this domain yet. Start by creating your first task or using a template.",
                                action: "Create Task",
                                variant: "outline" as const,
                              })
                            }

                            if (suggestions.length === 0) {
                              suggestions.push({
                                text: "Everything looks great! Your domain is well-organized and on track.",
                                action: "View Analytics",
                                variant: "outline" as const,
                              })
                            }

                            return (
                              <div className="space-y-3">
                                {suggestions.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start justify-between p-4 rounded-xl bg-muted/50"
                                  >
                                    <p className="text-xs text-muted-foreground flex-1 leading-relaxed">
                                      {suggestion.text}
                                    </p>
                                    <Button variant={suggestion.variant} size="sm" className="text-xs ml-3 shrink-0">
                                      {suggestion.action}
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                          <Zap className="h-10 w-10 text-purple-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Select a domain</p>
                        <p className="text-sm text-muted-foreground">Choose a domain to access automation features</p>
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

function TaskItem({
  task,
  domain,
  onToggle,
  convertTaskToTodo,
}: {
  task: DomainTask
  domain: Domain
  onToggle: (id: string) => void
  convertTaskToTodo: (task: DomainTask) => void
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  const isOverdue = task.scheduledDate < new Date().toISOString().split("T")[0] && !task.completed
  const colorConfig = domainColors.find((c) => c.value === domain.color)

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
        task.completed
          ? "bg-muted/30 opacity-75 border-muted"
          : isOverdue
            ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
            : `${colorConfig?.light} ${colorConfig?.border}`
      } p-4`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-medium leading-tight ${task.completed ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className={`text-sm text-muted-foreground mb-3 ${task.completed ? "line-through" : ""}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs font-medium">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(task.scheduledDate)}
            </Badge>
            {task.estimatedHours && (
              <Badge variant="secondary" className="text-xs font-medium">
                <Clock className="w-3 h-3 mr-1" />
                {task.estimatedHours}h
              </Badge>
            )}
            {task.completedAt && (
              <Badge variant="secondary" className="text-xs font-medium text-emerald-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            {task.canConvertToTodo && (
              <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-300">
                <Target className="w-3 h-3 mr-1" />
                Todo Ready
              </Badge>
            )}
            {task.canConvertToTodo && !task.completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => convertTaskToTodo(task)}
                className="text-xs bg-transparent"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Add to Todos
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
