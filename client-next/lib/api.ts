import type { Sprint, Persona, Prefix, Assignee, Component, Story } from "./types"

const BASE = "/api"

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Sprints ───────────────────────────────────────────────────────────────────
export const api = {
  sprints: {
    list: () => req<Sprint[]>("/admin/sprints"),
    create: (data: Partial<Sprint>) => req<Sprint>("/admin/sprints", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Sprint>) => req<Sprint>(`/admin/sprints/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/admin/sprints/${id}`, { method: "DELETE" }),
  },

  personas: {
    list: () => req<Persona[]>("/admin/personas"),
    create: (data: Partial<Persona>) => req<Persona>("/admin/personas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Persona>) => req<Persona>(`/admin/personas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/admin/personas/${id}`, { method: "DELETE" }),
  },

  prefixes: {
    list: () => req<Prefix[]>("/admin/prefixes"),
    create: (data: Partial<Prefix>) => req<Prefix>("/admin/prefixes", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Prefix>) => req<Prefix>(`/admin/prefixes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/admin/prefixes/${id}`, { method: "DELETE" }),
  },

  assignees: {
    list: () => req<Assignee[]>("/admin/assignees"),
    create: (data: Partial<Assignee>) => req<Assignee>("/admin/assignees", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Assignee>) => req<Assignee>(`/admin/assignees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/admin/assignees/${id}`, { method: "DELETE" }),
  },

  components: {
    list: () => req<Component[]>("/admin/components"),
    create: (data: Partial<Component>) => req<Component>("/admin/components", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Component>) => req<Component>(`/admin/components/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/admin/components/${id}`, { method: "DELETE" }),
  },

  stories: {
    list: () => req<Story[]>("/stories"),
    get: (id: number) => req<Story>(`/stories/${id}`),
    create: (data: Partial<Story>) => req<Story>("/stories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Story>) => req<Story>(`/stories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/stories/${id}`, { method: "DELETE" }),
    import: (stories: Partial<Story>[]) =>
      req<{ count: number; created: Story[] }>("/stories/import", { method: "POST", body: JSON.stringify({ stories }) }),
  },

  export: {
    generate: (payload: { stories: Partial<Story>[]; sprints: Sprint[] }) =>
      req<{ csv: string; config: string; pptx: string; csvFilename: string; cfgFilename: string; pptxFilename: string; rowCount: number }>(
        "/export",
        { method: "POST", body: JSON.stringify(payload) }
      ),
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function buildSummary(story: Partial<Story>): string {
  const sprint = String(story.sprintIndex ?? "").padStart(2, "0")
  const cat = (story.taskCategory ?? "").toUpperCase()
  const type = story.taskType?.trim() ? `_${story.taskType.toUpperCase()}` : ""
  return `SP${sprint}:${cat}${type}_${story.taskAction ?? ""}`
}

export function buildDescription(story: Partial<Story>): string {
  const lines: string[] = []
  if (story.persona || story.goal || story.benefit) {
    const persona = story.persona ?? "[persona]"
    const goal = story.goal ?? "[goal]"
    const benefit = story.benefit ?? "[benefit]"
    lines.push(`*As a* ${persona}, *I want* ${goal}, *so that* ${benefit}.`)
  }
  if (story.acceptanceCriteria?.trim()) {
    lines.push("")
    lines.push("*Acceptance Criteria:*")
    story.acceptanceCriteria.split("\n").filter(Boolean).forEach((c) => lines.push(`* ${c.trim()}`))
  }
  return lines.join("\n")
}

export function formatSprintDate(sprint: Sprint, type: "start" | "end"): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const m = type === "start" ? sprint.startMonth : sprint.endMonth
  const d = type === "start" ? sprint.startDay : sprint.endDay
  const y = type === "start" ? sprint.startYear : sprint.endYear
  if (!m || !d || !y) return "—"
  return `${months[m - 1]} ${d}, ${y}`
}
