"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { Sprint, Story } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Calendar,
  Download,
  PlusCircle,
  Settings,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface Stats {
  totalStories: number
  totalSprints: number
  readyForExport: number
  alreadyExported: number
  currentSprint: Sprint | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [stories, sprints] = await Promise.all([
          api.stories.list(),
          api.sprints.list(),
        ])

        const now = new Date()
        const currentSprint =
          sprints.find((s) => {
            if (!s.startMonth || !s.startDay || !s.startYear || !s.endMonth || !s.endDay || !s.endYear) return false
            const start = new Date(s.startYear, s.startMonth - 1, s.startDay)
            const end = new Date(s.endYear, s.endMonth - 1, s.endDay)
            return now >= start && now <= end
          }) ??
          sprints[sprints.length - 1] ??
          null

        setStats({
          totalStories: stories.length,
          totalSprints: sprints.length,
          readyForExport: stories.filter((s) => s.isSelected && !s.isExported).length,
          alreadyExported: stories.filter((s) => s.isExported).length,
          currentSprint,
        })
        setRecentStories(stories.slice(0, 5))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium">Could not reach the backend</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">
          Make sure the server is running: <code className="bg-muted px-1 rounded">cd server &amp;&amp; npm run dev</code>
        </p>
      </div>
    )
  }

  const summaryCards = [
    { title: "Total Stories",    value: stats!.totalStories,    icon: BookOpen,     description: "Stories in the database",    color: "text-blue-500" },
    { title: "Total Sprints",    value: stats!.totalSprints,    icon: Calendar,     description: "Configured sprints",         color: "text-purple-500" },
    { title: "Ready for Export", value: stats!.readyForExport,  icon: Clock,        description: "Selected, not yet exported", color: "text-amber-500" },
    { title: "Already Exported", value: stats!.alreadyExported, icon: CheckCircle2, description: "Sent to Jira",              color: "text-green-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Jira User Story Manager — Data Governance</p>
      </div>

      {/* Current sprint banner */}
      {stats!.currentSprint && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Sprint</span>
            <p className="font-semibold">
              Sprint {stats!.currentSprint.sprintIndex} — {stats!.currentSprint.epicName}
            </p>
          </div>
          <Badge variant="secondary">ID {stats!.currentSprint.sprintId}</Badge>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(({ title, value, icon: Icon, description, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/stories/new" className={buttonVariants({ variant: "default" })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Story
          </Link>
          <Link href="/export" className={buttonVariants({ variant: "outline" })}>
            <Download className="mr-2 h-4 w-4" />
            Export to Jira
          </Link>
          <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
            <Settings className="mr-2 h-4 w-4" />
            Admin Console
          </Link>
        </div>
      </div>

      {/* Recent stories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Stories</h2>
          <Link href="/stories" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        {recentStories.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No stories yet.</p>
            <Link href="/stories/new" className={cn(buttonVariants({ size: "sm" }), "mt-3 inline-flex")}>
              Create your first story
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border divide-y">
            {recentStories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {story.summary ?? `SP${story.sprintIndex}: ${story.taskAction}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sprint {story.sprintIndex} · {story.taskCategory} · {story.assignee ?? "Unassigned"}
                  </p>
                </div>
                <div className="ml-4 shrink-0">
                  {story.isExported ? (
                    <Badge variant="secondary" className="text-green-600">Exported</Badge>
                  ) : story.isSelected ? (
                    <Badge variant="outline" className="text-amber-600">Selected</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
