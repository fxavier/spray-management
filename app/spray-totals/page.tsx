'use client'

import { useState, useEffect, Suspense } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, CheckCircle, XCircle, Activity, Sparkles, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SprayTotal {
  id: string
  sprayDate: string
  sprayYear: number
  sprayRound: number
  sprayType: 'PRINCIPAL' | 'SECUNDARIA'
  sprayStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  insecticideUsed: string
  structuresFound: number
  structuresSprayed: number
  structuresNotSprayed: number
  compartmentsSprayed: number
  reasonNotSprayed?: string
  wallsType: string
  roofsType: string
  numberOfPersons: number
  childrenUnder5: number
  pregnantWomen: number
  sprayer: {
    id: string
    name: string
    number?: string
  }
  brigadeChief: {
    id: string
    name: string
    number?: string
  }
  community: {
    id: string
    name: string
    locality?: {
      id: string
      name: string
      district?: {
        id: string
        name: string
        province?: {
          id: string
          name: string
        }
      }
    }
  }
  createdByUser?: {
    name: string
  }
}

function SprayTotalsPageContent() {
  const [sprayTotals, setSprayTotals] = useState<SprayTotal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    fetchSprayTotals()
  }, [selectedYear, selectedStatus, selectedType]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSprayTotals = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedType !== 'all') params.append('type', selectedType)
      
      const response = await fetch(`/api/spray-totals${params.toString() ? `?${params.toString()}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        setSprayTotals(data)
      }
    } catch (error) {
      console.error('Error fetching spray totals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este registro?')) {
      return
    }

    try {
      const response = await fetch(`/api/spray-totals/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSprayTotals(sprayTotals.filter(st => st.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao deletar registro')
      }
    } catch (error) {
      console.error('Error deleting spray total:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNED: { 
        color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300', 
        label: 'Planeado',
        icon: Calendar
      },
      IN_PROGRESS: { 
        color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300', 
        label: 'Em Progresso',
        icon: Activity
      },
      COMPLETED: { 
        color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300', 
        label: 'Completo',
        icon: CheckCircle
      },
      CANCELLED: { 
        color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300', 
        label: 'Cancelado',
        icon: XCircle
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNED
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${config.color}`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {config.label}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      PRINCIPAL: { 
        color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300', 
        label: 'Principal' 
      },
      SECUNDARIA: { 
        color: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300', 
        label: 'Secundária' 
      },
    }
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.PRINCIPAL
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // Get unique years from spray totals
  const years = Array.from(new Set(sprayTotals.map(st => st.sprayYear))).sort((a, b) => b - a)

  // Calculate summary stats
  const totalStructuresSprayed = sprayTotals.reduce((sum, st) => sum + st.structuresSprayed, 0)
  const totalStructuresFound = sprayTotals.reduce((sum, st) => sum + st.structuresFound, 0)
  const completedRecords = sprayTotals.filter(st => st.sprayStatus === 'COMPLETED').length
  const coveragePercentage = totalStructuresFound > 0 ? ((totalStructuresSprayed / totalStructuresFound) * 100) : 0

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Enhanced Header */}
          <div className="mb-8 sm:mb-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-40"></div>
                      <div className="relative bg-white p-2 sm:p-3 rounded-xl shadow-lg">
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 sm:ml-6 lg:ml-8">
                      <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        Registos de Pulverização
                      </h1>
                      <p className="mt-1 sm:mt-2 lg:mt-3 text-sm sm:text-base lg:text-xl text-slate-600 font-medium">
                        Gestão inteligente de dados de pulverização
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/spray-totals/new"
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Novo Registro
                    </Link>
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 animate-pulse" />
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600">Total Registros</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{sprayTotals.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600">Estruturas Pulverizadas</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{totalStructuresSprayed.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600">Taxa de Cobertura</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{coveragePercentage.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-slate-600">Completos</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{completedRecords}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg blur opacity-30"></div>
                  <div className="relative bg-white p-2 rounded-lg">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
                <h3 className="ml-3 sm:ml-4 text-lg sm:text-xl font-bold text-slate-800">Filtros Inteligentes</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ano</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 group-hover:border-slate-300">
                      <SelectValue placeholder="Filtrar por ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 group-hover:border-slate-300">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="PLANNED">Planeado</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="COMPLETED">Completo</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 group-hover:border-slate-300">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="PRINCIPAL">Principal</SelectItem>
                      <SelectItem value="SECUNDARIA">Secundária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
                  </div>
                  <p className="mt-6 text-slate-600 font-medium text-lg">Carregando registros...</p>
                </div>
              ) : sprayTotals.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-2 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full blur opacity-20"></div>
                    <Calendar className="relative h-16 w-16 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum registro encontrado</h3>
                  <p className="text-slate-500 mb-6">Comece criando seu primeiro registro de pulverização</p>
                  <Link
                    href="/spray-totals/new"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Primeiro Registro
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Data / Local
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Equipe
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Tipo / Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Estruturas
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            População
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sprayTotals.map((sprayTotal) => (
                          <tr key={sprayTotal.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-bold text-slate-900">
                                  {new Date(sprayTotal.sprayDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-sm text-slate-600 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                                  {sprayTotal.community.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-bold text-slate-900 flex items-center">
                                  <Users className="h-3 w-3 mr-2 text-blue-500" />
                                  {sprayTotal.sprayer.name}
                                </div>
                                <div className="text-slate-600 mt-1">
                                  Chefe: {sprayTotal.brigadeChief.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="space-y-2">
                                {getTypeBadge(sprayTotal.sprayType)}
                                {getStatusBadge(sprayTotal.sprayStatus)}
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-sm space-y-1">
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="font-bold text-slate-900">{sprayTotal.structuresSprayed}</span>
                                  <span className="text-slate-500 ml-1">pulverizadas</span>
                                </div>
                                <div className="flex items-center">
                                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                  <span className="font-bold text-slate-900">{sprayTotal.structuresNotSprayed}</span>
                                  <span className="text-slate-500 ml-1">não pulverizadas</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-bold text-slate-900">
                                  {sprayTotal.numberOfPersons.toLocaleString()}
                                </div>
                                <div className="text-slate-600">pessoas</div>
                              </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  href={`/spray-totals/${sprayTotal.id}`}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link
                                  href={`/spray-totals/${sprayTotal.id}/edit`}
                                  className="text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(sprayTotal.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="lg:hidden">
                    <div className="space-y-4 p-4">
                      {sprayTotals.map((sprayTotal) => (
                        <div key={sprayTotal.id} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 space-y-3 border border-slate-200 shadow-lg">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {new Date(sprayTotal.sprayDate).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                {sprayTotal.community?.name || 'N/A'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                sprayTotal.sprayType === 'PRINCIPAL' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}>
                                {sprayTotal.sprayType === 'PRINCIPAL' ? 'Principal' : 'Secundária'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                sprayTotal.sprayStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                sprayTotal.sprayStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                sprayTotal.sprayStatus === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                <span>
                                  {sprayTotal.sprayStatus === 'COMPLETED' ? 'Completo' :
                                   sprayTotal.sprayStatus === 'IN_PROGRESS' ? 'Em Progresso' :
                                   sprayTotal.sprayStatus === 'PLANNED' ? 'Planeado' : 'Cancelado'}
                                </span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500">Estruturas</p>
                              <p className="font-bold text-slate-900">
                                {sprayTotal.structuresSprayed} / {sprayTotal.structuresFound}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">População</p>
                              <p className="font-bold text-slate-900">
                                {sprayTotal.numberOfPersons.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Team */}
                          <div className="text-sm pt-2 border-t border-slate-200">
                            <p className="text-slate-500">Equipe</p>
                            <p className="font-medium text-slate-900">
                              <Users className="inline h-3 w-3 mr-1" />
                              {sprayTotal.sprayer?.name || 'N/A'}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Link
                              href={`/spray-totals/${sprayTotal.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                            <Link
                              href={`/spray-totals/${sprayTotal.id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(sprayTotal.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default function SprayTotalsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SprayTotalsPageContent />
    </Suspense>
  )
}