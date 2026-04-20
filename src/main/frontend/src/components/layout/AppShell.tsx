import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function AppShell() {
  const location = useLocation()
  const isFullWidth = location.pathname === "/"

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className={isFullWidth ? "p-6 h-full" : "mx-auto w-full max-w-5xl p-6 space-y-6"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
