"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus, Lightbulb, Target, Clock, Trash2 } from "lucide-react"

interface QuickNote {
  id: string
  content: string
  type: "idea" | "task" | "reminder"
  createdAt: string
  processed: boolean
}

const noteTypes = [
  { value: "idea", label: "Idea", icon: Lightbulb, color: "bg-yellow-500" },
  { value: "task", label: "Task", icon: Target, color: "bg-blue-500" },
  { value: "reminder", label: "Reminder", icon: Clock, color: "bg-purple-500" },
]

export function QuickCapture() {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [selectedType, setSelectedType] = useState<"idea" | "task" | "reminder">("idea")

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    localStorage.setItem("productive-me-quick-notes", JSON.stringify(notes))
  }, [notes])

  const loadNotes = () => {
    const savedNotes = localStorage.getItem("productive-me-quick-notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }

  const addNote = () => {
    if (!newNote.trim()) return

    const note: QuickNote = {
      id: Date.now().toString(),
      content: newNote,
      type: selectedType,
      createdAt: new Date().toISOString(),
      processed: false,
    }

    setNotes((prev) => [note, ...prev])
    setNewNote("")
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  const convertToTask = (note: QuickNote) => {
    // Get existing todos
    const savedTodos = localStorage.getItem("productive-me-todos")
    const todos = savedTodos ? JSON.parse(savedTodos) : []

    // Create new todo from note
    const newTodo = {
      id: Date.now().toString(),
      title: note.content,
      description: `Converted from quick capture on ${new Date(note.createdAt).toLocaleDateString()}`,
      category: "Personal",
      priority: "medium",
      completed: false,
      createdAt: new Date().toISOString(),
    }

    // Save updated todos
    localStorage.setItem("productive-me-todos", JSON.stringify([newTodo, ...todos]))

    // Mark note as processed
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, processed: true } : n)))

    // Trigger todos update event
    window.dispatchEvent(new CustomEvent("todosUpdated"))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addNote()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const unprocessedNotes = notes.filter((note) => !note.processed)

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <span className="text-lg font-semibold">Quick Capture</span>
            <p className="text-sm text-muted-foreground font-normal">Capture thoughts instantly</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {noteTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value as any)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-3 w-3" />
                  {type.label}
                </Button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Capture a quick ${selectedType}...`}
              className="flex-1"
            />
            <Button onClick={addNote} disabled={!newNote.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {unprocessedNotes.map((note) => {
            const noteType = noteTypes.find((t) => t.value === note.type)!
            const IconComponent = noteType.icon

            return (
              <div
                key={note.id}
                className="p-4 rounded-xl border bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${noteType.color}/10 border ${noteType.color}/20`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2">{note.content}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {noteType.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatTime(note.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {note.type === "task" || note.type === "reminder" ? (
                      <Button variant="ghost" size="sm" onClick={() => convertToTask(note)} className="text-xs">
                        → Task
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {unprocessedNotes.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No quick notes</p>
              <p className="text-sm">Capture your thoughts as they come</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {noteTypes.map((type) => {
            const count = unprocessedNotes.filter((note) => note.type === type.value).length
            return (
              <div key={type.value} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{type.label}s</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
