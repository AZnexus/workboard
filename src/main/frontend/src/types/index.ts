// ---- Enums ----

export type EntryType = 'TASK' | 'NOTE' | 'MEETING_NOTE' | 'REMINDER'
export type EntryStatus = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'DONE' | 'CANCELLED'
export type ImprovementStatus =
  | 'NOVA'
  | 'EN_VALORACIO'
  | 'VALORADA'
  | 'ENVIADA_A_CLIENT'
  | 'APROVADA'
  | 'EN_DESENVOLUPAMENT'
  | 'VALIDANT'
  | 'PENDENT_DE_REVISIO'
  | 'FINALITZADA'
  | 'PENDENT_D_INTEGRAR'
  | 'INTEGRADA'
  | 'BLOQUEJADA'
  | 'CANCEL_LADA'

export type ValuationStatus =
  | 'NO_COMENCADA'
  | 'EN_CURS'
  | 'PER_REVISAR'
  | 'PENDENT_DE_CANVIS'
  | 'REVISADA'
  | 'ENVIADA'
  | 'TANCADA'
  | 'BLOQUEJADA'
  | 'CANCEL_LADA'

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
}

export interface Version {
  id: number
  name: string
  color?: string
  active: boolean
  created_at: string
}

export interface CreateVersionRequest {
  name: string
  color?: string
}

export interface UpdateVersionRequest {
  name?: string
  color?: string
  active?: boolean
}

export interface CreateTagRequest {
  name: string
  color?: string
}

export interface UpdateTagRequest {
  name?: string
  color?: string
}

// ---- Core Models ----

export interface Entry {
  id: number
  type: EntryType
  title: string
  body: string | null
  status: EntryStatus
  date: string
  due_date: string | null
  scheduled_today: boolean
  external_ref: string | null
  pinned: boolean
  priority: number | null
  version: Version | null
  linked_improvement?: LinkedImprovementSummary | null
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface LinkedImprovementSummary {
  id: number
  title: string
}

export interface ImprovementNote {
  context: string
  risk_dependency: string
  observations: string
}

export interface ImprovementValuationSummary {
  id: number
  status: ValuationStatus
  completion_percentage: number
  analysis_hours: number | null
  total_estimated_hours: number | null
}

export interface ImprovementValuation {
  id: number
  improvement_id: number
  derived_title: string
  redmine_child_ref: string
  due_date: string | null
  status: ValuationStatus
  completion_percentage: number
  priority: number | null
  version: Version | null
  tags: Tag[]
  textile_body: string | null
  structured_content_json: string | null
  analysis_hours: number | null
  total_estimated_hours: number | null
  created_at: string
  updated_at: string
}

export interface Improvement {
  id: number
  title: string
  requirements: string | null
  redmine_parent_ref: string | null
  priority: number | null
  due_date: string | null
  jira_ref: string | null
  version: Version | null
  tags: Tag[]
  sold_hours: number | null
  status: ImprovementStatus
  completion_percentage: number
  note: ImprovementNote
  valuation_summary: ImprovementValuationSummary | null
  created_at: string
  updated_at: string
}

export interface CreateImprovementRequest {
  title: string
  requirements?: string | null
  redmineParentRef?: string | null
  priority?: number | null
  dueDate?: string | null
  jiraRef?: string | null
  versionId?: number | null
  tagIds?: number[]
  soldHours?: number | null
  status?: ImprovementStatus
  completionPercentage?: number
  note: {
    context: string
    riskDependency: string
    observations: string
  }
}

export interface UpdateImprovementRequest {
  title?: string
  requirements?: string | null
  redmineParentRef?: string | null
  priority?: number | null
  dueDate?: string | null
  jiraRef?: string | null
  versionId?: number | null
  tagIds?: number[]
  soldHours?: number | null
  status?: ImprovementStatus
  completionPercentage?: number
  note?: {
    context: string
    riskDependency: string
    observations: string
  }
}

export interface CreateValuationRequest {
  redmineChildRef: string
  dueDate: string
  priority?: number | null
  textileBody?: string | null
  structuredContentJson?: string | null
  analysisHours?: number | null
  totalEstimatedHours?: number | null
}

export interface UpdateValuationRequest {
  status?: ValuationStatus
  completionPercentage?: number
  priority?: number | null
  textileBody?: string | null
  structuredContentJson?: string | null
  analysisHours?: number | null
  totalEstimatedHours?: number | null
}

export interface CreateEntryRequest {
  type: EntryType
  title: string
  body?: string
  date?: string
  dueDate?: string | null
  scheduledToday?: boolean
  tagIds?: number[]
  externalRef?: string
  priority?: number
  versionId?: number | null
}

export interface UpdateEntryRequest {
  type?: EntryType
  title?: string
  body?: string
  status?: EntryStatus
  date?: string
  dueDate?: string | null
  scheduledToday?: boolean
  tagIds?: number[]
  externalRef?: string
  pinned?: boolean
  priority?: number
  versionId?: number | null
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
  color: string
  active: boolean
  created_at: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  color?: string
  active?: boolean
}
