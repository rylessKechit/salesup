import type { DailyEntry, PerformanceMetricsData } from '@/types'

// Types pour les conseils IA
export interface AIInsight {
  id: string
  type: 'success' | 'warning' | 'improvement' | 'goal'
  category: 'contracts' | 'insurance' | 'upgrades' | 'consistency' | 'revenue'
  title: string
  description: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
  impact: string
  confidence: number // 0-100
}

export interface AIAnalysis {
  overallScore: number
  trend: 'improving' | 'declining' | 'stable'
  insights: AIInsight[]
  recommendations: string[]
  nextGoals: string[]
  weakestArea: string
  strongestArea: string
}

// Données de benchmarks pour la comparaison
const INDUSTRY_BENCHMARKS = {
  insuranceRate: 75, // 75% est excellent
  upgradeRate: 40,   // 40% est excellent  
  consistencyScore: 80, // 80% de régularité
  avgUpgradePrice: 150, // 150€ par upgrade
  revenuePerContract: 200 // 200€ par contrat
}

export class PerformanceAIAnalyzer {
  
  // Analyser les performances complètes
  async analyzePerformance(
    metrics: PerformanceMetricsData, 
    recentEntries: DailyEntry[],
    historicalData?: PerformanceMetricsData[]
  ): Promise<AIAnalysis> {
    
    const insights: AIInsight[] = []
    
    // Analyser chaque aspect
    insights.push(...this.analyzeInsurancePerformance(metrics, recentEntries))
    insights.push(...this.analyzeUpgradePerformance(metrics, recentEntries))
    insights.push(...this.analyzeConsistency(metrics, recentEntries))
    insights.push(...this.analyzeRevenue(metrics, recentEntries))
    insights.push(...this.analyzeTrends(recentEntries))
    
    // Calculer le score global et la tendance
    const overallScore = this.calculateOverallScore(metrics)
    const trend = this.analyzeTrend(recentEntries)
    
    // Générer des recommandations globales
    const recommendations = this.generateRecommendations(metrics, insights)
    const nextGoals = this.suggestNextGoals(metrics)
    
    // Identifier les points forts et faibles
    const { strongestArea, weakestArea } = this.identifyStrengthsWeaknesses(metrics)
    
    return {
      overallScore,
      trend,
      insights: insights.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)),
      recommendations,
      nextGoals,
      weakestArea,
      strongestArea
    }
  }
  
  // Analyser les performances d'assurance
  private analyzeInsurancePerformance(metrics: PerformanceMetricsData, entries: DailyEntry[]): AIInsight[] {
    const insights: AIInsight[] = []
    const { insuranceRate, totalContracts } = metrics
    
    if (insuranceRate >= INDUSTRY_BENCHMARKS.insuranceRate) {
      insights.push({
        id: 'insurance-excellent',
        type: 'success',
        category: 'insurance',
        title: '🔥 Excellent Insurance Rate!',
        description: `Your ${insuranceRate.toFixed(1)}% insurance rate is outstanding - well above the industry benchmark of ${INDUSTRY_BENCHMARKS.insuranceRate}%`,
        actionItems: [
          'Maintain this excellent momentum',
          'Share your techniques with the team',
          'Focus on upgrading your existing customers'
        ],
        priority: 'low',
        impact: 'Continue your great work to maintain high revenue',
        confidence: 95
      })
    } else if (insuranceRate >= INDUSTRY_BENCHMARKS.insuranceRate * 0.8) {
      insights.push({
        id: 'insurance-good',
        type: 'improvement',
        category: 'insurance',
        title: '📈 Good Insurance Rate - Room for Growth',
        description: `Your ${insuranceRate.toFixed(1)}% insurance rate is solid, but you can reach the ${INDUSTRY_BENCHMARKS.insuranceRate}% benchmark`,
        actionItems: [
          'Ask about insurance needs during initial contact',
          'Explain benefits of each package clearly',
          'Use success stories from other clients',
          'Follow up on pending insurance decisions'
        ],
        priority: 'medium',
        impact: `Reaching ${INDUSTRY_BENCHMARKS.insuranceRate}% could increase revenue by ${this.calculatePotentialIncrease(metrics, 'insurance')}€`,
        confidence: 85
      })
    } else {
      insights.push({
        id: 'insurance-needs-work',
        type: 'warning',
        category: 'insurance',
        title: '⚠️ Insurance Rate Needs Attention',
        description: `Your ${insuranceRate.toFixed(1)}% insurance rate is below average. This is a key revenue opportunity.`,
        actionItems: [
          'Review your insurance presentation technique',
          'Practice objection handling for insurance',
          'Schedule training on insurance benefits',
          'Start every call mentioning insurance options',
          'Create a simple comparison chart for customers'
        ],
        priority: 'high',
        impact: `Improving to benchmark could increase monthly revenue by ${this.calculatePotentialIncrease(metrics, 'insurance')}€`,
        confidence: 90
      })
    }
    
    return insights
  }
  
  // Analyser les performances d'upgrade
  private analyzeUpgradePerformance(metrics: PerformanceMetricsData, entries: DailyEntry[]): AIInsight[] {
    const insights: AIInsight[] = []
    const { upgradeRate, averageUpgradePrice, totalUpgrades } = metrics
    
    if (upgradeRate >= INDUSTRY_BENCHMARKS.upgradeRate) {
      insights.push({
        id: 'upgrade-rate-excellent',
        type: 'success',
        category: 'upgrades',
        title: '🚀 Upgrade Master!',
        description: `Your ${upgradeRate.toFixed(1)}% upgrade rate is phenomenal!`,
        actionItems: [
          'Document your upgrade techniques',
          'Mentor other team members',
          'Focus on increasing upgrade values'
        ],
        priority: 'low',
        impact: 'Your upgrade skills are driving excellent revenue',
        confidence: 95
      })
    } else {
      const gap = INDUSTRY_BENCHMARKS.upgradeRate - upgradeRate
      insights.push({
        id: 'upgrade-rate-improve',
        type: 'improvement',
        category: 'upgrades',
        title: '📊 Upgrade Opportunity Detected',
        description: `You're ${gap.toFixed(1)}% away from the benchmark upgrade rate`,
        actionItems: [
          'Present upgrade options during every call',
          'Highlight upgrade benefits early',
          'Use "assumptive close" technique',
          'Create urgency with limited-time offers'
        ],
        priority: 'medium',
        impact: `Each 5% improvement could add ${(metrics.totalContracts * 0.05 * 100).toFixed(0)}€ monthly`,
        confidence: 80
      })
    }
    
    // Analyser le prix moyen des upgrades
    if (averageUpgradePrice < INDUSTRY_BENCHMARKS.avgUpgradePrice) {
      insights.push({
        id: 'upgrade-value-low',
        type: 'improvement',
        category: 'upgrades',
        title: '💰 Upgrade Value Optimization',
        description: `Your average upgrade value is ${averageUpgradePrice.toFixed(0)}€. Industry leaders average ${INDUSTRY_BENCHMARKS.avgUpgradePrice}€`,
        actionItems: [
          'Suggest premium upgrade packages first',
          'Bundle multiple upgrades together',
          'Explain long-term value, not just monthly cost',
          'Use anchoring: start with highest package'
        ],
        priority: 'medium',
        impact: `Increasing average by 20€ = ${(totalUpgrades * 20).toFixed(0)}€ extra monthly`,
        confidence: 75
      })
    }
    
    return insights
  }
  
  // Analyser la consistance
  private analyzeConsistency(metrics: PerformanceMetricsData, entries: DailyEntry[]): AIInsight[] {
    const insights: AIInsight[] = []
    const { consistencyScore } = metrics
    
    if (consistencyScore < 70) {
      insights.push({
        id: 'consistency-low',
        type: 'warning',
        category: 'consistency',
        title: '📅 Consistency is Key to Success',
        description: `Your ${consistencyScore}% consistency score indicates irregular tracking. Consistent performers earn 40% more.`,
        actionItems: [
          'Set daily reminders to fill your metrics',
          'Fill your daily entry every morning',
          'Track even zero-performance days',
          'Use the mobile app for easy access'
        ],
        priority: 'high',
        impact: 'Consistent tracking leads to consistent improvement',
        confidence: 95
      })
    } else if (consistencyScore < 85) {
      insights.push({
        id: 'consistency-medium',
        type: 'improvement',
        category: 'consistency',
        title: '⏰ Build Your Daily Habit',
        description: `Your ${consistencyScore}% consistency is good, but daily tracking creates breakthrough results`,
        actionItems: [
          'Set a specific time each day for data entry',
          'Link tracking to an existing habit (coffee, lunch)',
          'Aim for 7 days in a row to build momentum'
        ],
        priority: 'medium',
        impact: 'Perfect consistency correlates with 25% higher performance',
        confidence: 80
      })
    }
    
    return insights
  }
  
  // Analyser les revenus
  private analyzeRevenue(metrics: PerformanceMetricsData, entries: DailyEntry[]): AIInsight[] {
    const insights: AIInsight[] = []
    const { revenuePerContract, totalRevenue } = metrics
    
    if (revenuePerContract < INDUSTRY_BENCHMARKS.revenuePerContract) {
      insights.push({
        id: 'revenue-per-contract-low',
        type: 'improvement',
        category: 'revenue',
        title: '💡 Revenue Per Contract Opportunity',
        description: `At ${revenuePerContract.toFixed(0)}€ per contract, you're below the ${INDUSTRY_BENCHMARKS.revenuePerContract}€ benchmark`,
        actionItems: [
          'Always mention insurance options',
          'Suggest multiple upgrade tiers',
          'Create package deals for maximum value',
          'Follow up on pending decisions'
        ],
        priority: 'high',
        impact: `Reaching benchmark = ${((INDUSTRY_BENCHMARKS.revenuePerContract - revenuePerContract) * metrics.totalContracts).toFixed(0)}€ extra monthly`,
        confidence: 85
      })
    }
    
    return insights
  }
  
  // Analyser les tendances récentes
  private analyzeTrends(entries: DailyEntry[]): AIInsight[] {
    const insights: AIInsight[] = []
    
    if (entries.length < 5) return insights
    
    // Analyser la tendance des 5 derniers jours
    const recent = entries.slice(0, 5)
    const older = entries.slice(5, 10)
    
    if (recent.length >= 3 && older.length >= 3) {
      const recentAvg = recent.reduce((sum, e) => sum + e.contractsCount, 0) / recent.length
      const olderAvg = older.reduce((sum, e) => sum + e.contractsCount, 0) / older.length
      
      const improvement = ((recentAvg - olderAvg) / olderAvg) * 100
      
      if (improvement > 20) {
        insights.push({
          id: 'trend-improving',
          type: 'success',
          category: 'contracts',
          title: '📈 You\'re on Fire!',
          description: `Your performance is up ${improvement.toFixed(0)}% compared to last week!`,
          actionItems: [
            'Keep doing what you\'re doing!',
            'Document what changed in your approach',
            'Share your success with the team'
          ],
          priority: 'low',
          impact: 'Momentum is building - maintain this energy!',
          confidence: 90
        })
      } else if (improvement < -20) {
        insights.push({
          id: 'trend-declining',
          type: 'warning',
          category: 'contracts',
          title: '📉 Performance Dip Detected',
          description: `Your recent performance is down ${Math.abs(improvement).toFixed(0)}% from last week`,
          actionItems: [
            'Review what changed in your routine',
            'Check if you need more leads',
            'Talk to your manager about support',
            'Revisit your successful strategies'
          ],
          priority: 'high',
          impact: 'Quick action can reverse this trend',
          confidence: 85
        })
      }
    }
    
    return insights
  }
  
  // Calculer le score global
  private calculateOverallScore(metrics: PerformanceMetricsData): number {
    const weights = {
      insurance: 0.3,
      upgrade: 0.25,
      consistency: 0.2,
      revenue: 0.25
    }
    
    const scores = {
      insurance: Math.min(metrics.insuranceRate / INDUSTRY_BENCHMARKS.insuranceRate, 1) * 100,
      upgrade: Math.min(metrics.upgradeRate / INDUSTRY_BENCHMARKS.upgradeRate, 1) * 100,
      consistency: metrics.consistencyScore,
      revenue: Math.min(metrics.revenuePerContract / INDUSTRY_BENCHMARKS.revenuePerContract, 1) * 100
    }
    
    return Math.round(
      scores.insurance * weights.insurance +
      scores.upgrade * weights.upgrade +
      scores.consistency * weights.consistency +
      scores.revenue * weights.revenue
    )
  }
  
  // Analyser la tendance générale
  private analyzeTrend(entries: DailyEntry[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 6) return 'stable'
    
    const recent = entries.slice(0, 3)
    const older = entries.slice(3, 6)
    
    const recentTotal = recent.reduce((sum, e) => sum + e.totalUpgradeValue, 0)
    const olderTotal = older.reduce((sum, e) => sum + e.totalUpgradeValue, 0)
    
    const change = (recentTotal - olderTotal) / Math.max(olderTotal, 1)
    
    if (change > 0.15) return 'improving'
    if (change < -0.15) return 'declining'
    return 'stable'
  }
  
  // Générer des recommandations globales
  private generateRecommendations(metrics: PerformanceMetricsData, insights: AIInsight[]): string[] {
    const recommendations: string[] = []
    
    const highPriorityInsights = insights.filter(i => i.priority === 'high')
    
    if (highPriorityInsights.length === 0) {
      recommendations.push('🌟 You\'re performing well! Focus on consistency and small optimizations')
      recommendations.push('📚 Consider mentoring newer team members to share your expertise')
    } else {
      recommendations.push(`🎯 Priority focus: ${highPriorityInsights[0].category}`)
      recommendations.push('📅 Implement one improvement action per week for sustainable growth')
    }
    
    if (metrics.consistencyScore < 80) {
      recommendations.push('⏰ Make daily tracking your #1 habit - it drives all other improvements')
    }
    
    recommendations.push('🤝 Schedule weekly check-ins with your manager for personalized coaching')
    
    return recommendations
  }
  
  // Suggérer les prochains objectifs
  private suggestNextGoals(metrics: PerformanceMetricsData): string[] {
    const goals: string[] = []
    
    if (metrics.insuranceRate < INDUSTRY_BENCHMARKS.insuranceRate) {
      goals.push(`Reach ${INDUSTRY_BENCHMARKS.insuranceRate}% insurance rate within 2 weeks`)
    }
    
    if (metrics.upgradeRate < INDUSTRY_BENCHMARKS.upgradeRate) {
      goals.push(`Increase upgrade rate to ${INDUSTRY_BENCHMARKS.upgradeRate}% this month`)
    }
    
    if (metrics.consistencyScore < 90) {
      goals.push('Achieve 100% tracking consistency for 2 weeks straight')
    }
    
    goals.push('Beat your personal best revenue day within 1 week')
    
    return goals.slice(0, 3) // Maximum 3 goals
  }
  
  // Identifier points forts et faibles
  private identifyStrengthsWeaknesses(metrics: PerformanceMetricsData) {
    const areas = {
      'Insurance Sales': metrics.insuranceRate / INDUSTRY_BENCHMARKS.insuranceRate,
      'Upgrade Sales': metrics.upgradeRate / INDUSTRY_BENCHMARKS.upgradeRate,
      'Consistency': metrics.consistencyScore / 100,
      'Revenue Optimization': metrics.revenuePerContract / INDUSTRY_BENCHMARKS.revenuePerContract
    }
    
    const sorted = Object.entries(areas).sort((a, b) => b[1] - a[1])
    
    return {
      strongestArea: sorted[0][0],
      weakestArea: sorted[sorted.length - 1][0]
    }
  }
  
  // Calculer l'augmentation potentielle de revenus
  private calculatePotentialIncrease(metrics: PerformanceMetricsData, area: 'insurance' | 'upgrade'): number {
    if (area === 'insurance') {
      const currentInsurances = (metrics.insuranceRate / 100) * metrics.totalContracts
      const targetInsurances = (INDUSTRY_BENCHMARKS.insuranceRate / 100) * metrics.totalContracts
      return Math.round((targetInsurances - currentInsurances) * 50) // 50€ avg per insurance
    }
    return 0
  }
  
  // Pondération des priorités
  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
    }
  }
}

// Instance singleton
export const aiAnalyzer = new PerformanceAIAnalyzer()