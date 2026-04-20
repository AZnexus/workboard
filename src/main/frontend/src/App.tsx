import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { DailyView } from "@/components/dashboard/DailyView"
import { EntryList } from "@/components/entries/EntryList"
import { TimeLogsPage } from "@/pages/TimeLogsPage"
import { ProjectsPage } from "@/pages/ProjectsPage"
import { ExportView } from "@/components/export/ExportView"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DailyView />} />
          <Route path="/entries" element={<EntryList />} />
          <Route path="/timelogs" element={<TimeLogsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/export" element={<ExportView />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
