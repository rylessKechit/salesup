import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb/service'
import { emailService } from '@/lib/email/service'
import { validateUser } from '@/lib/mongodb/schemas'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, password, invitationToken } = body

    // Validation des données
    if (!email || !firstName || !lastName || !password || !invitationToken) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' }, 
        { status: 400 }
      )
    }

    await mongoService.connect()

    // Vérifier l'invitation
    const invitation = await mongoService.getInvitationByToken(invitationToken)

    if (!invitation || invitation.email !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' }, 
        { status: 400 }
      )
    }

    // Vérifier si l'invitation a expiré
    const now = new Date()
    const expiresAt = new Date(invitation.expiresAt)
    
    if (now > expiresAt) {
      await mongoService.updateInvitationStatus(invitation._id.toString(), 'expired')
      return NextResponse.json(
        { error: 'Invitation has expired' }, 
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await mongoService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' }, 
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'agent' as const,
      isActive: true,
      invitedBy: invitation.invitedBy,
      needsPasswordSetup: false,
      notificationPreferences: {
        dailyReminders: true,
        weeklyReports: true,
        goalAlerts: true
      }
    }

    // Valider les données utilisateur
    const validationErrors = validateUser(userData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors }, 
        { status: 400 }
      )
    }

    // Créer l'utilisateur
    const user = await mongoService.createUser(userData)

    // Marquer l'invitation comme acceptée
    await mongoService.updateInvitationStatus(invitation._id.toString(), 'accepted', {
      userId: user._id
    })

    // Envoyer l'email de bienvenue
    await emailService.sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userResponse } = user
    
    return NextResponse.json({ 
      message: 'Account created successfully',
      user: userResponse 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user account:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}