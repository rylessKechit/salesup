'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain,
  TrendingUp, 
  MessageSquare, 
  Shield,
  RefreshCw,
  Copy,
  Check,
  Lightbulb,
  Target,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AIFeedbackData {
  improvements: string[]
  salesScript: string
  objectionHandling: string
  generatedAt: Date
  confidence?: number
}

interface AIFeedbackProps {
  feedback: AIFeedbackData | null
  isLoading?: boolean
  onRegenerate?: () => void
  mode?: 'full' | 'compact' | 'card'
  className?: string
}

export function AIFeedback({ 
  feedback, 
  isLoading = false, 
  onRegenerate,
  mode = 'full',
  className 
}: AIFeedbackProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemType)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 animate-spin" />
            Generating AI Insights...
          </CardTitle>
          <CardDescription>
            Analyzing your performance data to provide personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!feedback) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="font-medium text-gray-700">No AI feedback available</p>
              <p className="text-sm text-gray-500">Submit your daily performance to get personalized insights</p>
            </div>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="outline">
                Generate Insights
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mode === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Brain className="mr-2 h-4 w-4" />
              AI Insights
            </CardTitle>
            {feedback.confidence && (
              <Badge variant="outline">
                {feedback.confidence}% confidence
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p className="font-medium text-blue-600">Top Improvement:</p>
            <p className="text-gray-700">{feedback.improvements[0]}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            View All Insights
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Performance Insights</CardTitle>
            {feedback.confidence && (
              <Badge variant="outline">
                {feedback.confidence}% confidence
              </Badge>
            )}
          </div>
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              Regenerate
            </Button>
          )}
        </div>
        <CardDescription>
          Personalized recommendations based on your performance data
          {feedback.generatedAt && (
            <span className="ml-2 text-xs">
              • Generated {feedback.generatedAt.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Improvements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-blue-900 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Key Improvements
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(feedback.improvements.join('\n'), 'improvements')}
            >
              {copiedItem === 'improvements' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 mt-0.5">
                    {index + 1}
                  </div>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sales Script */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-green-900 flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Recommended Sales Script
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(feedback.salesScript, 'script')}
            >
              {copiedItem === 'script' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-800 italic">
              "{feedback.salesScript}"
            </p>
          </div>
        </div>

        {/* Objection Handling */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-900 flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Objection Handling
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(feedback.objectionHandling, 'objection')}
            >
              {copiedItem === 'objection' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              {feedback.objectionHandling}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Lightbulb className="mr-2 h-4 w-4" />
            More Tips
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="mr-2 h-4 w-4" />
            Practice Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple feedback alert for quick display
export function AIFeedbackAlert({ feedback, className }: { feedback: AIFeedbackData; className?: string }) {
  return (
    <Alert className={cn('border-blue-200 bg-blue-50', className)}>
      <Brain className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>AI Insight:</strong> {feedback.improvements[0]}
      </AlertDescription>
    </Alert>
  )
}

// Loading state component
export function AIFeedbackSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}