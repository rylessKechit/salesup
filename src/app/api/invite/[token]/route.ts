import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb/service'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' }, 
        { status: 400 }
      )
    }

    await mongoService.connect()

    // Chercher l'invitation par token
    const invitation = await mongoService.getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or expired' }, 
        { status: 404 }
      )
    }

    // Vérifier si l'invitation a expiré
    const now = new Date()
    const expiresAt = new Date(invitation.expiresAt)
    
    if (now > expiresAt) {
      // Marquer l'invitation comme expirée
      await mongoService.updateInvitationStatus(invitation._id.toString(), 'expired')
      
      return NextResponse.json(
        { error: 'Invitation has expired' }, 
        { status: 410 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await mongoService.getUserByEmail(invitation.email)
    if (existingUser) {
      // Marquer l'invitation comme acceptée si l'utilisateur existe
      await mongoService.updateInvitationStatus(invitation._id.toString(), 'accepted', {
        userId: existingUser._id
      })
      
      return NextResponse.json(
        { error: 'User account already exists for this email' }, 
        { status: 410 }
      )
    }

    // Retourner les données de l'invitation (sans le token)
    return NextResponse.json({ 
      invitation: {
        _id: invitation._id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        invitedByName: invitation.invitedByName,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}