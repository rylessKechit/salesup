import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mongoService } from '@/lib/mongodb/service'
import { emailService } from '@/lib/email/service'
import crypto from 'crypto'

// GET - Récupérer les invitations du manager
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Only managers can view invitations' }, { status: 403 })
    }

    await mongoService.connect()
    
    const invitations = await mongoService.getInvitationsByManager(session.user.id)
    
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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Only managers can send invitations' }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName } = body

    // Validation des données
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' }, 
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' }, 
        { status: 400 }
      )
    }

    await mongoService.connect()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await mongoService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' }, 
        { status: 409 }
      )
    }

    // Vérifier si une invitation existe déjà
    const existingInvitation = await mongoService.getInvitationByEmail(email, 'pending')

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' }, 
        { status: 409 }
      )
    }

    // Récupérer les infos du manager
    const manager = await mongoService.getUserById(session.user.id)
    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    // Créer l'invitation avec un token unique
    const token = crypto.randomBytes(32).toString('hex')
    const invitationData = {
      email: email.toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      status: 'pending' as const,
      invitedBy: session.user.id,
      invitedByName: `${manager.firstName} ${manager.lastName}`,
      token
    }

    const invitation = await mongoService.createInvitation(invitationData)

    // URL d'invitation
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`
    
    // Envoyer l'email d'invitation
    const emailSent = await emailService.sendInvitationEmail({
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      invitedByName: invitation.invitedByName,
      inviteUrl
    })

    if (!emailSent) {
      console.warn('⚠️ Failed to send invitation email, but invitation was created')
    }

    console.log(`🚀 Invitation créée! URL: ${inviteUrl}`)

    return NextResponse.json({ 
      message: emailSent 
        ? 'Invitation sent successfully via email' 
        : 'Invitation created, but email failed to send',
      invitation: {
        ...invitation,
        token: undefined // Ne pas exposer le token dans la réponse
      },
      inviteUrl, // Pour le développement
      emailSent
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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'manager') {
      return NextResponse.json({ error: 'Only managers can cancel invitations' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    await mongoService.connect()

    // Mettre à jour le statut
    await mongoService.updateInvitationStatus(invitationId, 'cancelled')

    return NextResponse.json({ message: 'Invitation cancelled successfully' })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}