'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { DailyEntryForm } from '@/components/forms/DailyEntryForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  ArrowLeft, 
  Calendar,
  TrendingUp,
  Target,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

// Mock user data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'agent' as const,
  email: 'john.doe@sixt.com'
}

type DailyEntryFormData = {
  date: string
  contractsCount: number
  totalRevenue: number
  upgradeRate: number
  averageUpgradePrice: number
  insurancePackages: Array<{
    packageType: 'Basic' | 'Smart' | 'All Inclusive'
    count: number
  }>
}

export default function DailyEntryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<{
    improvements: string[]
    salesScript: string
    objectionHandling: string
    performanceScore: number
  } | null>(null)

  const handleSubmit = async (data: DailyEntryFormData) => {
    setIsLoading(true)
    
    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI feedback generation
      const mockFeedback = {
        improvements: [
          "Focus on Smart insurance packages - your conversion rate could improve by targeting business travelers",
          "Your peak performance hours are 2-4 PM - schedule premium customer appointments during this time",
          "Consider mentioning seasonal travel benefits when selling All Inclusive packages"
        ],
        salesScript: "For business travelers: 'I see you're traveling for work. Our Smart package includes priority roadside assistance and business travel coverage for just €15 extra - it's tax deductible and ensures you won't have delays that could affect your meetings.'",
        objectionHandling: "When customers say insurance is too expensive: 'I understand budget is important. Think of it this way - the Basic package at €8 is less than what you'd spend on airport coffee, but it protects you from hundreds in potential costs. Which matters more for your peace of mind?'",
        performanceScore: 87
      }
      
      setAiFeedback(mockFeedback)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Error submitting daily entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted && aiFeedback) {
    return (
      <MainLayout user={mockUser}>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Entry Submitted Successfully!</h1>
              <p className="text-gray-600">Your AI-powered performance insights are ready</p>
            </div>
          </div>

          {/* Success Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your daily performance data has been saved and analyzed. Here's your personalized feedback!
            </AlertDescription>
          </Alert>

          {/* Performance Score */}
          <Card className="bg-gradient-to-r from-primary/10 to-blue-50">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {aiFeedback.performanceScore}/100
                </div>
                <p className="text-lg font-semibold text-gray-700">Today's Performance Score</p>
                <Badge className="mt-2">
                  {aiFeedback.performanceScore >= 90 ? 'Excellent' : 
                   aiFeedback.performanceScore >= 80 ? 'Great' : 
                   aiFeedback.performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Key Improvements
                </CardTitle>
                <CardDescription>
                  AI-identified opportunities to boost your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiFeedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{improvement}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sales Script */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-green-600" />
                  Recommended Sales Script
                </CardTitle>
                <CardDescription>
                  Personalized script based on your performance patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 italic">
                    "{aiFeedback.salesScript}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Objection Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
                Objection Handling Tip
              </CardTitle>
              <CardDescription>
                How to overcome common customer objections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  {aiFeedback.objectionHandling}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/entry">
                Enter Another Day
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/performance/history">
                View History
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={mockUser}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Performance Entry</h1>
            <p className="text-gray-600">Enter your sales metrics to get personalized AI feedback</p>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Daily Entry Instructions</p>
                <p className="text-sm text-blue-700 mt-1">
                  Fill in your sales metrics for today. The system will automatically calculate your performance score 
                  and generate personalized AI feedback to help improve your results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <DailyEntryForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  )
}