'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Trash2, Edit, Plus, Settings, Search, Filter, CheckCircle, XCircle, Loader2, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Province {
  id: string
  name: string
  code?: string
}

interface District {
  id: string
  name: string
  code?: string
  province: Province
}

interface SprayConfiguration {
  id: string
  year: number
  province?: Province
  district?: District
  proposedSprayDays: number
  startDate?: string
  endDate?: string
  sprayRounds: number
  daysBetweenRounds: number
  description?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SprayConfigurationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [configurations, setConfigurations] = useState<SprayConfiguration[]>([])
  const [filteredConfigurations, setFilteredConfigurations] = useState<SprayConfiguration[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterProvince, setFilterProvince] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check for success message from create/edit
    const success = searchParams.get('success')
    if (success === 'created' || success === 'updated') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      // Clean URL
      router.replace('/spray-config')
    }
    
    fetchData()
  }, [searchParams])

  useEffect(() => {
    // Apply filters
    let filtered = configurations

    if (searchTerm) {
      filtered = filtered.filter(config => 
        config.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.province?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.district?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterYear) {
      filtered = filtered.filter(config => config.year.toString() === filterYear)
    }

    if (filterProvince) {
      filtered = filtered.filter(config => config.province?.id === filterProvince)
    }

    if (filterStatus) {
      filtered = filtered.filter(config => 
        filterStatus === 'active' ? config.isActive : !config.isActive
      )
    }

    setFilteredConfigurations(filtered)
  }, [configurations, searchTerm, filterYear, filterProvince, filterStatus])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [configResponse, provincesResponse] = await Promise.all([
        fetch('/api/spray-configurations'),
        fetch('/api/provinces'),
      ])

      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfigurations(configData)
      }

      if (provincesResponse.ok) {
        const provincesData = await provincesResponse.json()
        setProvinces(provincesData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta configuração?')) return

    try {
      const response = await fetch(`/api/spray-configurations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Erro ao eliminar configuração:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja eliminar ${selectedConfigs.length} configuração(ões)?`)) return

    try {
      await Promise.all(
        selectedConfigs.map(id => 
          fetch(`/api/spray-configurations/${id}`, { method: 'DELETE' })
        )
      )
      setSelectedConfigs([])
      fetchData()
    } catch (error) {
      console.error('Erro ao eliminar configurações:', error)
    }
  }

  const toggleSelectConfig = (id: string) => {
    setSelectedConfigs(prev => 
      prev.includes(id) 
        ? prev.filter(configId => configId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedConfigs(
      selectedConfigs.length === filteredConfigurations.length 
        ? []
        : filteredConfigurations.map(config => config.id)
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-PT')
  }

  // Get unique years from configurations
  const years = Array.from(new Set(configurations.map(c => c.year))).sort((a, b) => b - a)

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar configurações...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-800">
              Configuração {searchParams.get('success') === 'created' ? 'criada' : 'actualizada'} com sucesso!
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações de Pulverização</h1>
            <p className="text-gray-600 mt-1">
              Gerir configurações de campanhas de pulverização
            </p>
          </div>
          <Link
            href="/spray-config/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Configuração
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os anos</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Province Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Todas as províncias</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || filterYear || filterProvince || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterYear('')
                  setFilterProvince('')
                  setFilterStatus('')
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Lista de Configurações</h3>
                <span className="ml-3 text-sm text-gray-500">
                  {filteredConfigurations.length} de {configurations.length} configuração(ões)
                </span>
              </div>
              
              {/* Bulk Actions */}
              {selectedConfigs.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedConfigs.length} seleccionado(s)
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedConfigs.length === filteredConfigurations.length && filteredConfigurations.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias/Rondas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConfigurations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Settings className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Nenhuma configuração encontrada</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Tente ajustar os filtros ou criar uma nova configuração
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredConfigurations.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedConfigs.includes(config.id)}
                          onChange={() => toggleSelectConfig(config.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{config.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {config.province?.name || 'Nacional'}
                        </div>
                        {config.district && (
                          <div className="text-sm text-gray-500">
                            {config.district.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(config.startDate)} - {formatDate(config.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {config.proposedSprayDays} dias
                        </div>
                        <div className="text-sm text-gray-500">
                          {config.sprayRounds} ronda(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {config.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/spray-config/${config.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}