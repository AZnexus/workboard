import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { GlobalCreateProvider, useGlobalCreate } from "@/hooks/useGlobalCreate"
import { EntryForm } from "@/components/entries/EntryForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

function GlobalCreateDialog() {
  const { dialogOpen, dialogType, closeCreate } = useGlobalCreate()

  const title = dialogType === "TASK" ? "Nova Tasca" : "Nova Nota"

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeCreate() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {dialogType === "TASK"
            ? "Formulari per crear una nova tasca."
            : "Formulari per crear una nova nota."}
        </DialogDescription>
        <EntryForm
          initialType={dialogType}
          fixedType
          onSuccess={closeCreate}
        />
      </DialogContent>
    </Dialog>
  )
}

export function AppShell() {
  const location = useLocation()
  const isActaEditor = location.pathname === "/actes/new" || /^\/actes\/[^/]+\/edit$/.test(location.pathname)
  const isFullWidth = location.pathname === "/" || location.pathname === "/timelogs" || isActaEditor

  return (
    <GlobalCreateProvider>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className={isFullWidth ? "w-full h-full min-h-0 p-6" : "mx-auto w-full max-w-[1600px] p-6 space-y-6"}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <GlobalCreateDialog />
    </GlobalCreateProvider>
  )
}
