'use client'

import { useDashboardData } from '@/hooks/useData'
import { MainLayout } from '@/components/layout/MainLayout'
import { DailyEntryForm } from '@/components/forms/DailyEntryForm'
import { PerformanceCards } from '@/components/dashboard/PerformanceCards'
import { RecentEntriesCard } from '@/components/dashboard/RecentEntriesCard'
import { AIInsights } from '@/components/ai/AIInsights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Target, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export default function AgentDashboard() {
  const { data: dashboardData, loading, error, refresh } = useDashboardData()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load dashboard data: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={refresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!dashboardData || dashboardData.type !== 'agent') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Alert>
            <AlertDescription>
              Unable to load agent dashboard data.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  // Maintenant on sait que c'est AgentDashboardData
  const agentData = dashboardData.data
  const { user, recentEntries, performanceMetrics, todayEntry, hasFilledToday } = agentData

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Track your daily performance and reach your goals
            </p>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Today's Entry Status */}
        <Card className={hasFilledToday ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className={`h-5 w-5 ${hasFilledToday ? 'text-green-600' : 'text-orange-600'}`} />
              <CardTitle className={hasFilledToday ? 'text-green-800' : 'text-orange-800'}>
                Today's Entry
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasFilledToday ? (
              <div className="text-green-700">
                ✅ You've already filled your entry for today! 
                <span className="text-sm block mt-1">
                  {todayEntry?.contractsCount || 0} contracts • {todayEntry?.upgradesCount || 0} upgrades
                </span>
              </div>
            ) : (
              <div className="text-orange-700">
                📝 Don't forget to fill your daily entry below
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/dashboard/entry"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sixt-orange-500 focus:ring-offset-2"
            >
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Nouvelle saisie quotidienne
              </span>
            </Link>

            <Link 
              href="/voice-training"
              className="relative block w-full rounded-lg border-2 border-dashed border-sixt-orange-300 p-12 text-center hover:border-sixt-orange-400 focus:outline-none focus:ring-2 focus:ring-sixt-orange-500 focus:ring-offset-2 bg-sixt-orange-50"
            >
              <div className="mx-auto h-12 w-12 text-sixt-orange-600 flex items-center justify-center">
                🎤
              </div>
              <span className="mt-2 block text-sm font-medium text-sixt-orange-900">
                Entraînement vocal IA
              </span>
              <span className="text-xs text-sixt-orange-700">NOUVEAU !</span>
            </Link>

            <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center opacity-50">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Voir mes statistiques
              </span>
              <span className="text-xs text-gray-500">Bientôt disponible</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Daily Entry Form */}
          <div className="lg:col-span-1">
            <DailyEntryForm 
              initialData={todayEntry || undefined}
              onSuccess={refresh}
            />
          </div>

          {/* Right Column - Performance & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Cards */}
            {performanceMetrics?.metrics ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Overview
                </h2>
                <PerformanceCards metrics={performanceMetrics.metrics} />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Your performance metrics will appear here once you start entering daily data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No performance data yet</p>
                    <p className="text-sm text-gray-400">Fill your first daily entry to see metrics</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <AIInsights />

            {/* Recent Entries */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Entries
              </h2>
              <RecentEntriesCard entries={recentEntries} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}