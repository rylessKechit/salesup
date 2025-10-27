import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    // Get user's performance metrics
    const performanceData = await mongoService.getPerformanceMetrics(session.user.id)
    
    if (!performanceData) {
      return NextResponse.json({ 
        weaknesses: [],
        message: 'No performance data available yet' 
      })
    }

    // Analyze weaknesses based on performance scores
    const weaknesses = []
    const metrics = performanceData.metrics

    // Define thresholds for improvement areas
    if (metrics.insuranceRate < 50) {
      weaknesses.push('insurance_rate')
    }
    if (metrics.upgradeRate < 30) {
      weaknesses.push('upgrade_rate')
    }
    if (metrics.performanceScore < 70) {
      weaknesses.push('overall_performance')
    }
    if (metrics.consistencyScore < 60) {
      weaknesses.push('consistency')
    }

    // Additional analysis based on recent entries
    const recentEntries = await mongoService.getDailyEntriesByUser(session.user.id, 10)
    
    if (recentEntries.length > 0) {
      const avgRevenue = recentEntries.reduce((sum, entry) => sum + (entry.totalUpgradeValue || 0), 0) / recentEntries.length
      const avgContracts = recentEntries.reduce((sum, entry) => sum + entry.contractsCount, 0) / recentEntries.length
      
      if (avgRevenue < 50 && avgContracts > 0) {
        weaknesses.push('upselling')
      }
      
      // Check for objection handling (if upgrade rate is low despite having contracts)
      const upgradeSuccessRate = recentEntries.reduce((sum, entry) => {
        return sum + (entry.contractsCount > 0 ? (entry.upgradesCount || 0) / entry.contractsCount : 0)
      }, 0) / recentEntries.length

      if (upgradeSuccessRate < 0.3) {
        weaknesses.push('objection_handling')
      }
    }

    // Remove duplicates and limit to top 5
    const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 5)

    return NextResponse.json({
      weaknesses: uniqueWeaknesses,
      metrics: {
        insuranceRate: metrics.insuranceRate,
        upgradeRate: metrics.upgradeRate,
        performanceScore: metrics.performanceScore,
        consistencyScore: metrics.consistencyScore
      },
      recommendations: generateRecommendations(uniqueWeaknesses)
    })

  } catch (error) {
    console.error('Error fetching weaknesses:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

function generateRecommendations(weaknesses: string[]): string[] {
  const recommendationMap: Record<string, string[]> = {
    insurance_rate: [
      'Practice explaining insurance benefits clearly',
      'Work on building trust with reluctant customers',
      'Focus on value proposition rather than price'
    ],
    upgrade_rate: [
      'Improve upselling techniques',
      'Practice identifying customer needs',
      'Work on presenting upgrade value effectively'
    ],
    objection_handling: [
      'Practice responding to price objections',
      'Work on empathy and active listening',
      'Develop better rebuttals for common objections'
    ],
    overall_performance: [
      'Focus on overall sales technique improvement',
      'Practice complete sales conversations',
      'Work on closing techniques'
    ],
    consistency: [
      'Maintain regular daily entries',
      'Focus on consistent performance',
      'Develop daily routine habits'
    ],
    upselling: [
      'Practice identifying upselling opportunities',
      'Work on presenting additional value',
      'Improve cross-selling techniques'
    ]
  }

  const recommendations: string[] = []
  
  weaknesses.forEach(weakness => {
    if (recommendationMap[weakness]) {
      recommendations.push(...recommendationMap[weakness])
    }
  })

  return Array.from(new Set(recommendations)).slice(0, 6) // Remove duplicates and limit
}