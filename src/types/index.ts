export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'agent' | 'manager'
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface DailyPerformance {
  _id: string
  userId: string
  date: Date
  metrics: {
    contractsCount: number
    totalRevenue: number
    insurancePackages: InsurancePackage[]
    upgradeRate: number
    averageUpgradePrice: number
  }
  calculatedMetrics: {
    insuranceRate: number
    revenuePerContract: number
  }
  performanceScore: number
  createdAt: Date
}

export interface InsurancePackage {
  packageType: 'Basic' | 'Smart' | 'All Inclusive'
  codes: string[]
  count: number
}

export interface Goal {
  _id: string
  type: 'global' | 'individual'
  targetUserId?: string
  title: string
  description: string
  targets: {
    contractsCount?: number
    totalRevenue?: number
    insuranceRate?: number
    upgradeRate?: number
    performanceScore?: number
  }
  timeframe: {
    startDate: Date
    endDate: Date
    period: 'daily' | 'weekly' | 'monthly'
  }
  isActive: boolean
  createdAt: Date
}