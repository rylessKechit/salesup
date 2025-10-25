'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      const userRole = (session.user as any).role
      if (userRole === 'manager') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-sixt-black mb-4">
          SalesUp
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Performance Tracker for Rental Agents
        </p>
        <div className="space-x-4">
          <Link 
            href="/login"
            className="bg-sixt-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
        
        {/* Info section pour le développement */}
        <div className="mt-12 text-sm text-gray-500">
          <p>🚀 SalesUp Development Mode</p>
          <p>Managers → Admin Dashboard | Agents → Agent Dashboard</p>
        </div>
      </div>
    </div>
  )
}