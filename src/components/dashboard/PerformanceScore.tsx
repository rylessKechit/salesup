'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceScoreProps {
  score: number
  previousScore?: number
  goal?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  showTrend?: boolean
  showGoal?: boolean
}

export function PerformanceScore({ 
  score, 
  previousScore,
  goal,
  className,
  size = 'md',
  showProgress = true,
  showTrend = true,
  showGoal = true
}: PerformanceScoreProps) {
  // Calculate trend
  const trend = previousScore ? score - previousScore : 0
  const trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'same'
  
  // Determine score level and color
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-800' }
    if (score >= 80) return { level: 'Great', color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800' }
    if (score >= 70) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800' }
    if (score >= 60) return { level: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' }
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800' }
  }

  const scoreLevel = getScoreLevel(score)
  
  // Size configurations
  const sizeConfig = {
    sm: {
      scoreText: 'text-2xl',
      container: 'p-4',
      icon: 'h-4 w-4'
    },
    md: {
      scoreText: 'text-3xl',
      container: 'p-6',
      icon: 'h-5 w-5'
    },
    lg: {
      scoreText: 'text-4xl',
      container: 'p-8',
      icon: 'h-6 w-6'
    }
  }

  const config = sizeConfig[size]

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className={cn(config.icon, 'text-green-600')} />
      case 'down':
        return <TrendingDown className={cn(config.icon, 'text-red-600')} />
      default:
        return <Minus className={cn(config.icon, 'text-gray-400')} />
    }
  }

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Background gradient based on score */}
      <div className={cn('absolute inset-0 opacity-50', scoreLevel.bg)} />
      
      <CardContent className={cn('relative', config.container)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className={cn(config.icon, scoreLevel.color)} />
            <span className="font-medium text-gray-700">Performance Score</span>
          </div>
          
          {/* Score Level Badge */}
          <Badge className={scoreLevel.badge}>
            {scoreLevel.level}
          </Badge>
        </div>

        {/* Main Score Display */}
        <div className="text-center space-y-3">
          <div className={cn('font-bold', scoreLevel.color, config.scoreText)}>
            {score}/100
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <Progress value={score} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          )}

          {/* Trend Indicator */}
          {showTrend && previousScore !== undefined && (
            <div className="flex items-center justify-center space-x-1">
              {getTrendIcon()}
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)} from previous
              </span>
            </div>
          )}

          {/* Goal Progress */}
          {showGoal && goal && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-1 text-sm">
                <Target className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">Goal: {goal}/100</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      score >= goal ? 'bg-green-500' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min((score / goal) * 100, 100)}%` }}
                  />
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  score >= goal ? 'text-green-600' : 'text-gray-600'
                )}>
                  {((score / goal) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick score display for tables/lists
export function PerformanceScoreCompact({ score, className }: { score: number; className?: string }) {
  const scoreLevel = score >= 90 ? 'excellent' : score >= 80 ? 'great' : score >= 70 ? 'good' : score >= 60 ? 'fair' : 'poor'
  
  const colorClass = {
    excellent: 'text-green-600 bg-green-50',
    great: 'text-blue-600 bg-blue-50',
    good: 'text-yellow-600 bg-yellow-50',
    fair: 'text-orange-600 bg-orange-50',
    poor: 'text-red-600 bg-red-50'
  }[scoreLevel]

  return (
    <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-sm font-medium', colorClass, className)}>
      {score}/100
    </div>
  )
}