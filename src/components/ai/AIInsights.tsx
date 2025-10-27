'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import type { AIAnalysis, AIInsight } from '@/lib/ai/performance-analyzer'

interface AIInsightsProps {
  userId?: string
}

export function AIInsights({ userId }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAnalysis()
  }, [userId])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai/analysis')
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI analysis')
      }

      const data = await response.json()
      setAnalysis(data.analysis)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI insights')
    } finally {
      setLoading(false)
    }
  }

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights)
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId)
    } else {
      newExpanded.add(insightId)
    }
    setExpandedInsights(newExpanded)
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'improvement':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'goal':
        return <Target className="h-5 w-5 text-purple-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'improvement':
        return 'border-blue-200 bg-blue-50'
      case 'goal':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: AIInsight['priority']) => {
    const variants = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const
    }
    
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const getTrendIcon = (trend: AIAnalysis['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      case 'stable':
        return <Minus className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your performance...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchAnalysis} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Not enough data for AI analysis</p>
            <p className="text-sm text-gray-400">Add more daily entries to unlock AI insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              AI Performance Analysis
            </CardTitle>
            <Button onClick={fetchAnalysis} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            AI-powered insights based on your performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {analysis.overallScore}%
              </div>
              <Progress value={analysis.overallScore} className="mb-2" />
              <p className="text-sm text-gray-600">Overall Performance</p>
            </div>

            {/* Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getTrendIcon(analysis.trend)}
                <span className="ml-2 text-lg font-semibold capitalize">
                  {analysis.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600">Recent Trend</p>
            </div>

            {/* Strengths */}
            <div className="text-center">
              <div className="text-sm font-medium text-green-600 mb-1">
                Strongest Area
              </div>
              <div className="text-lg font-semibold">
                {analysis.strongestArea}
              </div>
              <div className="text-sm text-red-600 mt-2">
                Focus Area: {analysis.weakestArea}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.insights.map((insight) => (
              <div
                key={insight.id}
                className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-semibold">{insight.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(insight.priority)}
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{insight.description}</p>
                
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Impact:</strong> {insight.impact}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleInsight(insight.id)}
                  className="mb-3"
                >
                  {expandedInsights.has(insight.id) ? 'Hide' : 'Show'} Action Items
                </Button>

                {expandedInsights.has(insight.id) && (
                  <div className="bg-white rounded p-3 border">
                    <h5 className="font-medium mb-2">🎯 Action Items:</h5>
                    <ul className="space-y-1">
                      {insight.actionItems.map((action, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Suggested Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.nextGoals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <Target className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}