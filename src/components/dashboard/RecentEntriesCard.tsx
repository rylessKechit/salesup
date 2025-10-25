'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Shield,
  FileText,
  RefreshCw
} from 'lucide-react'
import type { RecentEntriesCardProps, DailyEntry } from '@/types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function RecentEntriesCard({ entries, onRefresh }: RecentEntriesCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTotalInsurancePackages = (packages: DailyEntry['insurancePackages']) => {
    return packages.reduce((sum, pkg) => sum + pkg.count, 0)
  }

  const getInsuranceRate = (contractsCount: number, packages: DailyEntry['insurancePackages']) => {
    if (contractsCount === 0) return 0
    const totalInsurances = getTotalInsurancePackages(packages)
    return (totalInsurances / contractsCount) * 100
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Recent Entries
          </CardTitle>
          <CardDescription>
            Your recent daily performance entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No entries found</p>
            <p className="text-sm text-gray-400">Start by creating your first daily entry</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Entries
            </CardTitle>
            <CardDescription>
              Your last {entries.length} daily performance entries
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contracts</TableHead>
                <TableHead>Upgrades</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Insurance Rate</TableHead>
                <TableHead>Packages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const insuranceRate = getInsuranceRate(entry.contractsCount, entry.insurancePackages)
                const totalPackages = getTotalInsurancePackages(entry.insurancePackages)
                
                return (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{formatDate(entry.date)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-blue-500" />
                        <span>{entry.contractsCount}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>{entry.upgradesCount}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-3 w-3 text-yellow-500" />
                        <span>{formatCurrency(entry.totalUpgradeValue)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3 text-purple-500" />
                        <Badge 
                          variant={
                            insuranceRate >= 70 ? 'default' :
                            insuranceRate >= 50 ? 'secondary' :
                            'outline'
                          }
                        >
                          {insuranceRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.insurancePackages
                          .filter(pkg => pkg.count > 0)
                          .map((pkg, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {pkg.packageType}: {pkg.count}
                            </Badge>
                          ))
                        }
                        {totalPackages === 0 && (
                          <span className="text-xs text-gray-400">No packages</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {entries.reduce((sum, entry) => sum + entry.contractsCount, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Contracts</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {entries.reduce((sum, entry) => sum + entry.upgradesCount, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Upgrades</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.totalUpgradeValue, 0))}
            </div>
            <div className="text-xs text-gray-600">Total Revenue</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {entries.reduce((sum, entry) => sum + getTotalInsurancePackages(entry.insurancePackages), 0)}
            </div>
            <div className="text-xs text-gray-600">Total Packages</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}