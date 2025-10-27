'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RotateCcw,
  Star,
  TrendingUp,
  MessageCircle,
  Brain
} from 'lucide-react'

// Types for voice training
interface VoiceTrainingSession {
  id: string
  scenario: string
  customerType: string
  messages: Array<{
    speaker: 'agent' | 'customer'
    text: string
    timestamp: Date
  }>
  isActive: boolean
  evaluation?: {
    greeting: number
    argumentation: number
    objectionHandling: number
    closing: number
    overall: number
    feedback: string[]
  }
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number,
    [key: number]: {
      isFinal: boolean
      [key: number]: {
        transcript: string
        confidence: number
      }
    }
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function VoiceTrainer() {
  const [session, setSession] = useState<VoiceTrainingSession | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const recognition = useRef<SpeechRecognition | null>(null)
  const synthesis = useRef<SpeechSynthesis | null>(null)

  // Check voice APIs support
  useEffect(() => {
    const speechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const speechSynthesisSupported = 'speechSynthesis' in window
    
    setIsSupported(speechRecognitionSupported && speechSynthesisSupported)
    
    if (speechSynthesisSupported) {
      synthesis.current = window.speechSynthesis
    }
  }, [])

  // Initialize speech recognition
  const initializeRecognition = () => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const newRecognition = new SpeechRecognition()
    
    newRecognition.continuous = false
    newRecognition.interimResults = true
    newRecognition.lang = 'en-US'

    let finalTranscript = '' // ✅ Variable locale pour stocker le transcript final

    newRecognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      finalTranscript = '' // Reset

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Afficher le transcript en cours
      setCurrentTranscript(finalTranscript + interimTranscript)
      console.log('🎤 Current transcript:', finalTranscript + interimTranscript)
    }

    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event)
      setError('Speech recognition error')
      setIsListening(false)
    }

    // ✅ FIX: Utiliser le transcript final capturé
    newRecognition.onend = () => {
      console.log('🎤 Recognition ended, final transcript:', finalTranscript)
      setIsListening(false)
      setCurrentTranscript('') // Reset l'affichage
      
      if (finalTranscript.trim()) {
        console.log('✅ Sending final transcript to handleAgentResponse')
        handleAgentResponse(finalTranscript.trim())
      } else {
        console.log('⚠️ Empty final transcript, not sending')
      }
    }

    return newRecognition
  }

  // Start new training session
  const startTraining = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/voice-training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Error starting training')

      const data = await response.json()
      
      const newSession: VoiceTrainingSession = {
        id: data.sessionId,
        scenario: data.scenario,
        customerType: data.customerType,
        messages: [],
        isActive: true
      }

      setSession(newSession)
      
      // Make AI customer speak
      speakText(data.initialMessage)
      
      // Add message to history
      addMessage('customer', data.initialMessage)

    } catch (err) {
      setError('Unable to start training')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle agent response
  const handleAgentResponse = async (transcript: string) => {
    if (!session || !session.isActive) return

    console.log('🎤 Agent says:', transcript)
    addMessage('agent', transcript)
    setIsLoading(true)

    try {
      console.log('📡 Sending to API...')
      const response = await fetch('/api/ai/voice-training/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          agentMessage: transcript
        })
      })

      if (!response.ok) throw new Error('Response error')

      const data = await response.json()
      console.log('📋 API response:', data)
      
      if (data.customerResponse) {
        console.log('🤖 Customer will respond:', data.customerResponse)
        // Wait a bit before customer response
        setTimeout(() => {
          console.log('🔊 Starting speech synthesis...')
          speakText(data.customerResponse)
          addMessage('customer', data.customerResponse)
        }, 1000)
      }

      if (data.sessionEnded) {
        console.log('✅ Session ended')
        endSession(data.evaluation)
      }

    } catch (err) {
      console.error('❌ Conversation error:', err)
      setError('Error during conversation')
    } finally {
      setIsLoading(false)
    }
  }

  // Add message to session
  const addMessage = (speaker: 'agent' | 'customer', text: string) => {
    if (!session) return

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, {
        speaker,
        text,
        timestamp: new Date()
      }]
    } : null)
  }

  // Make AI speak
  const speakText = (text: string) => {
    console.log('🔊 speakText called with:', text)
    
    if (!synthesis.current) {
      console.error('❌ synthesis.current is null')
      return
    }

    // Stop any ongoing synthesis
    synthesis.current.cancel()
    
    setIsSpeaking(true)
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => {
      console.log('▶️ Synthesis started')
    }

    utterance.onend = () => {
      console.log('⏹️ Synthesis ended')
      setIsSpeaking(false)
    }
    
    utterance.onerror = (e) => {
      console.error('❌ Synthesis error:', e)
      setIsSpeaking(false)
      setError('Speech synthesis error')
    }

    console.log('🎵 Launching speak()')
    synthesis.current.speak(utterance)
  }

  // Toggle listening
  const toggleListening = () => {
    if (!recognition.current) {
      recognition.current = initializeRecognition()
    }

    if (isListening) {
      recognition.current?.stop()
      setIsListening(false)
    } else {
      setCurrentTranscript('')
      recognition.current?.start()
      setIsListening(true)
    }
  }

  // End session
  const endSession = (evaluation?: any) => {
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        isActive: false,
        evaluation
      } : null)
    }
    setIsListening(false)
    setIsSpeaking(false)
  }

  // Reset training
  const resetTraining = () => {
    setSession(null)
    setIsListening(false)
    setIsSpeaking(false)
    setError(null)
    setCurrentTranscript('')
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Browser not compatible</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Your browser doesn't support the required voice features. 
              Please use Chrome, Safari or recent Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-6 w-6 text-primary" />
                AI Voice Training
              </CardTitle>
              <CardDescription>
                Practice your sales techniques with virtual customers
              </CardDescription>
            </div>
            
            {session && (
              <Badge variant={session.isActive ? 'default' : 'secondary'}>
                {session.isActive ? 'Active' : 'Completed'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!session ? (
            // Start interface
            <div className="text-center py-8">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready for training?</h3>
              <p className="text-gray-600 mb-6">
                AI will generate a surprise scenario. You'll discover the customer type by talking.
              </p>
              
              <Button 
                onClick={startTraining} 
                disabled={isLoading}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Generating scenario...' : 'Start Training'}
              </Button>
            </div>
          ) : (
            // Conversation interface
            <div className="space-y-4">
              {/* Session info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Scenario: {session.scenario}</p>
                    <p className="text-sm text-blue-700">Customer type: {session.customerType}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {session.isActive && (
                      <Button
                        onClick={toggleListening}
                        disabled={isSpeaking || isLoading}
                        variant={isListening ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {isListening ? (
                          <>
                            <MicOff className="mr-2 h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Speak
                          </>
                        )}
                      </Button>
                    )}

                    {/* Test audio button */}
                    <Button
                      onClick={() => speakText('Audio test successful in English')}
                      disabled={isSpeaking}
                      variant="outline"
                      size="sm"
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Test English Audio
                    </Button>
                    
                    <Button onClick={resetTraining} variant="outline" size="sm">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current transcript */}
              {(isListening || currentTranscript) && (
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                  <div className="flex items-center">
                    <Mic className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      {isListening ? 'You are speaking...' : 'Message recorded'}
                    </span>
                  </div>
                  {currentTranscript && (
                    <p className="text-green-700 mt-1 italic">"{currentTranscript}"</p>
                  )}
                </div>
              )}

              {/* Speech synthesis indicator */}
              {isSpeaking && (
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 text-orange-600 mr-2 animate-pulse" />
                    <span className="text-sm font-medium text-orange-800">
                      Customer is speaking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation history */}
      {session && session.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* ✅ Reverse order - newest first */}
              {session.messages.slice().reverse().map((message, index) => (
                <div
                  key={session.messages.length - 1 - index} // Adjust key for stability
                  className={`p-3 rounded-lg ${
                    message.speaker === 'agent'
                      ? 'bg-blue-50 border-l-4 border-blue-400 ml-8'
                      : 'bg-gray-50 border-l-4 border-gray-400 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      message.speaker === 'agent' ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {message.speaker === 'agent' ? 'You' : 'Customer'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={message.speaker === 'agent' ? 'text-blue-700' : 'text-gray-700'}>
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final evaluation */}
      {session && session.evaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Your performance evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.evaluation.greeting}/10
                </div>
                <div className="text-sm text-gray-600">Greeting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.evaluation.argumentation}/10
                </div>
                <div className="text-sm text-gray-600">Argumentation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.evaluation.objectionHandling}/10
                </div>
                <div className="text-sm text-gray-600">Objections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {session.evaluation.overall}/10
                </div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
            </div>

            {session.evaluation.feedback && session.evaluation.feedback.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Tips to improve:</h4>
                <ul className="space-y-2">
                  {session.evaluation.feedback.map((feedback, index) => (
                    <li key={index} className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feedback}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}