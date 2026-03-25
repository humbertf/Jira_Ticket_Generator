export interface Sprint {
  id: number
  sprintIndex: number
  sprintId: number
  epicName: string
  startMonth: number | null
  startDay: number | null
  startYear: number | null
  endMonth: number | null
  endDay: number | null
  endYear: number | null
  issueType: string
  createdAt: string
  updatedAt: string
}

export interface Persona {
  id: number
  label: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Prefix {
  id: number
  code: string
  description: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Assignee {
  id: number
  username: string
  displayName: string | null
  email: string | null
  jiraAccountId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Component {
  id: number
  name: string
  description: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Story {
  id: number
  sprintIndex: number
  taskCategory: string
  taskType: string | null
  taskAction: string
  persona: string | null
  goal: string | null
  benefit: string | null
  acceptanceCriteria: string | null
  jiraDescription: string | null
  assignee: string | null
  summary: string | null
  headline: string | null
  isSelected: boolean
  isExported: boolean
  useStructuredMode: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalStories: number
  totalSprints: number
  readyForExport: number
  alreadyExported: number
}
