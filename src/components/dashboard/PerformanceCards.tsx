'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Shield, 
  BarChart3,
  Calendar
} from 'lucide-react'
import type { PerformanceCardsProps } from '@/types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function PerformanceCards({ metrics }: PerformanceCardsProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good', color: 'text-blue-600' }
    if (score >= 40) return { variant: 'outline' as const, label: 'Fair', color: 'text-yellow-600' }
    return { variant: 'destructive' as const, label: 'Needs Improvement', color: 'text-red-600' }
  }

  const performanceBadge = getScoreBadge(metrics.performanceScore)
  const consistencyBadge = getScoreBadge(metrics.consistencyScore)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold">{metrics.performanceScore}%</div>
            <Badge variant={performanceBadge.variant}>
              {performanceBadge.label}
            </Badge>
          </div>
          <Progress value={metrics.performanceScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Overall performance rating
          </p>
        </CardContent>
      </Card>

      {/* Insurance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Insurance Rate</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.insuranceRate.toFixed(1)}%</div>
          <Progress value={metrics.insuranceRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.totalContracts > 0 
              ? `${Math.round((metrics.insuranceRate / 100) * metrics.totalContracts)} of ${metrics.totalContracts} contracts`
              : 'No contracts yet'
            }
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
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(metrics.revenuePerContract)} per contract
          </p>
        </CardContent>
      </Card>

      {/* Upgrade Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upgrade Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.upgradeRate.toFixed(1)}%</div>
          <Progress value={metrics.upgradeRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.totalUpgrades} upgrades sold
          </p>
        </CardContent>
      </Card>

      {/* Average Upgrade Price */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Upgrade Price</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageUpgradePrice)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            From {metrics.totalUpgrades} upgrades
          </p>
        </CardContent>
      </Card>

      {/* Consistency Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consistency</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold">{metrics.consistencyScore}%</div>
            <Badge variant={consistencyBadge.variant}>
              {consistencyBadge.label}
            </Badge>
          </div>
          <Progress value={metrics.consistencyScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Daily entry consistency
          </p>
        </CardContent>
      </Card>
    </div>
  )
}