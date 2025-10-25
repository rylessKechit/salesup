import { MongoClient, ObjectId, Db } from 'mongodb'
import { connectToDatabase } from '../mongodb'
import type { 
  User, 
  DailyEntry, 
  PerformanceMetrics, 
  Goal, 
  Invitation,
  Team 
} from './schemas'

const client = new MongoClient(process.env.MONGODB_URI!)

export class MongoDBService {
  private db: Db

  constructor() {
    this.db = client.db()
  }

  async connect() {
    await connectToDatabase()
  }

  // ===================== USERS =====================
  async createUser(userData: Omit<User, '_id' | 'createdAt'>) {
    const user: User = {
      ...userData,
      createdAt: new Date()
    }
    
    const result = await this.db.collection<User>('users').insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  async getUserById(id: string) {
    return await this.db.collection<User>('users').findOne({ 
      _id: new ObjectId(id) 
    })
  }

  async getUserByEmail(email: string) {
    return await this.db.collection<User>('users').findOne({ 
      email: email.toLowerCase() 
    })
  }

  async getAgentsByManager(managerId: string) {
    return await this.db.collection<User>('users').find({
      role: 'agent',
      invitedBy: managerId,
      isActive: true
    }).toArray()
  }

  async updateUser(id: string, updates: Partial<User>) {
    const result = await this.db.collection<User>('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  // ===================== DAILY ENTRIES =====================
  async createDailyEntry(entryData: Omit<DailyEntry, '_id' | 'createdAt'>) {
    // Vérifier si une entrée existe déjà pour cette date
    const existingEntry = await this.db.collection<DailyEntry>('dailyEntries').findOne({
      userId: entryData.userId,
      date: entryData.date
    })

    if (existingEntry) {
      throw new Error('Entry already exists for this date')
    }

    const entry: DailyEntry = {
      ...entryData,
      agentId: entryData.userId, // Pour faciliter les requêtes manager
      createdAt: new Date()
    }
    
    const result = await this.db.collection<DailyEntry>('dailyEntries').insertOne(entry)
    
    // Recalculer les métriques après insertion
    await this.calculatePerformanceMetrics(entryData.userId)
    
    return { ...entry, _id: result.insertedId }
  }

  async updateDailyEntry(id: string, updates: Partial<DailyEntry>) {
    const result = await this.db.collection<DailyEntry>('dailyEntries').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    )
    
    if (result.modifiedCount > 0) {
      // Récupérer l'entrée pour recalculer les métriques
      const entry = await this.db.collection<DailyEntry>('dailyEntries').findOne({
        _id: new ObjectId(id)
      })
      if (entry) {
        await this.calculatePerformanceMetrics(entry.userId)
      }
    }
    
    return result.modifiedCount > 0
  }

  async getDailyEntriesByUser(userId: string, limit = 30) {
    return await this.db.collection<DailyEntry>('dailyEntries')
      .find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray()
  }

  async getDailyEntriesByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.db.collection<DailyEntry>('dailyEntries')
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: -1 })
      .toArray()
  }

  async getDailyEntryByDate(userId: string, date: Date) {
    // Normaliser la date pour chercher uniquement par jour
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await this.db.collection<DailyEntry>('dailyEntries').findOne({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
  }

  // ===================== PERFORMANCE METRICS =====================
  async calculatePerformanceMetrics(userId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const entries = await this.getDailyEntriesByDateRange(userId, thirtyDaysAgo, new Date())
    
    if (entries.length === 0) {
      return null
    }

    // Calculer les métriques
    const totalContracts = entries.reduce((sum, entry) => sum + entry.contractsCount, 0)
    const totalUpgrades = entries.reduce((sum, entry) => sum + entry.upgradesCount, 0)
    const totalRevenue = entries.reduce((sum, entry) => sum + entry.totalUpgradeValue, 0)
    
    const totalInsurances = entries.reduce((sum, entry) => {
      return sum + entry.insurancePackages.reduce((pkgSum, pkg) => pkgSum + pkg.count, 0)
    }, 0)

    const insuranceRate = totalContracts > 0 ? (totalInsurances / totalContracts) * 100 : 0
    const upgradeRate = totalContracts > 0 ? (totalUpgrades / totalContracts) * 100 : 0
    const averageUpgradePrice = totalUpgrades > 0 ? totalRevenue / totalUpgrades : 0
    const revenuePerContract = totalContracts > 0 ? totalRevenue / totalContracts : 0
    
    // Score de consistance basé sur le nombre d'entrées
    const consistencyScore = Math.min((entries.length / 30) * 100, 100)
    
    // Score de performance global
    const performanceScore = Math.round(
      (Math.min(insuranceRate / 80, 1) * 35) +
      (Math.min(upgradeRate / 50, 1) * 25) +
      (Math.min(averageUpgradePrice / 100, 1) * 20) +
      (Math.min(revenuePerContract / 500, 1) * 10) +
      (consistencyScore / 100 * 10)
    )

    const metrics: PerformanceMetrics = {
      userId,
      agentId: userId,
      period: 'monthly',
      startDate: thirtyDaysAgo,
      endDate: new Date(),
      metrics: {
        totalContracts,
        totalUpgrades,
        totalRevenue,
        insuranceRate: Math.round(insuranceRate * 10) / 10,
        upgradeRate: Math.round(upgradeRate * 10) / 10,
        averageUpgradePrice: Math.round(averageUpgradePrice * 100) / 100,
        revenuePerContract: Math.round(revenuePerContract * 100) / 100,
        consistencyScore: Math.round(consistencyScore),
        performanceScore
      },
      calculatedAt: new Date()
    }

    // Sauvegarder ou mettre à jour les métriques
    await this.db.collection<PerformanceMetrics>('performanceMetrics').replaceOne(
      { 
        userId, 
        period: 'monthly' 
      },
      metrics,
      { upsert: true }
    )

    return metrics
  }

  async getPerformanceMetrics(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    return await this.db.collection<PerformanceMetrics>('performanceMetrics').findOne({
      userId,
      period
    })
  }

  // ===================== INVITATIONS =====================
  async createInvitation(invitationData: Omit<Invitation, '_id' | 'createdAt' | 'expiresAt'>) {
    const invitation: Invitation = {
      ...invitationData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    }
    
    const result = await this.db.collection<Invitation>('invitations').insertOne(invitation)
    return { ...invitation, _id: result.insertedId }
  }

  async getInvitationsByManager(managerId: string) {
    return await this.db.collection<Invitation>('invitations')
      .find({ invitedBy: managerId })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async getInvitationByToken(token: string) {
    return await this.db.collection<Invitation>('invitations').findOne({
      token,
      status: 'pending'
    })
  }

  async getInvitationByEmail(email: string, status?: string) {
    const query: any = { email: email.toLowerCase() }
    if (status) {
      query.status = status
    }
    return await this.db.collection<Invitation>('invitations').findOne(query)
  }

  async updateInvitationStatus(id: string, status: Invitation['status'], additionalData?: any) {
    const updates: any = { status }
    
    if (status === 'accepted') {
      updates.acceptedAt = new Date()
      if (additionalData?.userId) {
        updates.userId = additionalData.userId
      }
    }

    const result = await this.db.collection<Invitation>('invitations').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )
    
    return result.modifiedCount > 0
  }

  // ===================== DASHBOARD DATA =====================
  async getAgentDashboardData(userId: string) {
    const [user, recentEntries, performanceMetrics, todayEntry] = await Promise.all([
      this.getUserById(userId),
      this.getDailyEntriesByUser(userId, 7),
      this.getPerformanceMetrics(userId),
      this.getDailyEntryByDate(userId, new Date())
    ])

    return {
      user,
      recentEntries,
      performanceMetrics,
      todayEntry,
      hasFilledToday: !!todayEntry
    }
  }

  async getManagerDashboardData(managerId: string) {
    const [manager, agents, invitations] = await Promise.all([
      this.getUserById(managerId),
      this.getAgentsByManager(managerId),
      this.getInvitationsByManager(managerId)
    ])

    // Récupérer les métriques pour chaque agent
    const agentsWithMetrics = await Promise.all(
      agents.map(async (agent) => {
        const metrics = await this.getPerformanceMetrics(agent._id!.toString())
        return {
          ...agent,
          performanceMetrics: metrics?.metrics || null
        }
      })
    )

    return {
      manager,
      agents: agentsWithMetrics,
      invitations: invitations.filter(inv => inv.status === 'pending'),
      teamStats: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.isActive).length,
        pendingInvitations: invitations.filter(inv => inv.status === 'pending').length
      }
    }
  }
}

// Instance singleton
export const mongoService = new MongoDBService()