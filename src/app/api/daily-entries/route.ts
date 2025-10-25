import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'
import { validateDailyEntry } from '@/lib/mongodb/schemas'

// GET - Récupérer les entrées quotidiennes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await mongoService.connect()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')

    let entries

    if (startDate && endDate) {
      entries = await mongoService.getDailyEntriesByDateRange(
        session.user.id,
        new Date(startDate),
        new Date(endDate)
      )
    } else {
      entries = await mongoService.getDailyEntriesByUser(session.user.id, limit)
    }

    return NextResponse.json({ entries })

  } catch (error) {
    console.error('Error fetching daily entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle entrée quotidienne
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, contractsCount, upgradesCount, totalUpgradeValue, insurancePackages, notes } = body

    // Validation des données
    const entryData = {
      userId: session.user.id,
      agentId: session.user.id,
      date: new Date(date),
      contractsCount: parseInt(contractsCount),
      upgradesCount: parseInt(upgradesCount),
      totalUpgradeValue: parseFloat(totalUpgradeValue),
      insurancePackages: insurancePackages || [],
      notes: notes || ''
    }

    const validationErrors = validateDailyEntry(entryData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      )
    }

    await mongoService.connect()

    try {
      const entry = await mongoService.createDailyEntry(entryData)
      
      return NextResponse.json({ 
        message: 'Entry created successfully',
        entry 
      }, { status: 201 })

    } catch (error: any) {
      if (error.message === 'Entry already exists for this date') {
        return NextResponse.json(
          { error: 'An entry already exists for this date' }, 
          { status: 409 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Error creating daily entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une entrée existante
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, contractsCount, upgradesCount, totalUpgradeValue, insurancePackages, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const updates = {
      contractsCount: parseInt(contractsCount),
      upgradesCount: parseInt(upgradesCount),
      totalUpgradeValue: parseFloat(totalUpgradeValue),
      insurancePackages: insurancePackages || [],
      notes: notes || ''
    }

    const validationErrors = validateDailyEntry({ ...updates, userId: session.user.id, date: new Date() })
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      )
    }

    await mongoService.connect()

    const updated = await mongoService.updateDailyEntry(id, updates)
    
    if (!updated) {
      return NextResponse.json({ error: 'Entry not found or not updated' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Entry updated successfully' })

  } catch (error) {
    console.error('Error updating daily entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}