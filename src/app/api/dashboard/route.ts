import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'

// GET - Récupérer les données du dashboard selon le rôle
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    const userRole = (session.user as any).role
    const userId = session.user.id

    if (userRole === 'agent') {
      // Dashboard Agent
      const dashboardData = await mongoService.getAgentDashboardData(userId)
      
      return NextResponse.json({
        type: 'agent',
        data: dashboardData
      })

    } else if (userRole === 'manager') {
      // Dashboard Manager
      const dashboardData = await mongoService.getManagerDashboardData(userId)
      
      return NextResponse.json({
        type: 'manager',
        data: dashboardData
      })

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}