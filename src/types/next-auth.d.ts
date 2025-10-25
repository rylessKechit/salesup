import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'agent' | 'manager'
      firstName: string
      lastName: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: 'agent' | 'manager'
    firstName: string
    lastName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'agent' | 'manager'
    firstName?: string
    lastName?: string
  }
}