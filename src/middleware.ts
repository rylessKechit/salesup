import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si pas de token et tentative d'accès à une page protégée
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Si utilisateur connecté
    if (token) {
      const userRole = token.role as 'agent' | 'manager'

      // Redirection depuis /login vers le bon dashboard
      if (pathname === '/login') {
        if (userRole === 'manager') {
          return NextResponse.redirect(new URL('/dashboard/admin', req.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Redirection depuis /dashboard racine
      if (pathname === '/dashboard') {
        if (userRole === 'manager') {
          return NextResponse.redirect(new URL('/dashboard/admin', req.url))
        }
        // Les agents restent sur /dashboard
      }

      // Empêcher les agents d'accéder aux pages admin
      if (pathname.startsWith('/dashboard/admin') && userRole !== 'manager') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Empêcher les managers d'aller sur le dashboard agent (optionnel)
      // if (pathname === '/dashboard' && userRole === 'manager') {
      //   return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      // }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Pages publiques
        if (pathname === '/login' || pathname === '/') {
          return true
        }

        // Pages protégées nécessitent un token
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}