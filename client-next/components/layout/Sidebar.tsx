"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Download,
  ArrowLeftRight,
  Ticket,
} from "lucide-react"

const nav = [
  { href: "/",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/stories",       label: "Stories",      icon: BookOpen },
  { href: "/export",        label: "Export",       icon: Download },
  { href: "/import-export", label: "Import/Export",icon: ArrowLeftRight },
  { href: "/admin",         label: "Admin",        icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Ticket className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold leading-tight">
          Jira Story<br />Manager
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">Backend: localhost:3001</p>
      </div>
    </aside>
  )
}
