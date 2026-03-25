"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SprintsTab } from "@/components/admin/SprintsTab"
import { PersonasTab } from "@/components/admin/PersonasTab"
import { PrefixesTab } from "@/components/admin/PrefixesTab"
import { AssigneesTab } from "@/components/admin/AssigneesTab"
import { ComponentsTab } from "@/components/admin/ComponentsTab"
import { Settings } from "lucide-react"

const TABS = [
  { value: "sprints",    label: "Sprints",           content: <SprintsTab /> },
  { value: "personas",   label: "Personas",          content: <PersonasTab /> },
  { value: "prefixes",   label: "Work Types",        content: <PrefixesTab /> },
  { value: "assignees",  label: "Assignees",         content: <AssigneesTab /> },
  { value: "components", label: "Components",        content: <ComponentsTab /> },
]

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage reference data used across all stories</p>
        </div>
      </div>

      <Tabs defaultValue="sprints" className="space-y-4">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {t.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
