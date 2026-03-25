"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Assignee } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

type Form = {
  username: string; displayName: string; email: string
  jiraAccountId: string; isActive: boolean
}
const EMPTY: Form = { username: "", displayName: "", email: "", jiraAccountId: "", isActive: true }

export function AssigneesTab() {
  const [rows, setRows] = useState<Assignee[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Assignee | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })) }

  async function load() {
    setLoading(true)
    try { setRows(await api.assignees.list()) }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setOpen(true) }
  function openEdit(a: Assignee) {
    setEditing(a)
    setForm({
      username: a.username, displayName: a.displayName ?? "",
      email: a.email ?? "", jiraAccountId: a.jiraAccountId ?? "",
      isActive: a.isActive,
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.username.trim()) { toast.error("Username is required"); return }
    setSaving(true)
    try {
      const data = {
        username: form.username.trim(),
        displayName: form.displayName.trim() || null,
        email: form.email.trim() || null,
        jiraAccountId: form.jiraAccountId.trim() || null,
        isActive: form.isActive,
      }
      if (editing) { await api.assignees.update(editing.id, data); toast.success("Assignee updated") }
      else { await api.assignees.create(data); toast.success("Assignee created") }
      setOpen(false); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this assignee?")) return
    try { await api.assignees.delete(id); toast.success("Assignee deleted"); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed") }
  }

  async function toggleActive(a: Assignee) {
    try {
      await api.assignees.update(a.id, { ...a, isActive: !a.isActive })
      toast.success(a.isActive ? "Assignee deactivated" : "Assignee activated")
      load()
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed") }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.filter((a) => a.isActive).length} active / {rows.length} total
        </p>
        <Button size="sm" onClick={openAdd}><Plus className="mr-1.5 h-4 w-4" />Add Assignee</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Jira Account ID</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id} className={!a.isActive ? "opacity-50" : undefined}>
                <TableCell className="font-mono font-medium">{a.username}</TableCell>
                <TableCell>{a.displayName ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{a.email ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{a.jiraAccountId ?? "—"}</TableCell>
                <TableCell>
                  <button onClick={() => toggleActive(a)} className="cursor-pointer">
                    <Badge variant={a.isActive ? "default" : "outline"}>
                      {a.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Assignee" : "Add Assignee"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Username *</Label>
                <Input placeholder="humbertf" value={form.username} onChange={(e) => set("username", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input placeholder="Humberto F." value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="user@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Jira Account ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="5f8a1b2c..." value={form.jiraAccountId} onChange={(e) => set("jiraAccountId", e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(c) => set("isActive", c === true)}
              />
              <Label>Active</Label>
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
