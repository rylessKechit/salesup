// Types de base
export interface User {
  _id?: string
  firstName: string
  lastName: string
  email: string
  role: 'agent' | 'manager'
  isActive: boolean
  lastLogin?: string
  invitedBy?: string
  createdAt: string
}

export interface DailyEntry {
  _id: string
  userId: string
  agentId: string
  date: string
  contractsCount: number
  upgradesCount: number
  totalUpgradeValue: number
  insurancePackages: InsurancePackage[]
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface InsurancePackage {
  packageType: 'Basic' | 'Smart' | 'All Inclusive'
  count: number
  value: number
}

export interface PerformanceMetricsData {
  totalContracts: number
  totalUpgrades: number
  totalRevenue: number
  insuranceRate: number
  upgradeRate: number
  averageUpgradePrice: number
  revenuePerContract: number
  consistencyScore: number
  performanceScore: number
}

export interface PerformanceMetrics {
  _id?: string
  userId: string
  agentId: string
  period: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate: string
  metrics: PerformanceMetricsData
  calculatedAt: string
}

export interface Invitation {
  _id: string
  email: string
  firstName: string
  lastName: string
  status: 'pending' | 'accepted' | 'cancelled' | 'expired'
  invitedBy: string
  invitedByName: string
  createdAt: string
  expiresAt: string
  acceptedAt?: string
  userId?: string
}

// Types dashboard
export interface AgentDashboardData {
  user: User
  recentEntries: DailyEntry[]
  performanceMetrics: PerformanceMetrics | null
  todayEntry: DailyEntry | null
  hasFilledToday: boolean
}

export interface ManagerDashboardData {
  manager: User
  agents: (User & { performanceMetrics?: PerformanceMetricsData | null })[]
  invitations: Invitation[]
  teamStats: {
    totalAgents: number
    activeAgents: number
    pendingInvitations: number
  }
}

export type DashboardData = 
  | { type: 'agent'; data: AgentDashboardData }
  | { type: 'manager'; data: ManagerDashboardData }

// Types formulaires
export interface DailyEntryFormData {
  date: string
  contractsCount: number
  upgradesCount: number
  totalUpgradeValue: number
  insurancePackages: InsurancePackage[]
  notes?: string
}

export interface InvitationFormData {
  email: string
  firstName: string
  lastName: string
}

// Props composants
export interface PerformanceCardsProps {
  metrics: PerformanceMetricsData
}

export interface RecentEntriesCardProps {
  entries: DailyEntry[]
  onRefresh?: () => void
}

export interface DailyEntryFormProps {
  initialData?: Partial<DailyEntry>
  onSuccess?: () => void
}

export interface InviteAgentProps {
  invitations: Invitation[]
  onInvitationSent: () => void
}

// Constantes
export const INSURANCE_PACKAGES: Record<InsurancePackage['packageType'], string[]> = {
  'Basic': ['LD'],
  'Smart': ['LD', 'BF'], 
  'All Inclusive': ['LD', 'BF', 'TG', 'BC', 'BQ']
}