import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'

// GET - Récupérer les métriques de performance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'monthly'
    const agentId = searchParams.get('agentId') // Pour les managers qui consultent leurs agents
    
    const userRole = (session.user as any).role
    let targetUserId = session.user.id

    // Si c'est un manager qui consulte un agent spécifique
    if (userRole === 'manager' && agentId) {
      // Vérifier que l'agent appartient bien au manager
      const agents = await mongoService.getAgentsByManager(session.user.id)
      const agent = agents.find(a => a._id?.toString() === agentId)
      
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 403 })
      }
      
      targetUserId = agentId
    }

    const metrics = await mongoService.getPerformanceMetrics(targetUserId, period)
    
    if (!metrics) {
      // Calculer les métriques si elles n'existent pas
      const calculatedMetrics = await mongoService.calculatePerformanceMetrics(targetUserId)
      return NextResponse.json({ metrics: calculatedMetrics })
    }

    return NextResponse.json({ metrics })

  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Recalculer les métriques de performance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    const body = await request.json()
    const { agentId } = body
    
    const userRole = (session.user as any).role
    let targetUserId = session.user.id

    // Si c'est un manager qui recalcule pour un agent
    if (userRole === 'manager' && agentId) {
      const agents = await mongoService.getAgentsByManager(session.user.id)
      const agent = agents.find(a => a._id?.toString() === agentId)
      
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 403 })
      }
      
      targetUserId = agentId
    }

    const metrics = await mongoService.calculatePerformanceMetrics(targetUserId)
    
    return NextResponse.json({ 
      message: 'Metrics recalculated successfully',
      metrics 
    })

  } catch (error) {
    console.error('Error recalculating performance metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}