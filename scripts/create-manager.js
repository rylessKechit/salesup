#!/usr/bin/env node

/**
 * Script pour créer le premier manager administrateur
 * Usage: node scripts/create-manager.js
 */

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Configuration
const MONGODB_URI = 'mongodb+srv://ysgdrivers_db_user:LwqI7oujMoQilo2Z@salesup.tx3hv7i.mongodb.net/?appName=salesup'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createManager() {
  console.log('🚀 SalesUp - Manager Creation Script\n')
  
  try {
    // Collecter les informations
    const firstName = await question('Manager first name: ')
    const lastName = await question('Manager last name: ')
    const email = await question('Manager email: ')
    const password = await question('Manager password: ')
    
    if (!firstName || !lastName || !email || !password) {
      console.error('❌ All fields are required')
      process.exit(1)
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format')
      process.exit(1)
    }

    // Validation mot de passe
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters')
      process.exit(1)
    }

    console.log('\n⏳ Connecting to database...')
    
    // Connexion à MongoDB
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()
    
    console.log('✅ Connected to database')

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    })
    
    if (existingUser) {
      console.error('❌ A user with this email already exists')
      await client.close()
      process.exit(1)
    }

    // Hasher le mot de passe
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer le manager
    const manager = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'manager',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      notificationPreferences: {
        dailyReminders: true,
        weeklyReports: true,
        goalAlerts: true
      }
    }

    console.log('👤 Creating manager account...')
    const result = await db.collection('users').insertOne(manager)
    
    console.log('✅ Manager created successfully!')
    console.log('\n📋 Manager Details:')
    console.log(`   ID: ${result.insertedId}`)
    console.log(`   Name: ${firstName} ${lastName}`)
    console.log(`   Email: ${email}`)
    console.log(`   Role: manager`)
    console.log(`   Created: ${new Date().toISOString()}`)
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Start your Next.js application: npm run dev')
    console.log('2. Login at: http://localhost:3000/login')
    console.log('3. Use the credentials you just created')
    console.log('4. Navigate to Team Management to invite agents')

    await client.close()
    
  } catch (error) {
    console.error('❌ Error creating manager:', error.message)
    process.exit(1)
  }
  
  rl.close()
}

// Vérifier les variables d'environnement
if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not found in environment variables')
  console.log('💡 Make sure your .env.local file is configured')
  console.log('')
}

// Lancer le script
createManager().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})