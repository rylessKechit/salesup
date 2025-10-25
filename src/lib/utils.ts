import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Configuration des packages d'assurance SIXT
export const INSURANCE_PACKAGES = {
  'Basic': ['LD'] as InsuranceCode[],
  'Smart': ['LD', 'BF'] as InsuranceCode[],
  'All Inclusive': ['LD', 'BF', 'TG', 'BC', 'BQ'] as InsuranceCode[]
}

// Types pour les packages d'assurance
export type InsurancePackageType = keyof typeof INSURANCE_PACKAGES
export type InsuranceCode = 'LD' | 'BF' | 'TG' | 'BC' | 'BQ'

// Calcul du score de performance
export function calculatePerformanceScore(metrics: {
  insuranceRate: number
  upgradeRate: number
  averageUpgradePrice: number
  revenuePerContract: number
  consistencyScore: number
}): number {
  const weights = {
    insuranceRate: 0.35,
    upgradeRate: 0.25,
    averageUpgradePrice: 0.20,
    revenuePerContract: 0.10,
    consistencyScore: 0.10
  }

  // Normalisation des valeurs (à adapter selon tes seuils)
  const normalized = {
    insuranceRate: Math.min(metrics.insuranceRate / 80, 1), // 80% = score max
    upgradeRate: Math.min(metrics.upgradeRate / 50, 1), // 50% = score max
    averageUpgradePrice: Math.min(metrics.averageUpgradePrice / 100, 1), // 100€ = score max
    revenuePerContract: Math.min(metrics.revenuePerContract / 500, 1), // 500€ = score max
    consistencyScore: metrics.consistencyScore
  }

  const score = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (normalized[key as keyof typeof normalized] * weight * 100)
  }, 0)

  return Math.round(Math.min(score, 100))
}

// Calcul du taux d'assurance basé sur les packages vendus
export function calculateInsuranceRate(
  contractsCount: number,
  insurancePackages: Array<{ packageType: InsurancePackageType; count: number }>
): number {
  if (contractsCount === 0) return 0
  
  const totalInsurancesSold = insurancePackages.reduce((sum, pkg) => sum + pkg.count, 0)
  return (totalInsurancesSold / contractsCount) * 100
}

// Validation des codes d'assurance
export function validateInsuranceCodes(packageType: InsurancePackageType, codes: InsuranceCode[]): boolean {
  const expectedCodes = INSURANCE_PACKAGES[packageType]
  return expectedCodes.every(code => codes.includes(code)) && 
         codes.every(code => expectedCodes.includes(code))
}

// Formatage des montants
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Formatage des pourcentages
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
}

// Génération d'un score de consistance basé sur l'historique
export function calculateConsistencyScore(dailyEntries: number[], targetDays: number = 30): number {
  if (dailyEntries.length === 0) return 0
  
  const completionRate = dailyEntries.length / targetDays
  const variance = dailyEntries.length > 1 
    ? Math.sqrt(dailyEntries.reduce((sum, score, _, arr) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length
        return sum + Math.pow(score - mean, 2)
      }, 0) / (dailyEntries.length - 1))
    : 0
  
  // Score basé sur la régularité (70%) et la constance des performances (30%)
  const regularityScore = Math.min(completionRate, 1)
  const stabilityScore = Math.max(0, 1 - (variance / 50)) // Variance normalisée
  
  return Math.round((regularityScore * 0.7 + stabilityScore * 0.3) * 100)
}

// Helper pour obtenir les détails d'un package
export function getPackageDetails(packageType: InsurancePackageType) {
  return {
    type: packageType,
    codes: INSURANCE_PACKAGES[packageType],
    description: getPackageDescription(packageType)
  }
}

function getPackageDescription(packageType: InsurancePackageType): string {
  switch (packageType) {
    case 'Basic':
      return 'Essential liability damage coverage'
    case 'Smart':
      return 'Liability damage + breakdown coverage'
    case 'All Inclusive':
      return 'Complete protection package with all coverages'
    default:
      return ''
  }
}