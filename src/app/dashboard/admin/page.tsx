'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign,
  Download,
  UserPlus,
  BarChart3,
  Award
} from 'lucide-react'

// Mock manager user
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'manager' as const,
  email: 'sarah.johnson@sixt.com'
}

// Mock team data
const mockTeamData = {
  totalAgents: 12,
  activeToday: 10,
  teamAverage: 82,
  totalRevenue: 28750,
  topPerformer: 'Alex Smith',
  goalAchievement: 85
}

// Mock individual agent data
const mockAgents = [
  { id: 1, name: 'Alex Smith', score: 95, revenue: 3200, contracts: 12, status: 'active' },
  { id: 2, name: 'Maria Garcia', score: 88, revenue: 2800, contracts: 10, status: 'active' },
  { id: 3, name: 'John Doe', score: 85, revenue: 2450, contracts: 8, status: 'active' },
  { id: 4, name: 'Emma Wilson', score: 82, revenue: 2100, contracts: 7, status: 'active' },
  { id: 5, name: 'Mike Brown', score: 78, revenue: 1950, contracts: 6, status: 'inactive' },
]

export default function ManagerDashboard() {
  return (
    <MainLayout user={mockUser}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Team Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor team performance and manage goals across your sales agents.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Agent
            </Button>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Agents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTeamData.totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {mockTeamData.activeToday} active today
              </p>
            </CardContent>
          </Card>

          {/* Team Average */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockTeamData.teamAverage}/100</div>
              <p className="text-xs text-muted-foreground">
                +3 from last week
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{mockTeamData.totalRevenue.toLocaleString('en-US')}</div>
              <p className="text-xs text-muted-foreground">
                Today's total
              </p>
            </CardContent>
          </Card>

          {/* Goal Achievement */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Achievement</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTeamData.goalAchievement}%</div>
              <p className="text-xs text-muted-foreground">
                Monthly target
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Performance Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Agent Performance Today</CardTitle>
              <CardDescription>
                Individual performance scores and key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-500">
                          €{agent.revenue.toLocaleString('en-US')} • {agent.contracts} contracts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{agent.score}</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Insights */}
          <div className="space-y-6">
            {/* Top Performer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-yellow-500" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="font-semibold text-lg">{mockTeamData.topPerformer}</p>
                  <p className="text-sm text-gray-500">Score: 95/100</p>
                  <Badge className="mt-2">This Week's Champion</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Target className="mr-2 h-4 w-4" />
                  Set Team Goals
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Weekly Report
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Trends</CardTitle>
            <CardDescription>
              Weekly performance overview and goal tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Team performance chart will be added here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}