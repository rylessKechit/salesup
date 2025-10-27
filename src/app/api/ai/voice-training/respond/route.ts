import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { sessionId, agentMessage } = body

    if (!sessionId || !agentMessage) {
      return NextResponse.json({ error: 'Missing sessionId or agentMessage' }, { status: 400 })
    }

    // Récupérer la session
    const sessions = global.voiceTrainingSessions || new Map()
    const sessionData = sessions.get(sessionId)

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (sessionData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized session access' }, { status: 403 })
    }

    // Ajouter le message de l'agent à l'historique
    sessionData.messages.push({ role: 'user', content: agentMessage })
    sessionData.exchangeCount += 1

    // Vérifier si la session doit se terminer
    const shouldEnd = sessionData.exchangeCount >= 10 || 
                     agentMessage.toLowerCase().includes('session terminée') ||
                     agentMessage.toLowerCase().includes('au revoir')

    if (shouldEnd) {
      // Évaluer la performance avant de terminer
      const evaluation = await evaluatePerformance(sessionData.messages, sessionData.customerType)
      
      sessions.delete(sessionId)
      
      return NextResponse.json({
        sessionEnded: true,
        evaluation,
        customerResponse: null
      })
    }

    // Générer la réponse du client via OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: sessionData.messages,
      temperature: 0.8,
      max_tokens: 150
    })

    const customerResponse = response.choices[0]?.message?.content || 
      'Je ne comprends pas, pouvez-vous répéter ?'

    // Ajouter la réponse à l'historique
    sessionData.messages.push({ role: 'assistant', content: customerResponse })

    // Mettre à jour la session
    sessions.set(sessionId, sessionData)

    return NextResponse.json({
      customerResponse,
      sessionEnded: false,
      exchangeCount: sessionData.exchangeCount
    })

  } catch (error) {
    console.error('Error in voice training response:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Fonction pour évaluer la performance de l'agent
async function evaluatePerformance(messages: any[], customerType: string) {
  if (!openai) {
    return {
      greeting: 7,
      argumentation: 7,
      objectionHandling: 7,
      closing: 7,
      overall: 7,
      feedback: ['Continuez vos efforts !']
    }
  }

  const conversation = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'AGENT' : 'CLIENT'}: ${m.content}`)
    .join('\n')

  const evaluationPrompt = `Tu es un expert en vente chez Sixt. Évalue cette conversation entre un agent et un client ${customerType}.

CONVERSATION:
${conversation}

ÉVALUE sur 10 points:
1. ACCUEIL: Politesse, sourire dans la voix, mise en confiance
2. ARGUMENTATION: Clarté des bénéfices, adaptation au client
3. GESTION_OBJECTIONS: Techniques de réponse aux réticences
4. CLOSING: Finalisation et conclusion de la vente

RETOURNE uniquement un JSON avec:
{
  "greeting": note_sur_10,
  "argumentation": note_sur_10, 
  "objectionHandling": note_sur_10,
  "closing": note_sur_10,
  "overall": moyenne,
  "feedback": ["conseil1", "conseil2", "conseil3"]
}

Sois bienveillant mais constructif dans tes conseils.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un évaluateur expert. Réponds uniquement en JSON valide.' },
        { role: 'user', content: evaluationPrompt }
      ],
      temperature: 0.3,
      max_tokens: 400
    })

    const evaluation = JSON.parse(response.choices[0]?.message?.content || '{}')
    
    // Validation des notes
    const validatedEvaluation = {
      greeting: Math.max(1, Math.min(10, evaluation.greeting || 7)),
      argumentation: Math.max(1, Math.min(10, evaluation.argumentation || 7)),
      objectionHandling: Math.max(1, Math.min(10, evaluation.objectionHandling || 7)),
      closing: Math.max(1, Math.min(10, evaluation.closing || 7)),
      overall: 0,
      feedback: evaluation.feedback || ['Continuez vos efforts !']
    }

    // Calculer la note globale
    validatedEvaluation.overall = Math.round(
      (validatedEvaluation.greeting + validatedEvaluation.argumentation + 
       validatedEvaluation.objectionHandling + validatedEvaluation.closing) / 4
    )

    return validatedEvaluation

  } catch (error) {
    console.error('Error evaluating performance:', error)
    return {
      greeting: 7,
      argumentation: 7,
      objectionHandling: 7,
      closing: 7,
      overall: 7,
      feedback: ['Analyse indisponible, mais continuez vos efforts !']
    }
  }
}