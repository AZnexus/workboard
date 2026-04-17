// ---- Enums ----

export type EntryType = 'TASK' | 'BUG' | 'NOTE' | 'IDEA' | 'MEETING' | 'LEARNING'
export type EntryStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED'

// ---- Core Models ----

export interface Entry {
  id: number
  title: string
  body?: string
  type: EntryType
  status: EntryStatus
  priority: number
  tags: string[]
  dueDate?: string
  parentId?: number
  createdAt: string
  updatedAt: string
  totalMinutes: number
}

export interface CreateEntryRequest {
  title: string
  body?: string
  type: EntryType
  status?: EntryStatus
  priority?: number
  tags?: string[]
  dueDate?: string
  parentId?: number
}

export interface UpdateEntryRequest {
  title?: string
  body?: string
  type?: EntryType
  status?: EntryStatus
  priority?: number
  tags?: string[]
  dueDate?: string | null
  parentId?: number | null
}

export interface TimeLog {
  id: number
  entryId: number
  startTime: string
  endTime?: string
  minutes: number
  note?: string
  createdAt: string
}

export interface CreateTimeLogRequest {
  startTime: string
  endTime?: string
  minutes?: number
  note?: string
}

// ---- Pagination ----

export interface PageMeta {
  page: number
  size: number
  total: number
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
  totalMinutes: number
  completedCount: number
  inProgressCount: number
}

export interface StandupData {
  date: string
  yesterday: Entry[]
  today: Entry[]
  blockers: Entry[]
}

export interface WeeklyData {
  weekStart: string
  weekEnd: string
  entries: Entry[]
  totalMinutes: number
  completedCount: number
  byType: Record<EntryType, number>
  byStatus: Record<EntryStatus, number>
}
