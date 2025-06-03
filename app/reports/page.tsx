'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Download, 
  // Calendar, 
  Filter, 
  BarChart3, 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp,
  MapPin,
  Users,
  Target,
  Activity,
  // Clock,
  // Eye,
  RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'

interface Province {
  id: string
  name: string
}

interface District {
  id: string
  name: string
}

interface ReportSummary {
  overview: {
    totalRecords: number
    totalStructuresFound: number
    totalStructuresSprayed: number
    totalStructuresNotSprayed: number
    totalPopulation: number
    totalChildrenUnder5: number
    totalPregnantWomen: number
    coveragePercentage: number
    totalTarget: number
    targetProgress: number
  }
  distributions: {
    status: Record<string, number>
    type: Record<string, number>
    province: Record<string, any>
    monthly: Record<string, any>
  }
  teamPerformance: Record<string, any>
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [reportData, setReportData] = useState<ReportSummary | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  
  // Filter state
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    provinceId: 'all',
    districtId: 'all',
    sprayStatus: 'all',
    sprayType: 'all'
  })

  useEffect(() => {
    fetchProvinces()
    generateReport()
  }, [])

  useEffect(() => {
    if (filters.provinceId && filters.provinceId !== 'all') {
      fetchDistricts(filters.provinceId)
    } else {
      setDistricts([])
      setFilters(prev => ({ ...prev, districtId: 'all' }))
    }
  }, [filters.provinceId])

  const fetchProvinces = async () => {
    try {
      const response = await fetch('/api/provinces')
      if (response.ok) {
        const data = await response.json()
        setProvinces(data)
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  const fetchDistricts = async (provinceId: string) => {
    try {
      const response = await fetch(`/api/provinces/${provinceId}`)
      if (response.ok) {
        const data = await response.json()
        setDistricts(data.districts || [])
      }
    } catch (error) {
      console.error('Error fetching districts:', error)
    }
  }

  const generateReport = async () => {
    try {
      setIsLoading(true)
      const searchParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          searchParams.append(key, value)
        }
      })

      const response = await fetch(`/api/reports/summary?${searchParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (reportType: 'summary' | 'detailed') => {
    try {
      setIsExporting(true)
      
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          filters
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${reportType}-${filters.year}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatNumber = (num: number) => num.toLocaleString('pt-BR')
  const formatPercentage = (num: number) => `${num.toFixed(1)}%`

  // Generate available years (current year and previous 4 years)
  const availableYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString()
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completo'
      case 'IN_PROGRESS': return 'Em Progresso'
      case 'PLANNED': return 'Planeado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'PLANNED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              {/* Main header card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-40"></div>
                      <div className="relative bg-white p-2 sm:p-3 rounded-xl shadow-lg">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-emerald-600" />
                      </div>
                    </div>
                    <div className="ml-4 sm:ml-6 lg:ml-8">
                      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                        Relatórios Inteligentes
                      </h1>
                      <p className="mt-1 sm:mt-2 lg:mt-3 text-sm sm:text-base lg:text-xl text-slate-600 font-medium">
                        Análise avançada e exportação de dados de pulverização
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={generateReport}
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Gerando...' : 'Atualizar'}
                    </Button>
                    <Sparkles className="h-8 w-8 text-teal-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="mb-8 relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-xl blur"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-slate-600" />
                  Filtros de Relatório
                </CardTitle>
                <CardDescription>
                  Configure os filtros para personalizar seu relatório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Year Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-semibold text-slate-700">
                      Ano
                    </Label>
                    <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">
                      Data Inicial
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700">
                      Data Final
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    />
                  </div>

                  {/* Province Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-semibold text-slate-700">
                      Província
                    </Label>
                    <Select value={filters.provinceId} onValueChange={(value) => handleFilterChange('provinceId', value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Províncias</SelectItem>
                        {provinces.map(province => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* District Filter */}
                  {districts.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-semibold text-slate-700">
                        Distrito
                      </Label>
                      <Select value={filters.districtId} onValueChange={(value) => handleFilterChange('districtId', value)}>
                        <SelectTrigger className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Distritos</SelectItem>
                          {districts.map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700">
                      Status
                    </Label>
                    <Select value={filters.sprayStatus} onValueChange={(value) => handleFilterChange('sprayStatus', value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="COMPLETED">Completo</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                        <SelectItem value="PLANNED">Planeado</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Tipo
                    </Label>
                    <Select value={filters.sprayType} onValueChange={(value) => handleFilterChange('sprayType', value)}>
                      <SelectTrigger className="border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="PRINCIPAL">Principal</SelectItem>
                        <SelectItem value="SECUNDARIA">Secundária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Export Buttons */}
          <div className="mb-8 flex flex-wrap gap-4">
            <Button
              onClick={() => exportReport('summary')}
              disabled={isExporting || !reportData}
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Resumo (Excel)'}
            </Button>

            <Button
              onClick={() => exportReport('detailed')}
              disabled={isExporting || !reportData}
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Download className="h-5 w-5 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Detalhado (Excel)'}
            </Button>
          </div>

          {/* Report Data Display */}
          {reportData && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Records */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>Total de Registros</span>
                      <FileText className="h-4 w-4 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-blue-600">
                      {formatNumber(reportData.overview.totalRecords)}
                    </div>
                  </CardContent>
                </Card>

                {/* Coverage Rate */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>Taxa de Cobertura</span>
                      <Target className="h-4 w-4 text-green-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-green-600">
                      {formatPercentage(reportData.overview.coveragePercentage)}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {formatNumber(reportData.overview.totalStructuresSprayed)} de {formatNumber(reportData.overview.totalStructuresFound)}
                    </p>
                  </CardContent>
                </Card>

                {/* Population */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>População Total</span>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-purple-600">
                      {formatNumber(reportData.overview.totalPopulation)}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {formatNumber(reportData.overview.totalChildrenUnder5)} crianças &lt;5 anos
                    </p>
                  </CardContent>
                </Card>

                {/* Target Progress */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>Progresso da Meta</span>
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-orange-600">
                      {formatPercentage(reportData.overview.targetProgress)}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Meta: {formatNumber(reportData.overview.totalTarget)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status and Type Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Status Distribution */}
                <Card className="relative overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl blur"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        Distribuição por Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(reportData.distributions.status).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getStatusColor(status)}>
                                {getStatusText(status)}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-slate-800">
                              {formatNumber(count as number)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>

                {/* Type Distribution */}
                <Card className="relative overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Distribuição por Tipo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(reportData.distributions.type).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={type === 'PRINCIPAL' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'}>
                                {type === 'PRINCIPAL' ? 'Principal' : 'Secundária'}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-slate-800">
                              {formatNumber(count as number)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>

              {/* Province Distribution */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-600" />
                      Distribuição Geográfica
                    </CardTitle>
                    <CardDescription>
                      Dados de pulverização por província
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(reportData.distributions.province).map(([province, data]: [string, any]) => (
                        <div key={province} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">{province}</h3>
                            <Badge variant="outline">
                              {formatNumber(data.recordCount)} registros
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">Estruturas Encontradas:</span>
                              <div className="font-bold text-slate-800">{formatNumber(data.structuresFound)}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Estruturas Pulverizadas:</span>
                              <div className="font-bold text-green-600">{formatNumber(data.structuresSprayed)}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">População:</span>
                              <div className="font-bold text-purple-600">{formatNumber(data.population)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
                      <div className="absolute inset-0 rounded-full bg-emerald-600/20 animate-ping"></div>
                    </div>
                    <p className="mt-6 text-slate-600 font-medium text-xl">Gerando relatório...</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}