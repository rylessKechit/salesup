'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { INSURANCE_PACKAGES } from '@/lib/utils'

// Form validation schema
const dailyEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  contractsCount: z.number().min(0, 'Must be 0 or more').max(50, 'Seems too high, please verify'),
  totalRevenue: z.number().min(0, 'Must be 0 or more'),
  upgradeRate: z.number().min(0, 'Must be 0 or more').max(100, 'Cannot exceed 100%'),
  averageUpgradePrice: z.number().min(0, 'Must be 0 or more'),
  insurancePackages: z.array(z.object({
    packageType: z.enum(['Basic', 'Smart', 'All Inclusive']),
    count: z.number().min(0)
  }))
})

type DailyEntryFormData = z.infer<typeof dailyEntrySchema>

interface DailyEntryFormProps {
  onSubmit: (data: DailyEntryFormData) => void
  isLoading?: boolean
  initialData?: Partial<DailyEntryFormData>
}

export function DailyEntryForm({ onSubmit, isLoading = false, initialData }: DailyEntryFormProps) {
  const [showCalculatedMetrics, setShowCalculatedMetrics] = useState(false)
  
  const form = useForm<DailyEntryFormData>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      contractsCount: 0,
      totalRevenue: 0,
      upgradeRate: 0,
      averageUpgradePrice: 0,
      insurancePackages: [
        { packageType: 'Basic', count: 0 },
        { packageType: 'Smart', count: 0 },
        { packageType: 'All Inclusive', count: 0 }
      ],
      ...initialData
    }
  })

  const watchedValues = form.watch()
  
  // Calculate derived metrics
  const calculatedMetrics = {
    totalInsurancePackages: watchedValues.insurancePackages?.reduce((sum, pkg) => sum + pkg.count, 0) || 0,
    insuranceRate: watchedValues.contractsCount > 0 
      ? ((watchedValues.insurancePackages?.reduce((sum, pkg) => sum + pkg.count, 0) || 0) / watchedValues.contractsCount * 100)
      : 0,
    revenuePerContract: watchedValues.contractsCount > 0 
      ? (watchedValues.totalRevenue / watchedValues.contractsCount)
      : 0
  }

  const handleSubmit = (data: DailyEntryFormData) => {
    onSubmit(data)
  }

  const updateInsurancePackage = (packageType: 'Basic' | 'Smart' | 'All Inclusive', count: number) => {
    const currentPackages = form.getValues('insurancePackages')
    const updatedPackages = currentPackages.map(pkg => 
      pkg.packageType === packageType ? { ...pkg, count } : pkg
    )
    form.setValue('insurancePackages', updatedPackages)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Daily Performance Entry
        </CardTitle>
        <CardDescription>
          Enter your daily sales metrics to track performance and get AI feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Date and Basic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractsCount">Number of Contracts</Label>
              <Input
                id="contractsCount"
                type="number"
                min="0"
                placeholder="0"
                {...form.register('contractsCount', { valueAsNumber: true })}
              />
              {form.formState.errors.contractsCount && (
                <p className="text-sm text-red-600">{form.formState.errors.contractsCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRevenue">Total Revenue (€)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="totalRevenue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  {...form.register('totalRevenue', { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.totalRevenue && (
                <p className="text-sm text-red-600">{form.formState.errors.totalRevenue.message}</p>
              )}
            </div>
          </div>

          {/* Insurance Packages */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Insurance Packages Sold</Label>
              <p className="text-sm text-gray-600">Enter the number of each insurance package type sold</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {form.getValues('insurancePackages').map((pkg, index) => (
                <Card key={pkg.packageType} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{pkg.packageType}</h4>
                      <Badge variant="outline" className="text-xs">
                        {INSURANCE_PACKAGES[pkg.packageType].join(', ')}
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={pkg.count}
                      onChange={(e) => updateInsurancePackage(pkg.packageType, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Upgrade Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="upgradeRate">Upgrade Rate (%)</Label>
              <Input
                id="upgradeRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0.0"
                {...form.register('upgradeRate', { valueAsNumber: true })}
              />
              {form.formState.errors.upgradeRate && (
                <p className="text-sm text-red-600">{form.formState.errors.upgradeRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageUpgradePrice">Average Upgrade Price (€)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="averageUpgradePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  {...form.register('averageUpgradePrice', { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.averageUpgradePrice && (
                <p className="text-sm text-red-600">{form.formState.errors.averageUpgradePrice.message}</p>
              )}
            </div>
          </div>

          {/* Calculated Metrics Preview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Calculated Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {calculatedMetrics.insuranceRate.toFixed(1)}%
                </p>
                <p className="text-sm text-blue-600">Insurance Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  €{calculatedMetrics.revenuePerContract.toFixed(0)}
                </p>
                <p className="text-sm text-blue-600">Revenue per Contract</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {calculatedMetrics.totalInsurancePackages}
                </p>
                <p className="text-sm text-blue-600">Insurance Packages Sold</p>
              </div>
            </CardContent>
          </Card>

          {/* Validation Summary */}
          {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save & Get AI Feedback
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}