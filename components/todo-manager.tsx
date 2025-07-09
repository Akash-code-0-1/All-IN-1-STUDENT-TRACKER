"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, CheckSquare, AlertTriangle, Clock } from "lucide-react"

interface Todo {
  id: string
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  deadline?: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

const categories = ["Development", "Learning", "Meeting", "Bug Fix", "Feature", "Review", "Personal"]
const priorities = [
  {
    value: "low",
    label: "Low",
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    value: "high",
    label: "High",
    color: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
]

// Utility functions for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}`
}

const getTodayString = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

export function TodoManager() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "Development",
    priority: "medium" as const,
    deadline: "",
  })

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("productive-me-todos")
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem("productive-me-todos", JSON.stringify(todos))
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent("todosUpdated"))
  }, [todos])

  const addTodo = () => {
    if (!newTodo.title.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      category: newTodo.category,
      priority: newTodo.priority,
      deadline: newTodo.deadline || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTodos((prev) => [todo, ...prev])
    setNewTodo({ title: "", description: "", category: "Development", priority: "medium", deadline: "" })
    setIsAddDialogOpen(false)
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const updated = {
            ...todo,
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date().toISOString() : undefined,
          }

          // Schedule revisions if completing task
          if (!todo.completed && updated.completed) {
            scheduleRevisions(updated)
          }

          return updated
        }
        return todo
      }),
    )
  }

  const scheduleRevisions = (todo: Todo) => {
    const revisions = localStorage.getItem("productive-me-revisions") || "[]"
    const existingRevisions = JSON.parse(revisions)

    const completedDate = new Date(todo.completedAt!)
    const revisionDates = [3, 6, 12].map((days) => {
      const date = new Date(completedDate)
      date.setDate(date.getDate() + days)
      return date.toISOString().split("T")[0]
    })

    const newRevisions = revisionDates.map((date, index) => ({
      id: `${todo.id}-revision-${index + 1}`,
      originalTaskId: todo.id,
      originalTitle: todo.title,
      revisionNumber: index + 1,
      scheduledDate: date,
      completed: false,
    }))

    localStorage.setItem("productive-me-revisions", JSON.stringify([...existingRevisions, ...newRevisions]))
    // Trigger custom event for revision updates
    window.dispatchEvent(new CustomEvent("revisionsUpdated"))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      description: todo.description || "",
      category: todo.category,
      priority: todo.priority,
      deadline: todo.deadline || "",
    })
  }

  const updateTodo = () => {
    if (!editingTodo || !newTodo.title.trim()) return

    setTodos((prev) => prev.map((todo) => (todo.id === editingTodo.id ? { ...todo, ...newTodo } : todo)))

    setEditingTodo(null)
    setNewTodo({ title: "", description: "", category: "Development", priority: "medium", deadline: "" })
  }

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || todo.category === filterCategory
    const matchesPriority = filterPriority === "all" || todo.priority === filterPriority

    return matchesSearch && matchesCategory && matchesPriority
  })

  const completedTodos = filteredTodos.filter((todo) => todo.completed)
  const pendingTodos = filteredTodos.filter((todo) => !todo.completed)

  return (
    <Card className="h-full shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CheckSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Task Manager</span>
              <p className="text-sm text-muted-foreground font-normal">Organize your development workflow</p>
            </div>
          </CardTitle>
          <Dialog
            open={isAddDialogOpen || !!editingTodo}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) {
                setEditingTodo(null)
                setNewTodo({ title: "", description: "", category: "Development", priority: "medium", deadline: "" })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingTodo ? "Edit Task" : "Create New Task"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add task details..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={newTodo.category}
                      onValueChange={(value) => setNewTodo((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      value={newTodo.priority}
                      onValueChange={(value: any) => setNewTodo((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newTodo.deadline}
                    onChange={(e) => setNewTodo((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <Button
                  onClick={editingTodo ? updateTodo : addTodo}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                >
                  {editingTodo ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background/50"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="flex-1 h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="flex-1 h-10">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      {priority.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border">
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{todos.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Tasks</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{completedTodos.length}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingTodos.length}</div>
            <div className="text-xs text-amber-600 dark:text-amber-500 font-medium">Pending</div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-sm">Pending Tasks ({pendingTodos.length})</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pendingTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} />
            ))}
            {pendingTodos.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm">No pending tasks. Time to create something new.</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-sm">Completed Tasks ({completedTodos.length})</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}) {
  const priority = priorities.find((p) => p.value === todo.priority)!
  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed

  return (
    <div
      className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
        todo.completed
          ? "bg-muted/30 opacity-75 border-muted"
          : isOverdue
            ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            : "bg-card hover:bg-card/80 border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-medium leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(todo)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(todo.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {todo.description && (
            <p className={`text-sm text-muted-foreground mb-3 ${todo.completed ? "line-through" : ""}`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">
              {todo.category}
            </Badge>
            <Badge variant="outline" className={`text-xs font-medium border-current ${priority.textColor}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${priority.color} mr-1`} />
              {priority.label}
            </Badge>
            {todo.deadline && (
              <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs font-medium">
                {isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                {formatDate(todo.deadline)}
              </Badge>
            )}
            {todo.completedAt && (
              <Badge variant="secondary" className="text-xs font-medium text-emerald-600">
                ✓ {formatDateTime(todo.completedAt)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
