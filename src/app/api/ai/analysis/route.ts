import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'
import { aiAnalyzer } from '@/lib/ai/performance-analyzer'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    // Récupérer les données nécessaires pour l'analyse
    const [performanceMetrics, recentEntries] = await Promise.all([
      mongoService.getPerformanceMetrics(session.user.id),
      mongoService.getDailyEntriesByUser(session.user.id, 14) // 14 derniers jours
    ])

    if (!performanceMetrics || !performanceMetrics.metrics) {
      return NextResponse.json({
        analysis: null,
        message: 'Not enough data for AI analysis. Please add more daily entries.'
      })
    }

    // Générer l'analyse IA
    const analysis = await aiAnalyzer.analyzePerformance(
      performanceMetrics.metrics,
      recentEntries
    )

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Générer une analyse personnalisée avec paramètres
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { focusArea, days = 14 } = body

    await mongoService.connect()

    const [performanceMetrics, recentEntries] = await Promise.all([
      mongoService.getPerformanceMetrics(session.user.id),
      mongoService.getDailyEntriesByUser(session.user.id, days)
    ])

    if (!performanceMetrics || !performanceMetrics.metrics) {
      return NextResponse.json({
        analysis: null,
        message: 'Not enough data for AI analysis.'
      })
    }

    // Générer l'analyse IA avec focus spécifique
    const analysis = await aiAnalyzer.analyzePerformance(
      performanceMetrics.metrics,
      recentEntries
    )

    // Filtrer les insights selon le focus demandé
    if (focusArea) {
      analysis.insights = analysis.insights.filter(
        insight => insight.category === focusArea
      )
    }

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('Error generating focused AI analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}