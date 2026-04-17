// ---- Enums ----

export type EntryType = 'TASK' | 'NOTE' | 'MEETING_NOTE' | 'REMINDER'
export type EntryStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

// ---- Core Models ----

export interface Entry {
  id: number
  type: EntryType
  title: string
  body: string | null
  status: EntryStatus
  date: string
  external_ref: string | null
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CreateEntryRequest {
  type: EntryType
  title: string
  body?: string
  date?: string
  tags?: string[]
  externalRef?: string
}

export interface UpdateEntryRequest {
  type?: EntryType
  title?: string
  body?: string
  status?: EntryStatus
  date?: string
  tags?: string[]
  externalRef?: string
  pinned?: boolean
}

export interface TimeLog {
  id: number
  entry_id: number | null
  date: string
  hours: number
  project: string
  description: string | null
  created_at: string
}

export interface CreateTimeLogRequest {
  entryId?: number
  date: string
  hours: number
  project: string
  description?: string
}

// ---- Pagination ----

export interface PageMeta {
  total: number
  page: number
  size: number
  totalPages: number
}

export interface PageResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface DataResponse<T> {
  data: T
}

// ---- Dashboard ----

export interface DailyDashboard {
  date: string
  entries: Entry[]
  pinned: Entry[]
  timeLogs: TimeLog[]
  totalHours: number
}

export interface StandupData {
  yesterday: string
  today: string
  yesterdayDone: Entry[]
  todayPlan: Entry[]
}

export interface WeeklyData {
  week: string
  hoursByProject: Record<string, number>
  totalHours: number
}
