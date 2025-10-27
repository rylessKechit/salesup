import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Typage pour les sessions vocales
interface VoiceSession {
  userId: string
  customerType: string
  scenario: string
  messages: Array<{ role: string; content: string }>
  startTime: Date
  exchangeCount: number
}

// Déclarer le type global
declare global {
  var voiceTrainingSessions: Map<string, VoiceSession> | undefined
}

// Customer types and scenarios
const CUSTOMER_TYPES = [
  {
    type: 'rushed',
    description: 'Business customer in a hurry who just wants to pick up the car quickly',
    behavior: 'Impatient, refuses options, wants to go fast'
  },
  {
    type: 'budget',
    description: 'Price-conscious customer who negotiates everything',
    behavior: 'Questions every cost, compares prices, reluctant to extras'
  },
  {
    type: 'business',
    description: 'Professional customer who prioritizes comfort and security',
    behavior: 'Interested in premium insurance, comfort upgrades'
  },
  {
    type: 'family',
    description: 'Customer with family who prioritizes safety',
    behavior: 'Focus on child safety, space, comprehensive insurance'
  },
  {
    type: 'reluctant',
    description: 'Customer who systematically refuses all options',
    behavior: 'Suspicious, refuses everything, looks for scams'
  }
]

const SCENARIOS = [
  'Picking up reservation with upgrade proposal',
  'Customer with vehicle availability issue',
  'Selling insurance to a reluctant customer',
  'Proposing upgrade to higher category',
  'Handling complaint from previous rental',
  'Customer hesitating between different insurances',
  'Cross-selling accessories (GPS, child seat)',
  'Customer wanting to cancel reservation',
  'Proposing electric vehicle upgrade',
  'Customer unhappy with final price'
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ MODE DÉVELOPPEMENT si pas d'OpenAI
    if (!openai) {
      console.log('🎭 Mode développement - Génération scenario sans OpenAI')
      
      // Générer un scénario aléatoire
      const customerType = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)]
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
      const sessionId = `vocal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Default messages by customer type
      const defaultMessages = {
        'rushed': "Hello, I'm late for an important meeting, I just need to pick up my car quickly. What's the reference number?",
        'budget': "Hi, I'm here for my reservation. I hope there won't be any hidden fees, I already paid online and don't want anything extra.",
        'business': "Hello, I'm picking up the car reserved for my company. I need a reliable vehicle for my business trips this week.",
        'family': "Hello, we're going on vacation with our two children. Is the car well-equipped and safe?",
        'reluctant': "Hello... so, I reserved a car but I read negative reviews online. I hope you won't try to sell me tons of unnecessary options."
      }

      const initialMessage = defaultMessages[customerType.type as keyof typeof defaultMessages] || 
        'Hello, I\'m here to pick up my reserved car.'

      // Stocker la session
      if (!globalThis.voiceTrainingSessions) {
        globalThis.voiceTrainingSessions = new Map<string, VoiceSession>()
      }
      
      globalThis.voiceTrainingSessions.set(sessionId, {
        userId: session.user.id,
        customerType: customerType.type,
        scenario,
        messages: [
          { role: 'system', content: `Mode développement - Client ${customerType.type}` },
          { role: 'assistant', content: initialMessage }
        ],
        startTime: new Date(),
        exchangeCount: 0
      })

      return NextResponse.json({
        sessionId,
        scenario,
        customerType: customerType.type,
        initialMessage,
        instructions: `🎭 DEV MODE - ${customerType.type} customer. Respond naturally!`,
        devMode: true
      })
    }

    // MODE PRODUCTION avec OpenAI
    console.log('🤖 Mode production - Génération avec OpenAI')

    // Générer un scénario aléatoire
    const customerType = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)]
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
    
    // Générer un ID de session unique
    const sessionId = `vocal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create prompt for AI
    const systemPrompt = `You are a ${customerType.type} customer at Sixt car rental. 

CONTEXT: ${scenario}
BEHAVIOR: ${customerType.behavior}

RULES:
1. Play the role realistically and consistently
2. NEVER reveal your type or scenario explicitly
3. React naturally to agent proposals
4. Be ${customerType.type} in your responses
5. Conversation lasts max 10 exchanges
6. If agent concludes well, accept or refuse according to your type
7. Stay polite but firm in your character
8. Speak ONLY in English

Start by briefly introducing yourself and expressing your need without revealing the scenario.`

    // Generate customer opening message
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Start the conversation. Introduce yourself briefly and express your need in English.' }
      ],
      temperature: 0.8,
      max_tokens: 150
    })

    const initialMessage = response.choices[0]?.message?.content || 
      'Hello, I\'m here to pick up my reserved car.'

    // Stocker la session en mémoire (dans un vrai projet, utiliser Redis/DB)
    if (!globalThis.voiceTrainingSessions) {
      globalThis.voiceTrainingSessions = new Map<string, VoiceSession>()
    }
    
    globalThis.voiceTrainingSessions.set(sessionId, {
      userId: session.user.id,
      customerType: customerType.type,
      scenario,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: initialMessage }
      ],
      startTime: new Date(),
      exchangeCount: 0
    })

    return NextResponse.json({
      sessionId,
      scenario,
      customerType: customerType.type,
      initialMessage,
      instructions: `Vous allez interagir avec un client ${customerType.type}. Découvrez son besoin et tentez de maximiser la vente.`
    })

  } catch (error) {
    console.error('Error starting voice training:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}