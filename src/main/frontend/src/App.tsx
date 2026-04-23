import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { DailyView } from "@/components/dashboard/DailyView"
import { EntryList } from "@/components/entries/EntryList"
import { TimeLogsPage } from "@/pages/TimeLogsPage"
import { ActesPage } from "@/pages/ActesPage"
import { ActaViewPage } from "@/pages/ActaViewPage"
import { NotesPage } from "@/pages/NotesPage"
import { TasksPage } from "@/pages/TasksPage"
import { ConfigPage } from "@/pages/ConfigPage"
import { ActaEditorPage } from "@/pages/ActaEditorPage"
import { ThemeProvider } from "@/hooks/useTheme"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DailyView />} />
            <Route path="/entries" element={<EntryList />} />
            <Route path="/timelogs" element={<TimeLogsPage />} />
            <Route path="/actes" element={<ActesPage />} />
            <Route path="/actes/new" element={<ActaEditorPage />} />
            <Route path="/actes/:id" element={<ActaViewPage />} />
            <Route path="/actes/:id/edit" element={<ActaEditorPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Route>
        </Routes>
        <Toaster position="bottom-center" />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
