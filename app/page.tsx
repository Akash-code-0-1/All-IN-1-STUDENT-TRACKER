"use client"

import { useState, useEffect } from "react"
import { TodoManager } from "@/components/todo-manager"
import { ProgressTracker } from "@/components/progress-tracker"
import { TodayToolkit } from "@/components/today-toolkit"
import { AIInsights } from "@/components/ai-insights"
import { FocusMode } from "@/components/focus-mode"
import { HabitTracker } from "@/components/habit-tracker"
import { QuickCapture } from "@/components/quick-capture"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Sun, Menu, Code2, Terminal, Brain, Eye, Repeat, Zap } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ProductiveMe() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("productive-me-theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to dark theme for developers
      setTheme("dark")
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Apply theme to document
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)
      localStorage.setItem("productive-me-theme", theme)
    }
  }, [theme, mounted])

  // Silence preview Service-Worker errors
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const originalRegister = navigator.serviceWorker.register.bind(navigator.serviceWorker)
      navigator.serviceWorker.register = async (...args) => {
        try {
          return await originalRegister(...args)
        } catch (err) {
          if (String(args[0]).includes("__v0_sw.js")) {
            return {
              update() {},
              unregister() {},
            } as unknown as ServiceWorkerRegistration
          }
          throw err
        }
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Terminal className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  MyTracker
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden group hover:bg-muted/80 transition-all duration-200"
              >
                <div className="relative z-10">
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="p-6">
                    <TodayToolkit />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-background">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-background">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="focus" className="data-[state=active]:bg-background">
              <Eye className="h-4 w-4 mr-2" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-background">
              <Repeat className="h-4 w-4 mr-2" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="capture" className="data-[state=active]:bg-background">
              <Zap className="h-4 w-4 mr-2" />
              Capture
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
              {/* Left Sidebar - Todo Manager */}
              <div className="lg:col-span-4 xl:col-span-3">
                <TodoManager />
              </div>

              {/* Center - Progress Tracker */}
              <div className="lg:col-span-5 xl:col-span-6">
                <ProgressTracker />
              </div>

              {/* Right Sidebar - Today's Toolkit */}
              <div className="hidden md:block lg:col-span-3">
                <TodayToolkit />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AIInsights />
              <QuickCapture />
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FocusMode />
              <div className="space-y-8">
                <TodayToolkit />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="habits" className="space-y-8">
            <HabitTracker />
          </TabsContent>

          <TabsContent value="capture" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuickCapture />
              <AIInsights />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-mono">System Online</span>
            </div>
            <div className="font-mono">Built for productivity • Made by a developer, for developers</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
