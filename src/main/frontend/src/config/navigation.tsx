import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Calendar, CheckSquare, Clock, FileText, List, Settings, Users } from "lucide-react"

import { ActaEditorPage } from "@/pages/ActaEditorPage"
import { ActaViewPage } from "@/pages/ActaViewPage"
import { ActesPage } from "@/pages/ActesPage"
import { ConfigPage } from "@/pages/ConfigPage"
import { NotesPage } from "@/pages/NotesPage"
import { TasksPage } from "@/pages/TasksPage"
import { TimeLogsPage } from "@/pages/TimeLogsPage"
import { DailyView } from "@/components/dashboard/DailyView"
import { EntryList } from "@/components/entries/EntryList"

type AppRouteHandle = {
  fullWidth?: boolean
}

export interface AppRouteDefinition {
  path: string
  element: ReactNode
  handle?: AppRouteHandle
}

export interface SidebarNavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { to: "/", label: "El meu dia", icon: Calendar },
  { to: "/timelogs", label: "Hores", icon: Clock },
  { to: "/tasks", label: "Tasques", icon: CheckSquare },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/actes", label: "Actes", icon: Users },
  { to: "/entries", label: "Registre", icon: List },
]

export const SIDEBAR_SETTINGS_ITEM: SidebarNavItem = {
  to: "/config",
  label: "Configuració",
  icon: Settings,
}

export const APP_ROUTES: AppRouteDefinition[] = [
  { path: "/", element: <DailyView />, handle: { fullWidth: true } },
  { path: "/entries", element: <EntryList /> },
  { path: "/timelogs", element: <TimeLogsPage />, handle: { fullWidth: true } },
  { path: "/actes", element: <ActesPage /> },
  { path: "/actes/new", element: <ActaEditorPage />, handle: { fullWidth: true } },
  { path: "/actes/:id", element: <ActaViewPage /> },
  { path: "/actes/:id/edit", element: <ActaEditorPage />, handle: { fullWidth: true } },
  { path: "/notes", element: <NotesPage /> },
  { path: "/tasks", element: <TasksPage /> },
  { path: "/config", element: <ConfigPage /> },
]

function normalizePathname(pathname: string) {
  return pathname.replace(/\/$/, "") || "/"
}

export function isFullWidthRoute(pathname: string) {
  const normalizedPathname = normalizePathname(pathname)

  return APP_ROUTES.some((route) => route.handle?.fullWidth && normalizePathname(route.path) === normalizedPathname)
}
