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
import { Plus, Edit, Trash2, Calendar, FolderOpen, Target } from "lucide-react"

interface Domain {
    id: string
    name: string
    description: string
    color: string
    createdAt: string
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
}

const domainColors = [
    {
        name: "Blue",
        value: "bg-blue-500",
        light: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-800",
    },
    {
        name: "Green",
        value: "bg-green-500",
        light: "bg-green-50 dark:bg-green-950/20",
        border: "border-green-200 dark:border-green-800",
    },
    {
        name: "Purple",
        value: "bg-purple-500",
        light: "bg-purple-50 dark:bg-purple-950/20",
        border: "border-purple-200 dark:border-purple-800",
    },
    {
        name: "Orange",
        value: "bg-orange-500",
        light: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-800",
    },
    {
        name: "Pink",
        value: "bg-pink-500",
        light: "bg-pink-50 dark:bg-pink-950/20",
        border: "border-pink-200 dark:border-pink-800",
    },
    {
        name: "Cyan",
        value: "bg-cyan-500",
        light: "bg-cyan-50 dark:bg-cyan-950/20",
        border: "border-cyan-200 dark:border-cyan-800",
    },
]

export function DomainScheduler() {
    const [domains, setDomains] = useState<Domain[]>([])
    const [domainTasks, setDomainTasks] = useState<DomainTask[]>([])
    const [selectedDomain, setSelectedDomain] = useState<string>("all")

    // Dialog states
    const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false)
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
    const [editingTask, setEditingTask] = useState<DomainTask | null>(null)

    // Form states
    const [newDomain, setNewDomain] = useState({
        name: "",
        description: "",
        color: "bg-blue-500",
    })

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        scheduledDate: "",
        canConvertToTodo: false,
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

    const loadData = () => {
        const savedDomains = localStorage.getItem("productive-me-domains")
        if (savedDomains) {
            setDomains(JSON.parse(savedDomains))
        }

        const savedTasks = localStorage.getItem("productive-me-domain-tasks")
        if (savedTasks) {
            setDomainTasks(JSON.parse(savedTasks))
        }
    }

    const addDomain = () => {
        if (!newDomain.name.trim()) return

        const domain: Domain = {
            id: Date.now().toString(),
            name: newDomain.name,
            description: newDomain.description,
            color: newDomain.color,
            createdAt: new Date().toISOString(),
        }

        setDomains((prev) => [...prev, domain])
        setNewDomain({ name: "", description: "", color: "bg-blue-500" })
        setIsDomainDialogOpen(false)
    }

    const updateDomain = () => {
        if (!editingDomain || !newDomain.name.trim()) return

        setDomains((prev) => prev.map((domain) => (domain.id === editingDomain.id ? { ...domain, ...newDomain } : domain)))

        setEditingDomain(null)
        setNewDomain({ name: "", description: "", color: "bg-blue-500" })
        setIsDomainDialogOpen(false)
    }

    const deleteDomain = (domainId: string) => {
        setDomains((prev) => prev.filter((domain) => domain.id !== domainId))
        setDomainTasks((prev) => prev.filter((task) => task.domainId !== domainId))
        if (selectedDomain === domainId) {
            setSelectedDomain("all")
        }
    }

    const editDomain = (domain: Domain) => {
        setEditingDomain(domain)
        setNewDomain({
            name: domain.name,
            description: domain.description,
            color: domain.color,
        })
        setIsDomainDialogOpen(true)
    }

    const addTask = () => {
        if (!newTask.title.trim() || selectedDomain === "all" || !newTask.scheduledDate) return

        const task: DomainTask = {
            id: Date.now().toString(),
            domainId: selectedDomain,
            title: newTask.title,
            description: newTask.description,
            scheduledDate: newTask.scheduledDate,
            completed: false,
            createdAt: new Date().toISOString(),
            canConvertToTodo: newTask.canConvertToTodo,
        }

        setDomainTasks((prev) => [task, ...prev])

        // If user wants to convert to todo, add it to the todo system after a short delay
        if (newTask.canConvertToTodo) {
            setTimeout(() => {
                convertTaskToTodo(task)
            }, 100)
        }

        setNewTask({ title: "", description: "", scheduledDate: "", canConvertToTodo: false })
        setIsTaskDialogOpen(false)
    }

    const updateTask = () => {
        if (!editingTask || !newTask.title.trim()) return

        const updatedTask = {
            ...editingTask,
            title: newTask.title,
            description: newTask.description,
            scheduledDate: newTask.scheduledDate,
            canConvertToTodo: newTask.canConvertToTodo,
        }

        setDomainTasks((prev) => prev.map((task) => (task.id === editingTask.id ? updatedTask : task)))

        // If user enabled convert to todo and it wasn't enabled before
        if (newTask.canConvertToTodo && !editingTask.canConvertToTodo) {
            setTimeout(() => {
                convertTaskToTodo(updatedTask)
            }, 100)
        }

        setEditingTask(null)
        setNewTask({ title: "", description: "", scheduledDate: "", canConvertToTodo: false })
        setIsTaskDialogOpen(false)
    }

    const deleteTask = (taskId: string) => {
        setDomainTasks((prev) => prev.filter((task) => task.id !== taskId))
    }

    const editTask = (task: DomainTask) => {
        setEditingTask(task)
        setNewTask({
            title: task.title,
            description: task.description,
            scheduledDate: task.scheduledDate,
            canConvertToTodo: task.canConvertToTodo || false,
        })
        setIsTaskDialogOpen(true)
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

    const getTodayString = () => {
        return new Date().toISOString().split("T")[0]
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${months[date.getMonth()]} ${date.getDate()}`
    }

    const selectedDomainData = domains.find((d) => d.id === selectedDomain)
    const selectedDomainColor = selectedDomainData ? domainColors.find((c) => c.value === selectedDomainData.color) : null
    const filteredTasks =
        selectedDomain === "all" ? domainTasks : domainTasks.filter((task) => task.domainId === selectedDomain)

    const todayTasks = filteredTasks.filter((task) => task.scheduledDate === getTodayString())
    const upcomingTasks = filteredTasks.filter((task) => task.scheduledDate > getTodayString())
    const completedTasks = filteredTasks.filter((task) => task.completed)

    const convertTaskToTodo = (task: DomainTask) => {
        const domain = domains.find((d) => d.id === task.domainId)

        // Get existing todos
        const savedTodos = localStorage.getItem("productive-me-todos")
        const todos = savedTodos ? JSON.parse(savedTodos) : []

        // Create new todo from domain task with unique ID
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

        // Add to existing todos array
        const updatedTodos = [newTodo, ...todos]

        // Save updated todos
        localStorage.setItem("productive-me-todos", JSON.stringify(updatedTodos))

        // Trigger todos update event
        window.dispatchEvent(new CustomEvent("todosUpdated"))

        // Show confirmation
        alert(`Task "${task.title}" has been added to Todo Manager!`)
    }

    const convertAllDomainTasksToTodos = (domainId: string) => {
        const tasksToConvert = domainTasks.filter(
            (task) => task.domainId === domainId && task.canConvertToTodo && !task.completed,
        )

        tasksToConvert.forEach((task) => {
            convertTaskToTodo(task)
        })

        if (tasksToConvert.length > 0) {
            alert(`Converted ${tasksToConvert.length} tasks to Todo Manager`)
        }
    }

    return (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <FolderOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold">Domain Scheduler</span>
                            <p className="text-sm text-muted-foreground font-normal">Organize tasks by domain</p>
                        </div>
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog
                            open={isDomainDialogOpen}
                            onOpenChange={(open) => {
                                setIsDomainDialogOpen(open)
                                if (!open) {
                                    setEditingDomain(null)
                                    setNewDomain({ name: "", description: "", color: "bg-blue-500" })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Domain
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
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
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="domain-description">Description</Label>
                                        <Textarea
                                            id="domain-description"
                                            value={newDomain.description}
                                            onChange={(e) => setNewDomain((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of this domain"
                                        />
                                    </div>
                                    <div>
                                        <Label>Color</Label>
                                        <div className="flex gap-2 mt-2">
                                            {domainColors.map((color) => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setNewDomain((prev) => ({ ...prev, color: color.value }))}
                                                    className={`w-8 h-8 rounded-full ${color.value} ${newDomain.color === color.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={editingDomain ? updateDomain : addDomain} className="w-full">
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
                                    setNewTask({ title: "", description: "", scheduledDate: "", canConvertToTodo: false })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={!selectedDomain}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
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
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="task-description">Description</Label>
                                        <Textarea
                                            id="task-description"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="Additional details"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="task-date">Scheduled Date</Label>
                                        <Input
                                            id="task-date"
                                            type="date"
                                            value={newTask.scheduledDate}
                                            onChange={(e) => setNewTask((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                                        />
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
                                    <Button onClick={editingTask ? updateTask : addTask} className="w-full">
                                        {editingTask ? "Update Task" : "Schedule Task"}
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
                    <Label>Select Domain</Label>
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger>
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

                {/* Domain Management */}
                {domains.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Domains ({domains.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {domains.map((domain) => {
                                const colorConfig = domainColors.find((c) => c.value === domain.color)
                                const domainTaskCount = domainTasks.filter((t) => t.domainId === domain.id).length
                                const completedCount = domainTasks.filter((t) => t.domainId === domain.id && t.completed).length

                                return (
                                    <div
                                        key={domain.id}
                                        className={`p-4 rounded-xl border ${colorConfig?.light} ${colorConfig?.border} hover:shadow-md transition-all duration-200`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full ${domain.color}`} />
                                                <div>
                                                    <h5 className="font-medium">{domain.name}</h5>
                                                    {domain.description && <p className="text-sm text-muted-foreground">{domain.description}</p>}
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {domainTaskCount} tasks
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {completedCount} completed
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => convertAllDomainTasksToTodos(domain.id)}
                                                    className="text-xs"
                                                    disabled={
                                                        domainTasks.filter((t) => t.domainId === domain.id && t.canConvertToTodo && !t.completed)
                                                            .length === 0
                                                    }
                                                >
                                                    Convert All
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => editDomain(domain)} className="h-8 w-8">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteDomain(domain.id)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
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

                {/* Tasks Display */}
                {selectedDomain === "all" && (
                    <div className="text-center text-muted-foreground py-12">
                        <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No domain selected</p>
                        <p className="text-sm">Select a domain to view tasks</p>
                    </div>
                )}

                {selectedDomain !== "all" && selectedDomainData && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${selectedDomainColor?.light} ${selectedDomainColor?.border}`}>
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
                                            onEdit={editTask}
                                            onDelete={deleteTask}
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
                                            onEdit={editTask}
                                            onDelete={deleteTask}
                                            convertTaskToTodo={convertTaskToTodo}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="font-semibold text-sm text-muted-foreground">Completed ({completedTasks.length})</h5>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {completedTasks.slice(0, 5).map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            domain={selectedDomainData}
                                            onToggle={toggleTaskCompletion}
                                            onEdit={editTask}
                                            onDelete={deleteTask}
                                            convertTaskToTodo={convertTaskToTodo}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredTasks.length === 0 && (
                            <div className="text-center text-muted-foreground py-12">
                                <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="font-medium">No tasks in this domain</p>
                                <p className="text-sm">Schedule your first task to get started</p>
                            </div>
                        )}
                    </div>
                )}

                {domains.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No domains yet</p>
                        <p className="text-sm">Create your first domain to organize tasks</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function TaskItem({
    task,
    domain,
    onToggle,
    onEdit,
    onDelete,
    convertTaskToTodo,
}: {
    task: DomainTask
    domain: Domain
    onToggle: (id: string) => void
    onEdit: (task: DomainTask) => void
    onDelete: (id: string) => void
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
            className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${task.completed
                    ? "bg-muted/30 opacity-75 border-muted"
                    : isOverdue
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : `${colorConfig?.light} ${colorConfig?.border}`
                }`}
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
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => onDelete(task.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {task.description && (
                        <p className={`text-sm text-muted-foreground mb-3 ${task.completed ? "line-through" : ""}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2">
                        <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs font-medium">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(task.scheduledDate)}
                        </Badge>
                        {task.completedAt && (
                            <Badge variant="secondary" className="text-xs font-medium text-emerald-600">
                                ✓ Completed
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
                                → Add to Todos
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
