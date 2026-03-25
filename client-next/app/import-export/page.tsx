"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Story } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Download, Upload, Loader2, FileJson } from "lucide-react"

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)
}

export default function ImportExportPage() {
  const [exporting, setExporting] = useState<"all" | "selected" | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Partial<Story>[] | null>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport(mode: "all" | "selected") {
    setExporting(mode)
    try {
      const stories = await api.stories.list()
      const toExport = mode === "selected" ? stories.filter((s) => s.isSelected) : stories
      if (toExport.length === 0) {
        toast.error(
          mode === "selected"
            ? "No stories are currently selected"
            : "No stories to export"
        )
        return
      }
      downloadJson(toExport, `stories_${mode}_${timestamp()}.json`)
      toast.success(`Exported ${toExport.length} stor${toExport.length === 1 ? "y" : "ies"}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed")
    } finally {
      setExporting(null)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setImportFile(null); setPreview(null); return }
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) {
          toast.error("Invalid file: expected a JSON array of stories")
          setPreview(null)
          return
        }
        setPreview(parsed)
      } catch {
        toast.error("Invalid JSON file")
        setPreview(null)
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!preview || preview.length === 0) return
    setImporting(true)
    try {
      const result = await api.stories.import(preview)
      toast.success(
        `Imported ${result.count} stor${result.count === 1 ? "y" : "ies"}`
      )
      setPreview(null)
      setImportFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">Import / Export</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Back up stories as JSON or restore from a previous export
          </p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export JSON</TabsTrigger>
          <TabsTrigger value="import">Import JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <div className="space-y-4 max-w-lg">
            <p className="text-sm text-muted-foreground">
              Download stories as a JSON file. Use this to back up your data or migrate between
              environments. The exported file can be re-imported using the Import tab.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => handleExport("all")} disabled={!!exporting}>
                {exporting === "all" ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                Export All Stories
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("selected")}
                disabled={!!exporting}
              >
                {exporting === "selected" ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                Export Selected
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-4 max-w-lg">
            <p className="text-sm text-muted-foreground">
              Import stories from a JSON file previously exported from this app. Stories are
              appended — existing records are not modified or deduplicated.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
            />

            {preview && (
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileJson className="h-4 w-4 text-muted-foreground shrink-0" />
                  {importFile?.name}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{preview.length}</span>{" "}
                  stor{preview.length === 1 ? "y" : "ies"} ready to import
                </p>

                <div className="space-y-1 border-t pt-3">
                  {preview.slice(0, 5).map((s, i) => (
                    <div key={i} className="font-mono text-xs text-muted-foreground">
                      SP{String(s.sprintIndex ?? "??").padStart(2, "0")} ·{" "}
                      {s.taskCategory ?? "?"} · {s.taskAction ?? "—"}
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      …and {preview.length - 5} more
                    </p>
                  )}
                </div>

                <Button size="sm" onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-1.5 h-4 w-4" />
                  )}
                  Import {preview.length} Stor{preview.length === 1 ? "y" : "ies"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
