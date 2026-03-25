"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Persona } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

type Form = { label: string; sortOrder: string }
const EMPTY: Form = { label: "", sortOrder: "" }

export function PersonasTab() {
  const [rows, setRows] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Persona | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(k: keyof Form, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function load() {
    setLoading(true)
    try { setRows(await api.personas.list()) }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(EMPTY); setOpen(true) }
  function openEdit(p: Persona) {
    setEditing(p)
    setForm({ label: p.label, sortOrder: String(p.sortOrder) })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.label.trim()) { toast.error("Label is required"); return }
    setSaving(true)
    try {
      const data = { label: form.label.trim(), sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0 }
      if (editing) { await api.personas.update(editing.id, data); toast.success("Persona updated") }
      else { await api.personas.create(data); toast.success("Persona created") }
      setOpen(false); load()
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this persona?")) return
    try { await api.personas.delete(id); toast.success("Persona deleted"); load() }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed") }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} personas</p>
        <Button size="sm" onClick={openAdd}><Plus className="mr-1.5 h-4 w-4" />Add Persona</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="w-24">Sort Order</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground text-xs w-8">{i + 1}</TableCell>
                <TableCell className="font-medium">{p.label}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{p.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Persona" : "Add Persona"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input placeholder="As a General User" value={form.label} onChange={(e) => set("label", e.target.value)} />
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
