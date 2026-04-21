import { createContext, useContext, useState, useCallback } from "react"
import type { EntryType } from "@/types"

interface GlobalCreateState {
  dialogOpen: boolean
  dialogType: EntryType
  openCreate: (type: EntryType) => void
  closeCreate: () => void
}

const GlobalCreateContext = createContext<GlobalCreateState | null>(null)

export function GlobalCreateProvider({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<EntryType>("TASK")

  const openCreate = useCallback((type: EntryType) => {
    setDialogType(type)
    setDialogOpen(true)
  }, [])

  const closeCreate = useCallback(() => {
    setDialogOpen(false)
  }, [])

  return (
    <GlobalCreateContext.Provider value={{ dialogOpen, dialogType, openCreate, closeCreate }}>
      {children}
    </GlobalCreateContext.Provider>
  )
}

export function useGlobalCreate() {
  const ctx = useContext(GlobalCreateContext)
  if (!ctx) throw new Error("useGlobalCreate must be used within GlobalCreateProvider")
  return ctx
}
