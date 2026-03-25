"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Component } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

type Form = { name: string; description: string; sortOrder: string }
const EMPTY: Form = { name: "", description: "", sortOrder: "" }

export function ComponentsTab() {
  const [rows, setRows] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Component | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(k: keyof Form, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function load() {
    setLoading(true)
    try { setRows(await api.components.list()) }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setOpen(true) }
  function openEdit(c: Component) {
    setEditing(c)
    setForm({ name: c.name, description: c.description ?? "", sortOrder: String(c.sortOrder) })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return }
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
      }
      if (editing) { await api.components.update(editing.id, data); toast.success("Component updated") }
      else { await api.components.create(data); toast.success("Component created") }
      setOpen(false); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this component?")) return
    try { await api.components.delete(id); toast.success("Component deleted"); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed") }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} components</p>
        <Button size="sm" onClick={openAdd}><Plus className="mr-1.5 h-4 w-4" />Add Component</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Sort Order</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.description ?? "—"}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{c.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Component" : "Add Component"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input placeholder="Frontend" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="React/Next.js frontend" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" placeholder="1" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
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
