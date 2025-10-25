import { ObjectId } from 'mongodb'

// Types TypeScript pour les documents MongoDB
export interface User {
  _id?: ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'agent' | 'manager'
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
  invitedBy?: string
  needsPasswordSetup?: boolean
  notificationPreferences?: {
    dailyReminders: boolean
    weeklyReports: boolean
    goalAlerts: boolean
  }
}

export interface DailyEntry {
  _id?: ObjectId
  userId: string
  agentId: string
  date: Date
  contractsCount: number
  upgradesCount: number
  totalUpgradeValue: number
  insurancePackages: Array<{
    packageType: 'Basic' | 'Smart' | 'All Inclusive'
    count: number
    value: number
  }>
  notes?: string
  createdAt: Date
  updatedAt?: Date
}

export interface PerformanceMetrics {
  _id?: ObjectId
  userId: string
  agentId: string
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  metrics: {
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
  calculatedAt: Date
}

export interface Goal {
  _id?: ObjectId
  userId: string
  agentId: string
  type: 'contracts' | 'revenue' | 'insurance_rate' | 'upgrade_rate'
  target: number
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
}

export interface Invitation {
  _id?: ObjectId
  email: string
  firstName: string
  lastName: string
  status: 'pending' | 'accepted' | 'cancelled' | 'expired'
  invitedBy: string
  invitedByName: string
  createdAt: Date
  expiresAt: Date
  acceptedAt?: Date
  userId?: ObjectId
}

export interface Team {
  _id?: ObjectId
  managerId: string
  agentIds: string[]
  name: string
  description?: string
  createdAt: Date
  updatedAt?: Date
}

// Fonctions utilitaires pour la validation
export function validateDailyEntry(entry: Partial<DailyEntry>): string[] {
  const errors: string[] = []
  
  if (!entry.userId) errors.push('User ID is required')
  if (!entry.date) errors.push('Date is required')
  if (typeof entry.contractsCount !== 'number' || entry.contractsCount < 0) {
    errors.push('Contracts count must be a positive number')
  }
  if (typeof entry.upgradesCount !== 'number' || entry.upgradesCount < 0) {
    errors.push('Upgrades count must be a positive number')
  }
  if (typeof entry.totalUpgradeValue !== 'number' || entry.totalUpgradeValue < 0) {
    errors.push('Total upgrade value must be a positive number')
  }
  if (!entry.insurancePackages || !Array.isArray(entry.insurancePackages)) {
    errors.push('Insurance packages must be an array')
  }
  
  return errors
}

export function validateUser(user: Partial<User>): string[] {
  const errors: string[] = []
  
  if (!user.firstName || user.firstName.length < 2) {
    errors.push('First name must be at least 2 characters')
  }
  if (!user.lastName || user.lastName.length < 2) {
    errors.push('Last name must be at least 2 characters')
  }
  if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Valid email is required')
  }
  if (!user.role || !['agent', 'manager'].includes(user.role)) {
    errors.push('Role must be either agent or manager')
  }
  
  return errors
}

// Index configurations pour MongoDB
export const MONGODB_INDEXES = {
  users: [
    { email: 1 }, // Index unique sur email
    { role: 1, isActive: 1 }, // Index composé pour les requêtes par rôle
  ],
  dailyEntries: [
    { userId: 1, date: -1 }, // Index composé pour récupérer les entrées par utilisateur
    { agentId: 1, date: -1 }, // Index pour les managers qui consultent leurs agents
    { date: -1 }, // Index pour les requêtes par date
  ],
  performanceMetrics: [
    { userId: 1, period: 1, startDate: -1 }, // Index pour les métriques par utilisateur
    { agentId: 1, period: 1, startDate: -1 }, // Index pour les managers
  ],
  invitations: [
    { email: 1, status: 1 }, // Index pour vérifier les invitations
    { invitedBy: 1, createdAt: -1 }, // Index pour les managers
  ],
  goals: [
    { userId: 1, isActive: 1 }, // Index pour les objectifs actifs
    { agentId: 1, period: 1, isActive: 1 }, // Index pour les managers
  ]
}