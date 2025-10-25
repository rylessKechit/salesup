'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type {
  DashboardData,
  AgentDashboardData,
  ManagerDashboardData,
  DailyEntry,
  PerformanceMetrics,
  Invitation,
  DailyEntryFormData,
  InvitationFormData,
  UseDataResponse,
  UseCreateResponse
} from '@/types'

// Hook pour les données du dashboard
export function useDashboardData(): UseDataResponse<DashboardData> {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const dashboardData: DashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session, status])

  const refresh = async () => {
    if (!session) return
    
    try {
      setError(null)
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData: DashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err)
    }
  }

  return { data, loading, error, refresh }
}

// Hook pour les entrées quotidiennes
export function useDailyEntries(limit = 30): UseDataResponse<DailyEntry[]> {
  const { data: session } = useSession()
  const [data, setData] = useState<DailyEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const fetchEntries = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/daily-entries?limit=${limit}`)
        if (response.ok) {
          const result = await response.json()
          setData(result.entries || [])
        } else {
          throw new Error('Failed to fetch entries')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries')
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [session, limit])

  const refresh = () => window.location.reload()

  return { data, loading, error, refresh }
}

// Hook pour créer une entrée quotidienne
export function useCreateDailyEntry(): UseCreateResponse {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (entryData: DailyEntryFormData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/daily-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create entry')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, create }
}

// Hook pour les métriques de performance
export function usePerformanceMetrics(agentId?: string): UseDataResponse<PerformanceMetrics> & {
  recalculate: () => Promise<PerformanceMetrics | void>
} {
  const { data: session } = useSession()
  const [data, setData] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const url = agentId 
          ? `/api/performance?agentId=${agentId}` 
          : '/api/performance'
        
        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          setData(result.metrics)
        } else {
          throw new Error('Failed to fetch performance metrics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [session, agentId])

  const recalculate = async (): Promise<PerformanceMetrics | void> => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId })
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.metrics)
        return result.metrics
      }
    } catch (err) {
      console.error('Error recalculating metrics:', err)
    }
  }

  const refresh = () => window.location.reload()

  return { data, loading, error, refresh, recalculate }
}

// Hook pour les invitations (managers seulement)
export function useInvitations() {
  const { data: session } = useSession()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session || (session.user as any).role !== 'manager') return

    const fetchInvitations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/invitations')
        if (response.ok) {
          const result = await response.json()
          setInvitations(result.invitations || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [session])

  const sendInvitation = async (inviteData: InvitationFormData) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData)
      })

      if (response.ok) {
        const result = await response.json()
        setInvitations(prev => [result.invitation, ...prev])
        return result
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }
    } catch (err) {
      throw err
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations?id=${invitationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv._id?.toString() !== invitationId))
      }
    } catch (err) {
      console.error('Error cancelling invitation:', err)
    }
  }

  const refresh = () => window.location.reload()

  return { 
    invitations, 
    loading, 
    error, 
    sendInvitation, 
    cancelInvitation,
    refresh
  }
}