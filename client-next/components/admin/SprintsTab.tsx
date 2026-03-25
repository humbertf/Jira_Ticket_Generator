"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api, formatSprintDate } from "@/lib/api"
import type { Sprint } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

type Form = {
  sprintIndex: string; sprintId: string; epicName: string; issueType: string
  startMonth: string; startDay: string; startYear: string
  endMonth: string; endDay: string; endYear: string
}

const EMPTY: Form = {
  sprintIndex: "", sprintId: "", epicName: "", issueType: "Story",
  startMonth: "", startDay: "", startYear: "",
  endMonth: "", endDay: "", endYear: "",
}

function toForm(s: Sprint): Form {
  return {
    sprintIndex: String(s.sprintIndex),
    sprintId: String(s.sprintId),
    epicName: s.epicName,
    issueType: s.issueType,
    startMonth: s.startMonth != null ? String(s.startMonth) : "",
    startDay: s.startDay != null ? String(s.startDay) : "",
    startYear: s.startYear != null ? String(s.startYear) : "",
    endMonth: s.endMonth != null ? String(s.endMonth) : "",
    endDay: s.endDay != null ? String(s.endDay) : "",
    endYear: s.endYear != null ? String(s.endYear) : "",
  }
}

export function SprintsTab() {
  const [rows, setRows] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Sprint | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(k: keyof Form, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function load() {
    setLoading(true)
    try { setRows(await api.sprints.list()) }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setOpen(true) }
  function openEdit(s: Sprint) { setEditing(s); setForm(toForm(s)); setOpen(true) }

  async function handleSave() {
    if (!form.sprintIndex || !form.sprintId || !form.epicName) {
      toast.error("Sprint Index, Sprint ID and Epic Name are required"); return
    }
    setSaving(true)
    try {
      const data = {
        sprintIndex: parseInt(form.sprintIndex),
        sprintId: parseInt(form.sprintId),
        epicName: form.epicName,
        issueType: form.issueType || "Story",
        startMonth: form.startMonth ? parseInt(form.startMonth) : null,
        startDay: form.startDay ? parseInt(form.startDay) : null,
        startYear: form.startYear ? parseInt(form.startYear) : null,
        endMonth: form.endMonth ? parseInt(form.endMonth) : null,
        endDay: form.endDay ? parseInt(form.endDay) : null,
        endYear: form.endYear ? parseInt(form.endYear) : null,
      }
      if (editing) { await api.sprints.update(editing.id, data); toast.success("Sprint updated") }
      else { await api.sprints.create(data); toast.success("Sprint created") }
      setOpen(false); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this sprint? Stories linked to it will be affected.")) return
    try { await api.sprints.delete(id); toast.success("Sprint deleted"); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed") }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} sprints configured</p>
        <Button size="sm" onClick={openAdd}><Plus className="mr-1.5 h-4 w-4" />Add Sprint</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead>Sprint ID</TableHead>
              <TableHead>Epic Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-medium">SP{String(s.sprintIndex).padStart(2, "0")}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{s.sprintId}</TableCell>
                <TableCell className="font-medium">{s.epicName}</TableCell>
                <TableCell>{formatSprintDate(s, "start")}</TableCell>
                <TableCell>{formatSprintDate(s, "end")}</TableCell>
                <TableCell>{s.issueType}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sprint" : "Add Sprint"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sprint Index *</Label>
                <Input type="number" placeholder="25" value={form.sprintIndex} onChange={(e) => set("sprintIndex", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sprint ID *</Label>
                <Input type="number" placeholder="213732" value={form.sprintId} onChange={(e) => set("sprintId", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Epic Name *</Label>
                <Input placeholder="DAG-1887" value={form.epicName} onChange={(e) => set("epicName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Issue Type</Label>
                <Input placeholder="Story" value={form.issueType} onChange={(e) => set("issueType", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Start Date <span className="text-muted-foreground text-xs">(Month / Day / Year — leave blank if unknown)</span></Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="Month 1–12" min={1} max={12} value={form.startMonth} onChange={(e) => set("startMonth", e.target.value)} />
                <Input type="number" placeholder="Day 1–31" min={1} max={31} value={form.startDay} onChange={(e) => set("startDay", e.target.value)} />
                <Input type="number" placeholder="Year" value={form.startYear} onChange={(e) => set("startYear", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>End Date <span className="text-muted-foreground text-xs">(Month / Day / Year — leave blank if unknown)</span></Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="Month 1–12" min={1} max={12} value={form.endMonth} onChange={(e) => set("endMonth", e.target.value)} />
                <Input type="number" placeholder="Day 1–31" min={1} max={31} value={form.endDay} onChange={(e) => set("endDay", e.target.value)} />
                <Input type="number" placeholder="Year" value={form.endYear} onChange={(e) => set("endYear", e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
