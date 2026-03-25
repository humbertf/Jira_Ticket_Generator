"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { api, buildSummary, buildDescription } from "@/lib/api"
import type { Sprint, Persona, Prefix, Assignee, Story } from "@/lib/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, LayoutTemplate, AlignLeft } from "lucide-react"

type Form = {
  sprintIndex: string
  taskCategory: string
  taskType: string
  taskAction: string
  persona: string
  goal: string
  benefit: string
  acceptanceCriteria: string
  jiraDescription: string
  assignee: string
  useStructuredMode: boolean
}

const EMPTY: Form = {
  sprintIndex: "",
  taskCategory: "",
  taskType: "",
  taskAction: "",
  persona: "",
  goal: "",
  benefit: "",
  acceptanceCriteria: "",
  jiraDescription: "",
  assignee: "",
  useStructuredMode: true,
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

interface Props {
  storyId?: number
}

function toPartial(f: Form): Partial<Story> {
  return {
    sprintIndex: f.sprintIndex ? parseInt(f.sprintIndex) : undefined,
    taskCategory: f.taskCategory || undefined,
    taskType: f.taskType || undefined,
    taskAction: f.taskAction || undefined,
    persona: f.persona || undefined,
    goal: f.goal || undefined,
    benefit: f.benefit || undefined,
    acceptanceCriteria: f.acceptanceCriteria || undefined,
  }
}

export function StoryEditor({ storyId }: Props) {
  const router = useRouter()
  const isNew = !storyId

  const [sprints, setSprints] = useState<Sprint[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [prefixes, setPrefixes] = useState<Prefix[]>([])
  const [assignees, setAssignees] = useState<Assignee[]>([])

  const [form, setForm] = useState<Form>(EMPTY)
  const [refLoading, setRefLoading] = useState(true)
  const [storyLoading, setStoryLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  useEffect(() => {
    async function loadRef() {
      try {
        const [sp, pe, pr, as] = await Promise.all([
          api.sprints.list(),
          api.personas.list(),
          api.prefixes.list(),
          api.assignees.list(),
        ])
        setSprints(sp)
        setPersonas(pe)
        setPrefixes(pr)
        setAssignees(as.filter((a) => a.isActive))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load reference data")
      } finally {
        setRefLoading(false)
      }
    }
    loadRef()
  }, [])

  useEffect(() => {
    if (!storyId) return
    async function loadStory() {
      try {
        const s = await api.stories.get(storyId!)
        setForm({
          sprintIndex: String(s.sprintIndex),
          taskCategory: s.taskCategory,
          taskType: s.taskType ?? "",
          taskAction: s.taskAction,
          persona: s.persona ?? "",
          goal: s.goal ?? "",
          benefit: s.benefit ?? "",
          acceptanceCriteria: s.acceptanceCriteria ?? "",
          jiraDescription: s.jiraDescription ?? "",
          assignee: s.assignee ?? "",
          useStructuredMode: s.useStructuredMode,
        })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load story")
      } finally {
        setStoryLoading(false)
      }
    }
    loadStory()
  }, [storyId])

  function toggleMode() {
    if (form.useStructuredMode) {
      const generated = buildDescription(toPartial(form))
      setForm((f) => ({
        ...f,
        useStructuredMode: false,
        jiraDescription: f.jiraDescription || generated,
      }))
    } else {
      setForm((f) => ({ ...f, useStructuredMode: true }))
    }
  }

  const previewSummary = buildSummary(toPartial(form))
  const previewDescription = buildDescription(toPartial(form))

  async function handleSave() {
    if (!form.sprintIndex) { toast.error("Sprint is required"); return }
    if (!form.taskCategory) { toast.error("Category is required"); return }
    if (!form.taskAction.trim()) { toast.error("Task Action is required"); return }

    setSaving(true)
    try {
      const data: Partial<Story> = {
        sprintIndex: parseInt(form.sprintIndex),
        taskCategory: form.taskCategory,
        taskType: form.taskType || null,
        taskAction: form.taskAction.trim(),
        persona: form.persona || null,
        goal: form.goal || null,
        benefit: form.benefit || null,
        acceptanceCriteria: form.acceptanceCriteria || null,
        jiraDescription: form.jiraDescription || null,
        assignee: form.assignee || null,
        useStructuredMode: form.useStructuredMode,
      }
      if (isNew) {
        await api.stories.create(data)
        toast.success("Story created")
      } else {
        await api.stories.update(storyId!, data)
        toast.success("Story updated")
      }
      router.push("/stories")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (refLoading || storyLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/stories" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-semibold">{isNew ? "New Story" : "Edit Story"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            {form.useStructuredMode ? (
              <><LayoutTemplate className="h-4 w-4" /> Structured</>
            ) : (
              <><AlignLeft className="h-4 w-4 text-primary" /> Raw</>
            )}
          </button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            <Save className="mr-1.5 h-4 w-4" />
            {isNew ? "Create" : "Update"}
          </Button>
        </div>
      </div>

      {form.useStructuredMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sprint *</Label>
                <select
                  value={form.sprintIndex}
                  onChange={(e) => set("sprintIndex", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select sprint…</option>
                  {sprints.map((sp) => (
                    <option key={sp.id} value={String(sp.sprintIndex)}>
                      SP{String(sp.sprintIndex).padStart(2, "0")} — {sp.epicName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Assignee</Label>
                <select
                  value={form.assignee}
                  onChange={(e) => set("assignee", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.username}>
                      {a.displayName ?? a.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select
                  value={form.taskCategory}
                  onChange={(e) => set("taskCategory", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select category…</option>
                  {prefixes.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}{p.description ? ` — ${p.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Task Type{" "}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <select
                  value={form.taskType}
                  onChange={(e) => set("taskType", e.target.value)}
                  className={selectClass}
                >
                  <option value="">None</option>
                  {prefixes.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}{p.description ? ` — ${p.description}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Task Action *</Label>
              <Input
                placeholder="Implement user authentication flow"
                value={form.taskAction}
                onChange={(e) => set("taskAction", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Persona</Label>
              <select
                value={form.persona}
                onChange={(e) => set("persona", e.target.value)}
                className={selectClass}
              >
                <option value="">Select persona…</option>
                {personas.map((p) => (
                  <option key={p.id} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Goal{" "}
                <span className="text-xs text-muted-foreground">I want…</span>
              </Label>
              <Input
                placeholder="log in with my email and password"
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Benefit{" "}
                <span className="text-xs text-muted-foreground">so that…</span>
              </Label>
              <Input
                placeholder="I can access my personalized dashboard"
                value={form.benefit}
                onChange={(e) => set("benefit", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Acceptance Criteria{" "}
                <span className="text-xs text-muted-foreground">one per line</span>
              </Label>
              <Textarea
                placeholder={
                  "User can log in with valid credentials\nInvalid credentials show an error\nSession persists across page refreshes"
                }
                value={form.acceptanceCriteria}
                onChange={(e) => set("acceptanceCriteria", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:sticky lg:top-6 rounded-lg border bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live Preview
            </p>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Summary</p>
              <p className="font-mono text-sm bg-background rounded border px-3 py-2 break-all">
                {previewSummary || <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Jira Description</p>
              <div className="bg-background rounded border px-3 py-2 text-sm font-mono whitespace-pre-wrap min-h-[120px]">
                {previewDescription || (
                  <span className="text-muted-foreground">
                    Fill in persona, goal, benefit and acceptance criteria to see preview…
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Raw mode */
        <div className="space-y-4 max-w-2xl">
          <div className="rounded-lg border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Summary:{" "}
              <span className="font-mono text-foreground">{previewSummary || "—"}</span>
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>
              Jira Description{" "}
              <span className="text-xs text-muted-foreground">(Jira wiki markup)</span>
            </Label>
            <Textarea
              value={form.jiraDescription}
              onChange={(e) => set("jiraDescription", e.target.value)}
              rows={18}
              className="font-mono text-sm"
              placeholder={
                "*As a* user, *I want* to..., *so that* ...\n\n*Acceptance Criteria:*\n* Criteria 1\n* Criteria 2"
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
