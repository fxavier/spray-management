'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine, ComposedChart, Bar, Line } from 'recharts'
import { Calendar, Users, Target, TrendingUp, Activity, CheckCircle2, Home, AlertCircle, RefreshCw, Clock, MapPin, Sparkles } from 'lucide-react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardOverview {
  overview: {
    totalStructuresFound: number
    totalStructuresSprayed: number
    totalStructuresNotSprayed: number
    totalSprayTarget: number
    coveragePercentage: number
    targetProgress: number
    totalPopulation: number
    totalChildrenUnder5: number
    totalPregnantWomen: number
    averageStructuresPerDay: number
  }
  geography: {
    uniqueProvinces: number
    uniqueDistricts: number
    uniqueCommunities: number
  }
  teams: {
    activeSprayersThisMonth: number
    totalRecords: number
    completedRecords: number
  }
  statistics: {
    statusDistribution: Record<string, number>
    typeDistribution: Record<string, number>
  }
  recentActivity: Array<{
    sprayDate: string
    structuresSprayed: number
    structuresFound: number
    sprayStatus: string
  }>
  year: number
  lastUpdated: string
}

interface SprayProgress {
  target: number
  totalSprayed: number
  totalFound: number
  percentageComplete: number
  remainingToSpray: number
  coverageRate: number
  averageDailyProgress: number
  activeDays: number
  estimatedCompletionDate: string | null
  progress: Array<{
    date: string
    dailySprayed: number
    cumulativeSprayed: number
    dailyFound: number
    cumulativeFound: number
    percentageComplete: number
    coverageRate: number
  }>
  configurations: Array<{
    id: string
    sprayTarget: number
    description: string
  }>
  lastUpdated: string
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null)
  const [sprayProgress, setSprayProgress] = useState<SprayProgress | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [selectedYear])

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [selectedYear])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const [overviewRes, progressRes] = await Promise.all([
        fetch(`/api/dashboard/overview?year=${selectedYear}`),
        fetch(`/api/dashboard/spray-progress?year=${selectedYear}`)
      ])

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setDashboardData(overviewData)
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setSprayProgress(progressData)
      }

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      await fetchDashboardData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-xl border border-white/20">
          <p className="text-sm font-bold text-slate-800 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'dailySprayed' && `Diário: ${entry.value.toLocaleString()}`}
              {entry.dataKey === 'cumulativeSprayed' && `Acumulado: ${entry.value.toLocaleString()}`}
              {entry.dataKey === 'coverageRate' && `Taxa: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Generate available years (current year and previous 2 years)
  const availableYears = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString()
  })

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium text-xl">Carregando dashboard...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const progressChartData = sprayProgress?.progress?.map(item => ({
    date: item.date,
    diário: item.dailySprayed,
    acumulado: item.cumulativeSprayed,
    meta: sprayProgress.target,
    cobertura: item.coverageRate,
  })) || []

  const statusData = dashboardData?.statistics.statusDistribution ? 
    Object.entries(dashboardData.statistics.statusDistribution).map(([status, count]) => ({
      name: status === 'COMPLETED' ? 'Completo' : 
            status === 'IN_PROGRESS' ? 'Em Progresso' : 
            status === 'PLANNED' ? 'Planeado' : 'Cancelado',
      value: count,
      color: status === 'COMPLETED' ? '#10B981' : 
             status === 'IN_PROGRESS' ? '#F59E0B' : 
             status === 'PLANNED' ? '#3B82F6' : '#EF4444'
    })) : []

  const typeData = dashboardData?.statistics.typeDistribution ? 
    Object.entries(dashboardData.statistics.typeDistribution).map(([type, count]) => ({
      name: type === 'PRINCIPAL' ? 'Principal' : 'Secundária',
      value: count,
      color: type === 'PRINCIPAL' ? '#8B5CF6' : '#06B6D4'
    })) : []

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              {/* Main header card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-40"></div>
                      <div className="relative bg-white p-3 rounded-xl shadow-lg">
                        <Activity className="h-10 w-10 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-8">
                      <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        Dashboard Inteligente
                      </h1>
                      <p className="mt-3 text-xl text-slate-600 font-medium">
                        Acompanhe o progresso da campanha de pulverização em tempo real
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {/* Year Selector */}
                    <div className="text-right">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ano</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-32 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200">
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
                    
                    {/* Refresh Button */}
                    <button
                      onClick={refreshData}
                      disabled={isRefreshing}
                      className="relative inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                    </button>
                    
                    <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                  </div>
                </div>

                {/* Last Update Info */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Última atualização: {formatDateTime(lastRefresh)}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Target className="h-4 w-4 mr-2" />
                      {sprayProgress?.configurations.length || 0} configuração(ões) ativa(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Target Progress */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>Progresso da Meta</span>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-black text-blue-600">
                  {sprayProgress?.percentageComplete?.toFixed(1) || '0.0'}%
                </div>
                <Progress 
                  value={sprayProgress?.percentageComplete || 0} 
                  className="mt-3 h-2"
                />
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  {sprayProgress?.totalSprayed?.toLocaleString() || '0'} de {sprayProgress?.target?.toLocaleString() || '0'} estruturas
                </p>
                {sprayProgress?.estimatedCompletionDate && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Conclusão prevista: {formatDate(sprayProgress.estimatedCompletionDate)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Structures Coverage */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>Taxa de Cobertura</span>
                  <Home className="h-4 w-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-black text-green-600">
                  {dashboardData?.overview.coveragePercentage?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  {dashboardData?.overview.totalStructuresSprayed?.toLocaleString() || '0'} de {dashboardData?.overview.totalStructuresFound?.toLocaleString() || '0'} encontradas
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Média: {sprayProgress?.averageDailyProgress?.toFixed(0) || '0'} estruturas/dia
                </p>
              </CardContent>
            </Card>

            {/* Geographic Coverage */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>Cobertura Geográfica</span>
                  <MapPin className="h-4 w-4 text-purple-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-black text-purple-600">
                  {dashboardData?.geography.uniqueCommunities || 0}
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Comunidades ativas
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{dashboardData?.geography.uniqueProvinces || 0} províncias</span>
                  <span>{dashboardData?.geography.uniqueDistricts || 0} distritos</span>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>Equipes Ativas</span>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-black text-orange-600">
                  {dashboardData?.teams.activeSprayersThisMonth || 0}
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Pulverizadores ativos este mês
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {dashboardData?.teams.completedRecords || 0} de {dashboardData?.teams.totalRecords || 0} registros completos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Progress Chart */}
            <Card className="lg:col-span-2 relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progresso de Pulverização ao Longo do Tempo
                  </CardTitle>
                  <CardDescription>
                    Progresso diário e acumulado em relação à meta de {sprayProgress?.target?.toLocaleString() || 0} estruturas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {progressChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={progressChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="structures" orientation="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="percentage" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <ReferenceLine 
                          yAxisId="structures"
                          y={sprayProgress?.target || 0} 
                          stroke="#EF4444" 
                          strokeDasharray="5 5"
                          label={{ value: "Meta", position: "right" }}
                        />
                        <Bar 
                          yAxisId="structures"
                          dataKey="diário" 
                          fill="#93C5FD" 
                          name="Pulverização Diária"
                          opacity={0.7}
                        />
                        <Line 
                          yAxisId="structures"
                          type="monotone" 
                          dataKey="acumulado" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          name="Total Acumulado"
                          dot={{ fill: '#10B981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="percentage"
                          type="monotone" 
                          dataKey="cobertura" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Taxa de Cobertura (%)"
                          dot={{ fill: '#8B5CF6', r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Nenhum dado de progresso disponível</p>
                        <p className="text-slate-400 text-sm mt-1">Adicione registros de pulverização para ver o progresso</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Status Distribution */}
            <Card className="relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl blur"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Status dos Registros
                  </CardTitle>
                  <CardDescription>
                    Distribuição por status de conclusão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total de Registros:</span>
                      <span className="font-bold">{dashboardData?.teams.totalRecords || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Taxa de Conclusão:</span>
                      <span className="font-bold text-green-600">
                        {dashboardData?.teams.totalRecords ? 
                          ((dashboardData.teams.completedRecords / dashboardData.teams.totalRecords) * 100).toFixed(1) 
                          : '0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Recent Activity & Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-xl blur"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>
                    Últimos registros de pulverização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {dashboardData.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {formatDate(activity.sprayDate)}
                            </div>
                            <div className="text-xs text-slate-600">
                              {activity.structuresSprayed} estruturas pulverizadas
                            </div>
                          </div>
                          <Badge variant={
                            activity.sprayStatus === 'COMPLETED' ? 'default' :
                            activity.sprayStatus === 'IN_PROGRESS' ? 'secondary' :
                            'outline'
                          }>
                            {activity.sprayStatus === 'COMPLETED' ? 'Completo' :
                             activity.sprayStatus === 'IN_PROGRESS' ? 'Em Progresso' :
                             'Planeado'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Nenhuma atividade recente</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Type Distribution */}
            <Card className="relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl blur"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tipos de Pulverização
                  </CardTitle>
                  <CardDescription>
                    Distribuição por tipo de campanha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Nenhum dado disponível</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">População Protegida:</span>
                      <span className="font-bold">{dashboardData?.overview.totalPopulation?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Crianças &lt;5 anos:</span>
                      <span className="font-bold text-blue-600">{dashboardData?.overview.totalChildrenUnder5?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Mulheres Grávidas:</span>
                      <span className="font-bold text-pink-600">{dashboardData?.overview.totalPregnantWomen?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}