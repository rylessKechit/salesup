import { Header } from './Header'
import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  user?: {
    firstName: string
    lastName: string
    role: 'agent' | 'manager'
    email: string
  }
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}