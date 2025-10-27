import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { VoiceTrainer } from '@/components/ai/VoiceTrainer';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Mic, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VoiceTrainingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const userData = {
    firstName: session.user.name?.split(' ')[0] || 'Agent',
    lastName: session.user.name?.split(' ')[1] || 'User',
    role: session.user.role,
    email: session.user.email || ''
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={userData} />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎤 AI Voice Training
            </h1>
            <p className="text-gray-600 mt-1">
              Practice your sales techniques with virtual customers
            </p>
          </div>
        </div>

        {/* How it works guide */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Brain className="mr-2 h-5 w-5" />
              How does it work?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">1. Surprise scenario</h3>
                <p className="text-sm text-blue-700">
                  AI generates a customer and situation that you discover by talking
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">2. Natural conversation</h3>
                <p className="text-sm text-blue-700">
                  Speak naturally with the virtual customer who reacts in real-time
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">3. AI evaluation</h3>
                <p className="text-sm text-blue-700">
                  Receive a score and personalized advice to improve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice training component */}
        <VoiceTrainer />

        {/* Usage tips */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <Lightbulb className="mr-2 h-5 w-5" />
              💡 Tips for effective training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Technical setup:</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Use Chrome, Safari or recent Edge
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Allow microphone access
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Choose a quiet environment
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Enable sound to hear the customer
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Sales strategies:</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Always start with active listening
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Offer insurance and upgrades naturally
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Handle objections with empathy
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    End with summary and confirmation
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Possible customer types */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900">Possible customer types</CardTitle>
            <CardDescription>
              AI can generate different profiles to test your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: '⏰ Rushed customer', desc: 'Wants to pick up car quickly' },
                { type: '💰 Budget customer', desc: 'Negotiates every euro, refuses options' },
                { type: '👔 Business customer', desc: 'Prefers comfort and premium insurance' },
                { type: '👨‍👩‍👧‍👦 Family customer', desc: 'Focuses on safety and space for children' },
                { type: '❌ Reluctant customer', desc: 'Suspicious, systematically refuses everything' },
                { type: '🔀 Complex situation', desc: 'Booking problem or complaint' }
              ].map((client, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">{client.type}</h4>
                  <p className="text-sm text-gray-600">{client.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            🔒 Your training conversations are private and not stored. 
            They are only used for real-time evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}