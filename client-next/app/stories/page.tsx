"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api, buildSummary } from "@/lib/api"
import type { Story, Sprint, Assignee, Prefix } from "@/lib/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2, FileOutput, Pencil, BookOpen, ChevronUp, ChevronDown } from "lucide-react"

type SortKey = "sprintIndex" | "taskCategory" | "taskAction" | "assignee"
type SortDir = "asc" | "desc"

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export default function StoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [prefixes, setPrefixes] = useState<Prefix[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [filterSprint, setFilterSprint] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterAssignee, setFilterAssignee] = useState("")
  const [search, setSearch] = useState("")

  const [sortKey, setSortKey] = useState<SortKey>("sprintIndex")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  async function load() {
    setLoading(true)
    try {
      const [s, sp, a, p] = await Promise.all([
        api.stories.list(),
        api.sprints.list(),
        api.assignees.list(),
        api.prefixes.list(),
      ])
      setStories(s)
      setSprints(sp)
      setAssignees(a)
      setPrefixes(p)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let rows = stories
    if (filterSprint) rows = rows.filter((s) => String(s.sprintIndex) === filterSprint)
    if (filterCategory) rows = rows.filter((s) => s.taskCategory === filterCategory)
    if (filterAssignee) rows = rows.filter((s) => s.assignee === filterAssignee)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter((s) =>
        s.taskAction.toLowerCase().includes(q) ||
        (s.summary ?? "").toLowerCase().includes(q) ||
        s.taskCategory.toLowerCase().includes(q)
      )
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? ""
      const bv = b[sortKey] ?? ""
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [stories, filterSprint, filterCategory, filterAssignee, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (filtered.length > 0 && selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((s) => s.id)))
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} stor${selected.size === 1 ? "y" : "ies"}?`)) return
    setDeleting(true)
    try {
      await Promise.all([...selected].map((id) => api.stories.delete(id)))
      toast.success(`Deleted ${selected.size} stor${selected.size === 1 ? "y" : "ies"}`)
      setSelected(new Set())
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  async function handleGenerateForJira() {
    setGenerating(true)
    try {
      await Promise.all(
        stories.map((s) => api.stories.update(s.id, { ...s, isSelected: selected.has(s.id) }))
      )
      router.push("/export")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to prepare export")
      setGenerating(false)
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null
    return sortDir === "asc"
      ? <ChevronUp className="inline h-3 w-3 ml-1" />
      : <ChevronDown className="inline h-3 w-3 ml-1" />
  }

  function sprintLabel(idx: number) {
    return `SP${String(idx).padStart(2, "0")}`
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Stories</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{stories.length} total</p>
          </div>
        </div>
        <Link href="/stories/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="mr-1.5 h-4 w-4" />New Story
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />
        <select
          value={filterSprint}
          onChange={(e) => setFilterSprint(e.target.value)}
          className={selectClass}
        >
          <option value="">All Sprints</option>
          {sprints.map((sp) => (
            <option key={sp.id} value={String(sp.sprintIndex)}>
              SP{String(sp.sprintIndex).padStart(2, "0")} — {sp.epicName}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {prefixes.map((p) => (
            <option key={p.id} value={p.code}>
              {p.code}{p.description ? ` — ${p.description}` : ""}
            </option>
          ))}
        </select>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className={selectClass}
        >
          <option value="">All Assignees</option>
          {assignees.filter((a) => a.isActive).map((a) => (
            <option key={a.id} value={a.username}>{a.displayName ?? a.username}</option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-2.5 border">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Deselect All
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
            {deleting
              ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              : <Trash2 className="mr-1.5 h-4 w-4" />}
            Delete
          </Button>
          <Button size="sm" onClick={handleGenerateForJira} disabled={generating}>
            {generating
              ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              : <FileOutput className="mr-1.5 h-4 w-4" />}
            Generate for Jira
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer w-20 select-none" onClick={() => toggleSort("sprintIndex")}>
                Sprint<SortIcon k="sprintIndex" />
              </TableHead>
              <TableHead className="cursor-pointer w-28 select-none" onClick={() => toggleSort("taskCategory")}>
                Category<SortIcon k="taskCategory" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("taskAction")}>
                Summary / Action<SortIcon k="taskAction" />
              </TableHead>
              <TableHead className="cursor-pointer w-32 select-none" onClick={() => toggleSort("assignee")}>
                Assignee<SortIcon k="assignee" />
              </TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  {stories.length === 0
                    ? "No stories yet. Create one to get started."
                    : "No stories match the current filters."}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((s) => (
              <TableRow key={s.id} className={selected.has(s.id) ? "bg-muted/40" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggleOne(s.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">{sprintLabel(s.sprintIndex)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">{s.taskCategory}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs text-muted-foreground">
                    {s.summary ?? buildSummary(s)}
                  </div>
                  <div className="text-sm mt-0.5">{s.taskAction}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.assignee ?? "—"}</TableCell>
                <TableCell>
                  {s.isExported ? (
                    <Badge variant="outline" className="text-xs">Exported</Badge>
                  ) : s.isSelected ? (
                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/stories/${s.id}`}
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
