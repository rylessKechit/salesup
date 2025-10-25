/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Next.js 14+ avec app directory
  experimental: {
    // Activer les Server Components (par défaut en Next.js 14+)
    serverComponentsExternalPackages: ['mongodb', 'bcryptjs'],
  },

  // Configuration pour NextAuth
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Optimisations des images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuration webpack pour les packages problématiques
  webpack: (config, { isServer }) => {
    // Fix pour MongoDB dans l'environnement client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    // Exclure les packages serveur du bundle client
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push('mongodb', 'bcryptjs')
    }

    return config
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // Redirections utiles
  async redirects() {
    return [
      // Redirection de /admin vers /dashboard/admin
      {
        source: '/admin',
        destination: '/dashboard/admin',
        permanent: true,
      },
      // Redirection de /manager vers /dashboard/admin
      {
        source: '/manager',
        destination: '/dashboard/admin',
        permanent: true,
      },
    ]
  },

  // Configuration TypeScript
  typescript: {
    // Ignorer les erreurs TypeScript en production (déconseillé pour le développement)
    ignoreBuildErrors: false,
  },

  // Configuration ESLint
  eslint: {
    // Ignorer les erreurs ESLint en production (déconseillé pour le développement)
    ignoreDuringBuilds: false,
  },

  // Optimisations de bundle
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuration des variables d'environnement publiques
  publicRuntimeConfig: {
    // Variables accessibles côté client
  },

  // Configuration des variables d'environnement serveur
  serverRuntimeConfig: {
    // Variables accessibles uniquement côté serveur
    mongodbUri: process.env.MONGODB_URI,
    nextauthSecret: process.env.NEXTAUTH_SECRET,
  },

  // Configuration pour les déploiements
  output: 'standalone',

  // Optimisations diverses
  swcMinify: true,
  compress: true,

  // Configuration des rewrites pour l'API
  async rewrites() {
    return [
      // Pas de rewrites nécessaires pour l'instant
    ]
  },
}

module.exports = nextConfig