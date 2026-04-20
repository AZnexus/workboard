import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { DailyView } from "@/components/dashboard/DailyView"
import { EntryList } from "@/components/entries/EntryList"
import { TimeLogsPage } from "@/pages/TimeLogsPage"
import { MeetingsPage } from "@/pages/MeetingsPage"
import { ConfigPage } from "@/pages/ConfigPage"
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
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
