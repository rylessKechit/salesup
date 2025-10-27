'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateDailyEntry } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, Plus, Minus, Save, CheckCircle } from 'lucide-react'

// Types d'assurances
type InsurancePackageType = 'Basic' | 'Smart' | 'All Inclusive'

// Schema de validation
const dailyEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  contractsCount: z.number().min(0, 'Must be a positive number'),
  upgradesCount: z.number().min(0, 'Must be a positive number'),
  totalUpgradeValue: z.number().min(0, 'Must be a positive number'),
  notes: z.string().optional()
})

type DailyEntryFormData = z.infer<typeof dailyEntrySchema>

interface InsuranceEntry {
  packageType: InsurancePackageType
  count: number
  value: number
}

interface DailyEntryFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function DailyEntryForm({ initialData, onSuccess }: DailyEntryFormProps) {
  // ✅ Correction: utiliser 'create' du hook
  const { create: createEntry, loading, error } = useCreateDailyEntry()
  const [success, setSuccess] = useState(false)
  const [insurancePackages, setInsurancePackages] = useState<InsuranceEntry[]>([
    { packageType: 'Basic', count: 0, value: 0 },
    { packageType: 'Smart', count: 0, value: 0 },
    { packageType: 'All Inclusive', count: 0, value: 0 }
  ])

  const form = useForm<DailyEntryFormData>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      contractsCount: initialData?.contractsCount || 0,
      upgradesCount: initialData?.upgradesCount || 0,
      totalUpgradeValue: initialData?.totalUpgradeValue || 0,
      notes: initialData?.notes || ''
    }
  })

  // Initialiser les packages d'assurance si des données existent
  React.useEffect(() => {
    if (initialData?.insurancePackages) {
      const packages = ['Basic', 'Smart', 'All Inclusive'].map(packageType => {
        const existing = initialData.insurancePackages.find((p: any) => p.packageType === packageType)
        return {
          packageType: packageType as InsurancePackageType,
          count: existing?.count || 0,
          value: existing?.value || 0
        }
      })
      setInsurancePackages(packages)
    }
  }, [initialData])

  const updateInsurancePackage = (index: number, field: 'count' | 'value', value: number) => {
    setInsurancePackages(prev => 
      prev.map((pkg, i) => i === index ? 
        { ...pkg, [field]: Math.max(0, value) } : pkg)
    )
  }

  const handleSubmit = async (data: DailyEntryFormData) => {
    try {
      setSuccess(false)
      
      const entryData = {
        ...data,
        contractsCount: Number(data.contractsCount),
        upgradesCount: Number(data.upgradesCount),
        totalUpgradeValue: Number(data.totalUpgradeValue),
        insurancePackages: insurancePackages.filter(pkg => pkg.count > 0 || pkg.value > 0)
      }

      // ✅ Correction: utiliser la fonction create
      await createEntry(entryData)
      setSuccess(true)
      
      // Reset form
      form.reset()
      setInsurancePackages([
        { packageType: 'Basic', count: 0, value: 0 },
        { packageType: 'Smart', count: 0, value: 0 },
        { packageType: 'All Inclusive', count: 0, value: 0 }
      ])

      // Callback success
      if (onSuccess) {
        setTimeout(onSuccess, 1000)
      }

    } catch (err) {
      console.error('Error submitting entry:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Daily Performance Entry
        </CardTitle>
        <CardDescription>
          Record your daily sales performance and insurance packages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Entry saved successfully! Your performance metrics have been updated.
              </AlertDescription>
            </Alert>
          )}

          {/* Date */}
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

          {/* Basic Metrics */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractsCount">Total Contracts</Label>
              <Input
                id="contractsCount"
                type="number"
                min="0"
                {...form.register('contractsCount', { valueAsNumber: true })}
              />
              {form.formState.errors.contractsCount && (
                <p className="text-sm text-red-600">{form.formState.errors.contractsCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upgradesCount">Upgrades Sold</Label>
              <Input
                id="upgradesCount"
                type="number"
                min="0"
                {...form.register('upgradesCount', { valueAsNumber: true })}
              />
              {form.formState.errors.upgradesCount && (
                <p className="text-sm text-red-600">{form.formState.errors.upgradesCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalUpgradeValue">Total Upgrade Value (€)</Label>
              <Input
                id="totalUpgradeValue"
                type="number"
                min="0"
                step="0.01"
                {...form.register('totalUpgradeValue', { valueAsNumber: true })}
              />
              {form.formState.errors.totalUpgradeValue && (
                <p className="text-sm text-red-600">{form.formState.errors.totalUpgradeValue.message}</p>
              )}
            </div>
          </div>

          {/* Insurance Packages */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Insurance Packages Sold</Label>
            <div className="space-y-4">
              {insurancePackages.map((pkg, index) => (
                <div key={pkg.packageType} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{pkg.packageType}</h4>
                    <Badge variant="outline">{pkg.packageType}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Count</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateInsurancePackage(index, 'count', pkg.count - 1)}
                          disabled={pkg.count <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={pkg.count}
                          onChange={(e) => updateInsurancePackage(index, 'count', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateInsurancePackage(index, 'count', pkg.count + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Value (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pkg.value}
                        onChange={(e) => updateInsurancePackage(index, 'value', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about today's performance..."
              {...form.register('notes')}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}