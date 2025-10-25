import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { MongoClient, ObjectId } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI!)

// GET - Récupérer les invitations (managers seulement)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const db = client.db()
    
    const invitations = await db.collection('invitations')
      .find({ invitedBy: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ invitations })
    
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, firstName, lastName } = body

    // Validation
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' }, 
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()
    const db = client.db()

    // Vérifier si l'email existe déjà (utilisateur ou invitation)
    const [existingUser, existingInvitation] = await Promise.all([
      db.collection('users').findOne({ email: email.toLowerCase() }),
      db.collection('invitations').findOne({ 
        email: email.toLowerCase(), 
        status: 'pending' 
      })
    ])

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' }, 
        { status: 409 }
      )
    }

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' }, 
        { status: 409 }
      )
    }

    // Créer l'invitation
    const invitation = {
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      status: 'pending' as const,
      invitedBy: session.user.id,
      invitedByName: `${session.user.firstName} ${session.user.lastName}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    }

    const result = await db.collection('invitations').insertOne(invitation)

    // TODO: Envoyer l'email d'invitation
    // await sendInvitationEmail(invitation)

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        ...invitation,
        _id: result.insertedId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE - Annuler une invitation
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' }, 
        { status: 400 }
      )
    }

    await connectToDatabase()
    const db = client.db()

    const result = await db.collection('invitations').updateOne(
      { 
        _id: new ObjectId(invitationId),
        invitedBy: session.user.id,
        status: 'pending'
      },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Invitation cancelled successfully' })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}