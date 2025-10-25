'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  FileText,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react'

// Mock user data - will be replaced with real authentication
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'agent' as const,
  email: 'john.doe@sixt.com'
}

// Mock performance data
const mockPerformance = {
  todayScore: 85,
  weeklyAverage: 78,
  monthlyGoal: 90,
  todayRevenue: 2450,
  contractsToday: 8,
  insuranceRate: 75,
  upgradeRate: 45
}

export default function AgentDashboard() {
  const hasEnteredToday = false // Mock - will be calculated from real data

  return (
    <MainLayout user={mockUser}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {mockUser.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Track your performance and get AI-powered insights to boost your sales.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>

        {/* Daily Entry Alert */}
        {!hasEnteredToday && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="flex items-center p-4">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  You haven't logged your performance for today yet
                </p>
                <p className="text-sm text-orange-600">
                  Enter your daily metrics to get personalized AI feedback
                </p>
              </div>
              <Button className="ml-4">
                Enter Today's Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockPerformance.todayScore}/100</div>
              <p className="text-xs text-muted-foreground">
                +7 from yesterday
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{mockPerformance.todayRevenue.toLocaleString('en-US')}</div>
              <p className="text-xs text-muted-foreground">
                {mockPerformance.contractsToday} contracts
              </p>
            </CardContent>
          </Card>

          {/* Insurance Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPerformance.insuranceRate}%</div>
              <p className="text-xs text-muted-foreground">
                Above team average
              </p>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPerformance.weeklyAverage}/{mockPerformance.monthlyGoal}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(mockPerformance.weeklyAverage / mockPerformance.monthlyGoal) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Feedback Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🤖</span>
                AI Performance Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your recent performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Key Improvements</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Focus on Smart insurance packages - your conversion rate is 15% below average</li>
                  <li>• Try mentioning winter travel protection during cold weather</li>
                  <li>• Your upgrade rate peaks between 2-4 PM - schedule premium customers then</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">📢 Sales Script</h4>
                <p className="text-sm text-green-800">
                  "I see you're traveling during winter season. Our Smart package includes winter tires and roadside assistance - it's only €12 extra and can save you hundreds if needed."
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🛡️ Objection Handling</h4>
                <p className="text-sm text-purple-800">
                  <strong>Customer:</strong> "Insurance is too expensive"<br/>
                  <strong>You:</strong> "I understand budget concerns. Consider that the Basic package is just €8 and covers the most common issues. It's less than a coffee per day for complete peace of mind."
                </p>
              </div>

              <Button variant="outline" className="w-full">
                Generate New Insights
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Enter Today's Data
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                View Weekly Report
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance History
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Target className="mr-2 h-4 w-4" />
                My Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend (Last 7 Days)</CardTitle>
            <CardDescription>
              Your daily performance scores and key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart component will be added here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}