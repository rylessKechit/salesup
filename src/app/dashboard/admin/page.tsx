'use client'

import { useDashboardData } from '@/hooks/useData'
import { MainLayout } from '@/components/layout/MainLayout'
import { InviteAgent } from '@/components/admin/InviteAgent'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Mail, 
  User,
  Calendar
} from 'lucide-react'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export default function ManagerDashboard() {
  const { data: dashboardData, loading, error, refresh } = useDashboardData()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your team dashboard...</p>
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

  if (!dashboardData || dashboardData.type !== 'manager') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Alert>
            <AlertDescription>
              Unable to load manager dashboard data.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  // Maintenant on sait que c'est ManagerDashboardData
  const managerData = dashboardData.data
  const { manager, agents, invitations, teamStats } = managerData

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Team Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {manager.firstName}! Manage your team and track performance
            </p>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.activeAgents} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.pendingInvitations}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.length > 0 
                  ? Math.round(
                      agents
                        .filter((a: any) => a.performanceMetrics)
                        .reduce((sum: any, a: any) => sum + (a.performanceMetrics?.performanceScore || 0), 0) / 
                      Math.max(1, agents.filter((a: any) => a.performanceMetrics).length)
                    )
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Average score
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Team Management */}
          <div className="xl:col-span-2 space-y-6">
            {/* Agents Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>
                  View and track your team's individual performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No agents in your team yet</p>
                    <p className="text-sm text-gray-400">Start by inviting your first agent</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Performance Score</TableHead>
                          <TableHead>Insurance Rate</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent: any) => (
                          <TableRow key={agent._id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {agent.firstName} {agent.lastName}
                                  </span>
                                  <div className="text-sm text-gray-500">
                                    {agent.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {agent.performanceMetrics ? (
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {agent.performanceMetrics.performanceScore}%
                                  </span>
                                  <Badge 
                                    variant={
                                      agent.performanceMetrics.performanceScore >= 80 ? 'default' :
                                      agent.performanceMetrics.performanceScore >= 60 ? 'secondary' :
                                      'destructive'
                                    }
                                  >
                                    {agent.performanceMetrics.performanceScore >= 80 ? 'Excellent' :
                                     agent.performanceMetrics.performanceScore >= 60 ? 'Good' : 'Needs Improvement'}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-gray-400">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {agent.performanceMetrics ? (
                                <span>{agent.performanceMetrics.insuranceRate.toFixed(1)}%</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {agent.performanceMetrics ? (
                                <span>{formatCurrency(agent.performanceMetrics.totalRevenue)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {agent.lastLogin 
                                  ? new Date(agent.lastLogin).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invite Panel */}
          <div className="xl:col-span-1">
            <InviteAgent 
              invitations={invitations}
              onInvitationSent={refresh}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}