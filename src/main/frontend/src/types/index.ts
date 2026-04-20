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
  priority: number | null
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
  priority?: number
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
  priority?: number
}

export interface TimeLog {
  id: number
  entry_id: number | null
  date: string
  hours: number
  project: string
  description: string | null
  task_code: string | null
  created_at: string
}

export interface CreateTimeLogRequest {
  entryId?: number
  date: string
  hours: number
  project: string
  description?: string
  taskCode?: string
}

export interface UpdateTimeLogRequest {
  entryId?: number
  date?: string
  hours?: number
  project?: string
  description?: string
  taskCode?: string
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
  time_logs: TimeLog[]
  total_hours: number
  yesterday_done: Entry[]
  backlog: Entry[]
  reminders: Entry[]
}

export interface StandupData {
  yesterday: string
  today: string
  yesterday_done: Entry[]
  today_plan: Entry[]
}

export interface WeeklyData {
  week: string
  hours_by_project: Record<string, number>
  total_hours: number
}

export interface Project {
  id: number
  name: string
  description: string | null
  active: boolean
  created_at: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  active?: boolean
}
