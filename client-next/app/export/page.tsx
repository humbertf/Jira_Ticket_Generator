"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api, buildDescription, buildSummary } from "@/lib/api"
import type { Story, Sprint } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileOutput, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<"csv" | "config" | null>(null)
  const [markedExported, setMarkedExported] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [allStories, allSprints] = await Promise.all([api.stories.list(), api.sprints.list()])
      setStories(allStories.filter((s) => s.isSelected))
      setSprints(allSprints)
      setMarkedExported(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function buildPayload() {
    const normalizedStories = stories.map((s) => ({
      ...s,
      // export service uses `sprint` field to look up sprint records
      sprint: s.sprintIndex,
      description: s.jiraDescription || buildDescription(s),
    }))
    return { stories: normalizedStories, sprints }
  }

  async function markAsExported() {
    try {
      await Promise.all(
        stories.map((s) => api.stories.update(s.id, { ...s, isExported: true, isSelected: false }))
      )
      setMarkedExported(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark as exported")
    }
  }

  async function handleDownload(type: "csv" | "config") {
    setDownloading(type)
    try {
      const result = await api.export.generate(buildPayload())
      if (type === "csv") {
        downloadFile(result.csv, result.csvFilename, "text/csv")
      } else {
        downloadFile(result.config, result.cfgFilename, "application/json")
      }
      if (!markedExported) await markAsExported()
      toast.success(type === "csv" ? "CSV downloaded" : "Config file downloaded")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed")
    } finally {
      setDownloading(null)
    }
  }

  const invalidRows = stories.filter((s) => !s.taskAction?.trim() || !s.taskCategory?.trim())

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileOutput className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">Export Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate Jira-compatible CSV and configuration files
          </p>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="font-medium">No stories selected for export</p>
          <p className="text-sm text-muted-foreground">
            Go to Stories, check the stories you want, then click{" "}
            <span className="font-medium">Generate for Jira</span>.
          </p>
        </div>
      ) : (
        <>
          {invalidRows.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  {invalidRows.length} stor{invalidRows.length === 1 ? "y is" : "ies are"} missing
                  required fields
                </p>
                <p className="text-xs mt-0.5 opacity-75">
                  These rows will export with incomplete data.
                </p>
              </div>
            </div>
          )}

          {markedExported && (
            <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>
                {stories.length} stor{stories.length === 1 ? "y" : "ies"} marked as exported.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stories.length}</span>{" "}
            stor{stories.length === 1 ? "y" : "ies"} selected for export
          </p>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Sprint</TableHead>
                  <TableHead className="w-28">Category</TableHead>
                  <TableHead>Summary / Action</TableHead>
                  <TableHead className="w-32">Assignee</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((s) => {
                  const hasIssue = !s.taskAction?.trim() || !s.taskCategory?.trim()
                  return (
                    <TableRow
                      key={s.id}
                      className={hasIssue ? "bg-yellow-50/60 dark:bg-yellow-950/20" : undefined}
                    >
                      <TableCell className="font-mono text-sm">
                        SP{String(s.sprintIndex).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        {s.taskCategory ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {s.taskCategory}
                          </Badge>
                        ) : (
                          <span className="text-xs text-destructive">missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-muted-foreground">
                          {s.summary ?? buildSummary(s)}
                        </div>
                        {s.taskAction ? (
                          <div className="text-sm mt-0.5">{s.taskAction}</div>
                        ) : (
                          <div className="text-xs text-destructive mt-0.5">missing action</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.assignee ?? "—"}
                      </TableCell>
                      <TableCell>
                        {s.isExported || markedExported ? (
                          <Badge variant="outline" className="text-xs">Exported</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => handleDownload("csv")} disabled={!!downloading}>
              {downloading === "csv" ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              Download CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownload("config")}
              disabled={!!downloading}
            >
              {downloading === "config" ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              Download Config File
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
