'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
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
  sprayStatus: string
  sprayType: string
  insecticideUsed: string
  structuresFound: number
  structuresSprayed: number
  structuresNotSprayed: number
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
      name: string
      district?: {
        name: string
        province?: {
          name: string
        }
      }
    }
  }
  createdByUser?: {
    name: string
  }
}

export default function SprayTotalsPage() {
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
      const params = new URLSearchParams()
      if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedType && selectedType !== 'all') params.append('type', selectedType)
      
      const response = await fetch(`/api/spray-totals?${params}`)
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
    if (!confirm('Tem certeza que deseja deletar este registro?')) {
      return
    }

    try {
      const response = await fetch(`/api/spray-totals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSprayTotals()
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
                        Registros de Pulverização
                      </h1>
                      <p className="mt-3 text-xl text-slate-600 font-medium">
                        Gestão inteligente dos registros de pulverização das comunidades
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{sprayTotals.length}</div>
                      <div className="text-sm text-slate-500 font-medium">Registros</div>
                    </div>
                    <Link
                      href="/spray-totals/new"
                      className="relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 group"
                    >
                      <Plus className="h-6 w-6 mr-3 group-hover:rotate-90 transition-transform duration-200" />
                      Novo Registro
                      <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    </Link>
                    <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-green-600">{totalStructuresSprayed.toLocaleString()}</div>
                        <div className="text-sm text-slate-500">Estruturas Pulverizadas</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-blue-600">{coveragePercentage.toFixed(1)}%</div>
                        <div className="text-sm text-slate-500">Taxa de Cobertura</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-purple-600">{completedRecords}</div>
                        <div className="text-sm text-slate-500">Registros Completos</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <MapPin className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {Array.from(new Set(sprayTotals.map(st => st.community.id))).length}
                        </div>
                        <div className="text-sm text-slate-500">Comunidades</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg blur opacity-30"></div>
                  <div className="relative bg-white p-2 rounded-lg">
                    <Filter className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <h3 className="ml-4 text-xl font-bold text-slate-800">Filtros Inteligentes</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Enhanced Table */}
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
                <div className="overflow-x-auto">
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
                      {sprayTotals.map((sprayTotal, _index) => (
                        <tr key={sprayTotal.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {new Date(sprayTotal.sprayDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-sm text-slate-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                                {sprayTotal.community.name}
                                {sprayTotal.community.locality && (
                                  <span className="text-slate-500">, {sprayTotal.community.locality.name}</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-1 font-medium">
                                Ronda {sprayTotal.sprayRound} • {sprayTotal.insecticideUsed}
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
                              <div className="text-xs text-slate-500 font-medium">
                                Total: {sprayTotal.structuresFound}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-bold text-slate-900">Pessoas: {sprayTotal.numberOfPersons || 0}</div>
                              <div className="text-xs text-slate-600 mt-1">
                                Crianças &lt;5: {sprayTotal.childrenUnder5 || 0}
                              </div>
                              <div className="text-xs text-slate-600">
                                Grávidas: {sprayTotal.pregnantWomen || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/spray-totals/${sprayTotal.id}`}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group-hover:scale-110"
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/spray-totals/${sprayTotal.id}/edit`}
                                className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group-hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(sprayTotal.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:scale-110"
                                title="Deletar"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}