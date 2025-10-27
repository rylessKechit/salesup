# 🚗 SalesUp - Smart Sales Performance Platform

> **Une plateforme intelligente de coaching commercial pour les agents de location de véhicules**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-blue?logo=openai)](https://openai.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Utilisation](#-utilisation)
- [🤖 Module IA](#-module-ia)
- [📊 Système de scoring](#-système-de-scoring)
- [🔐 Sécurité](#-sécurité)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🎯 À propos

SalesUp est une plateforme web intelligente conçue pour les agents de location de véhicules. Elle permet aux commerciaux de suivre leurs performances quotidiennes, recevoir des conseils personnalisés générés par IA, et comparer leurs progrès avec les objectifs d'équipe.

### 🎭 Rôles utilisateurs

- **👤 Agent** : Saisie des données, consultation des statistiques, réception de conseils IA
- **👨‍💼 Manager** : Gestion des équipes, définition d'objectifs, exports de rapports
- **🤖 Système** : Automatisations, génération de feedback IA, rapports programmés

## ✨ Fonctionnalités

### Pour les Agents

- 📝 **Saisie quotidienne simplifiée** des performances
- 🎯 **Score personnel** sur 100 points avec détail des métriques
- 🤖 **Conseils IA personnalisés** avec actions concrètes
- 📈 **Tableaux de bord** interactifs avec évolution temporelle
- 🏆 **Comparaison** avec les moyennes d'équipe (anonymisée)

### Pour les Managers

- 📊 **Dashboard équipe** avec métriques consolidées
- 🎯 **Gestion des objectifs** globaux et individuels
- 📋 **Exports automatisés** (PDF, CSV, Excel)
- 👥 **Gestion des utilisateurs** et permissions
- 📈 **Analytics avancées** de performance

### Automatisations

- ⏰ **Rappels quotidiens** à 20h00 pour la saisie
- 📨 **Rapports hebdomadaires** automatiques (dimanche 20h00)
- 🔄 **Génération et cache** des conseils IA
- 🏅 **Calcul automatique** des scores et classements

## 🏗️ Architecture

### Stack Technologique

```
Frontend     │ Next.js 14 + React + Tailwind CSS + Framer Motion
Backend      │ Next.js API Routes
Database     │ MongoDB Atlas + Mongoose
Auth         │ NextAuth.js (Magic Link)
AI           │ OpenAI API (GPT-4o-mini)
Email        │ Nodemailer
Reports      │ xlsx + pdfkit
Hosting      │ Vercel
Scheduler    │ Vercel Cron Jobs
```

### Structure du projet

```
salesup/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Pages d'authentification
│   │   ├── dashboard/      # Dashboards agent/manager
│   │   └── advice/         # Pages de conseils IA
│   ├── components/         # Composants React réutilisables
│   ├── lib/               # Utilitaires et configurations
│   ├── models/            # Modèles MongoDB
│   └── types/             # Types TypeScript
├── public/                # Assets statiques
├── docs/                  # Documentation
└── tests/                 # Tests unitaires et e2e
```

## 🚀 Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn
- Compte MongoDB Atlas
- Clé API OpenAI
- Compte email SMTP

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-org/salesup.git
cd salesup

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer la base de données
npm run db:setup

# Lancer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement

Créer un fichier `.env.local` avec les variables suivantes :

```env
# Base de données
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/salesup

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Vercel (production)
VERCEL_URL=https://your-app.vercel.app
```

### Configuration MongoDB

```javascript
// lib/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur MongoDB:", error);
  }
};
```

## 🔧 Utilisation

### Commandes disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript

# Base de données
npm run db:setup     # Initialisation DB
npm run db:seed      # Données de test
npm run db:migrate   # Migrations

# Tests
npm run test         # Tests unitaires
npm run test:e2e     # Tests end-to-end
npm run test:watch   # Tests en mode watch

# Déploiement
npm run deploy       # Déploiement Vercel
```

### Première utilisation

1. **Créer un compte manager** via l'interface d'inscription
2. **Configurer les objectifs** dans le dashboard manager
3. **Inviter les agents** via email
4. **Commencer la saisie** des données quotidiennes

## 🤖 Module IA

### Configuration OpenAI

Le module IA utilise GPT-4o-mini pour générer des conseils personnalisés :

```javascript
// lib/openai.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAdvice = async (performanceData) => {
  const prompt = `
    Vous êtes SalesUp, un coach commercial IA pour conseillers location automobile.
    Analysez les métriques suivantes et fournissez des conseils concis, motivants et actionnables.
    
    Données: ${JSON.stringify(performanceData)}
    
    Format de réponse:
    - 3 actions concrètes
    - 1 script de vente
    - 1 conseil objections
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};
```

### Données analysées par l'IA

```typescript
interface PerformanceData {
  contracts: number; // Nombre de contrats
  revenue: number; // Chiffre d'affaires
  insuranceRate: number; // Taux d'assurance (%)
  upgradeRate: number; // Taux d'upgrade (%)
  avgUpgradePrice: number; // Prix moyen upgrade
  packageMix: {
    // Répartition packages
    basic: number;
    smart: number;
    allInclusive: number;
  };
}
```

## 📊 Système de scoring

### Pondération des métriques (100 points max)

| Métrique             | Poids | Justification                         |
| -------------------- | ----- | ------------------------------------- |
| Taux d'assurance     | 35%   | Métrique prioritaire de profitabilité |
| Taux d'upgrade       | 25%   | Indicateur de qualité commerciale     |
| Prix moyen upgrade   | 20%   | Maximisation valeur client            |
| Revenus par contrat  | 10%   | Performance financière globale        |
| Streak de régularité | 10%   | Encouragement de la constance         |

### Calcul du score

```javascript
// lib/scoring.js
export const calculateScore = (performance) => {
  const weights = {
    insuranceRate: 0.35,
    upgradeRate: 0.25,
    avgUpgradePrice: 0.2,
    revenuePerContract: 0.1,
    consistencyStreak: 0.1,
  };

  // Normalisation des métriques (0-100)
  const normalized = normalizeMetrics(performance);

  // Calcul score pondéré
  const score = Object.entries(weights).reduce((total, [metric, weight]) => {
    return total + normalized[metric] * weight;
  }, 0);

  return Math.round(score);
};
```

### Packages et assurances

```javascript
// Codes d'assurance
const INSURANCE_CODES = ["LD", "BF", "BC", "BQ", "TG"];

// Packages disponibles
const PACKAGES = {
  basic: ["LD"], // Responsabilité civile
  smart: ["LD", "BF"], // + Bris de glace
  allInclusive: ["LD", "BF", "TG", "BC", "BQ"], // Couverture complète
};
```

## 🔐 Sécurité

### Mesures implémentées

- 🔒 **JWT sécurisés** dans cookies httpOnly
- 🔐 **Hachage bcrypt** pour les mots de passe
- 🛡️ **Chiffrement MongoDB** au niveau des champs
- 🌐 **HTTPS enforced** en production
- 🔑 **Magic Link auth** sans mot de passe
- 🛂 **Validation** côté client et serveur

### Configuration sécurité

```javascript
// middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware de sécurité
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Logique d'autorisation
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

## 🧪 Tests

### Structure des tests

```
tests/
├── unit/              # Tests unitaires
│   ├── components/    # Tests composants React
│   ├── api/          # Tests API routes
│   └── lib/          # Tests utilitaires
├── integration/       # Tests d'intégration
├── e2e/              # Tests end-to-end (Playwright)
└── fixtures/         # Données de test
```

### Commandes de test

```bash
# Tests unitaires (Jest)
npm run test

# Tests e2e (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage

# Tests spécifiques
npm run test -- --testNamePattern="scoring"
```

## 📚 Documentation

### Documentation API

L'API REST est documentée avec OpenAPI/Swagger :

- **Endpoints** : `/api/docs`
- **Playground** : `/api/playground`

### Endpoints principaux

```
GET    /api/performance        # Récupérer performances
POST   /api/performance        # Créer performance
GET    /api/advice/:id         # Récupérer conseil IA
POST   /api/reports/export     # Exporter rapport
GET    /api/admin/team         # Métriques équipe
```

### Guides utilisateur

- 📖 [Guide Agent](docs/agent-guide.md)
- 👨‍💼 [Guide Manager](docs/manager-guide.md)
- 🔧 [Guide Admin](docs/admin-guide.md)
- 🚀 [Guide Déploiement](docs/deployment.md)

## 🤝 Contribution

### Workflow de développement

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de code

- **ESLint** + **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **TypeScript strict** mode activé
- **Tests** requis pour toute nouvelle fonctionnalité

### Code de conduite

Merci de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md) dans toutes vos interactions.

## 📈 Monitoring et Analytics

### Métriques surveillées

- ⚡ **Performance** : Core Web Vitals, temps de réponse API
- 🐛 **Erreurs** : Crash reporting, logs d'erreur
- 👥 **Usage** : Adoption utilisateur, engagement
- 💰 **Business** : ROI, amélioration des performances

### Outils utilisés

- **Vercel Analytics** pour les métriques web
- **Sentry** pour le monitoring d'erreurs
- **MongoDB Charts** pour les analytics business

## 🚢 Déploiement

### Déploiement Vercel (Recommandé)

```bash
# Installation Vercel CLI
npm install -g vercel

# Déploiement
vercel --prod

# Configuration des variables d'environnement
vercel env add MONGODB_URI
vercel env add OPENAI_API_KEY
```

### Déploiement Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Métriques de succès

- 📈 **Adoption** : >80% après 1 mois
- 🎯 **Performance** : +15% score moyen après 3 mois
- 😊 **Satisfaction** : >4/5 rating utilisateur
- ⚡ **Efficacité** : <2 min temps de saisie quotidien
- 💰 **ROI** : Positif dans les 6 mois

## 📞 Support

- 🐛 **Bugs** : [Créer une issue](https://github.com/votre-org/salesup/issues)
- 💬 **Questions** : [Discussions GitHub](https://github.com/votre-org/salesup/discussions)
- 📧 **Contact** : salesup-support@votre-org.com

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## ⚠️ Disclaimer

> **SalesUp est un prototype de coaching interne, non un produit officiel Sixt.**

---

<div align="center">

**Fait avec ❤️ par l'équipe SalesUp**

[🌟 Star ce projet](https://github.com/votre-org/salesup) • [🐛 Reporter un bug](https://github.com/votre-org/salesup/issues) • [💡 Demander une feature](https://github.com/votre-org/salesup/issues)

</div>
