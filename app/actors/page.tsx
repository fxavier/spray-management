'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Trash2, Edit, Plus, Users, Search, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ActorType {
  id: string
  name: string
  number: number
}

interface Actor {
  id: string
  name: string
  number?: string
  description?: string
  actorType: ActorType
  actorTypeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function ActorsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [actors, setActors] = useState<Actor[]>([])
  const [filteredActors, setFilteredActors] = useState<Actor[]>([])
  const [actorTypes, setActorTypes] = useState<ActorType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedActors, setSelectedActors] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check for success message from create/edit
    const success = searchParams.get('success')
    if (success === 'created' || success === 'updated') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      // Clean URL
      router.replace('/actors')
    }
    
    fetchData()
  }, [searchParams])

  useEffect(() => {
    // Apply filters
    let filtered = actors

    if (searchTerm) {
      filtered = filtered.filter(actor => 
        actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actor.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actor.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType) {
      filtered = filtered.filter(actor => actor.actorTypeId === filterType)
    }

    if (filterStatus) {
      filtered = filtered.filter(actor => 
        filterStatus === 'active' ? actor.isActive : !actor.isActive
      )
    }

    setFilteredActors(filtered)
  }, [actors, searchTerm, filterType, filterStatus])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [actorsResponse, actorTypesResponse] = await Promise.all([
        fetch('/api/actors'),
        fetch('/api/actor-types'),
      ])

      if (actorsResponse.ok) {
        const actorsData = await actorsResponse.json()
        setActors(actorsData)
      }

      if (actorTypesResponse.ok) {
        const actorTypesData = await actorTypesResponse.json()
        setActorTypes(actorTypesData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este actor?')) return

    try {
      const response = await fetch(`/api/actors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Erro ao eliminar actor:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja eliminar ${selectedActors.length} actor(es)?`)) return

    try {
      await Promise.all(
        selectedActors.map(id => 
          fetch(`/api/actors/${id}`, { method: 'DELETE' })
        )
      )
      setSelectedActors([])
      fetchData()
    } catch (error) {
      console.error('Erro ao eliminar actores:', error)
    }
  }

  const toggleSelectActor = (id: string) => {
    setSelectedActors(prev => 
      prev.includes(id) 
        ? prev.filter(actorId => actorId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedActors(
      selectedActors.length === filteredActors.length 
        ? []
        : filteredActors.map(actor => actor.id)
    )
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar actores...</p>
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
              Actor {searchParams.get('success') === 'created' ? 'criado' : 'actualizado'} com sucesso!
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Actores</h1>
            <p className="text-gray-600 mt-1">
              Gerir pulverizadores e chefes de brigada do sistema
            </p>
          </div>
          <Link
            href="/actors/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Actor
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Todos os tipos</option>
                {actorTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
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
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || filterType || filterStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('')
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
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Lista de Actores</h3>
                <span className="ml-3 text-sm text-gray-500">
                  {filteredActors.length} de {actors.length} actor(es)
                </span>
              </div>
              
              {/* Bulk Actions */}
              {selectedActors.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedActors.length} seleccionado(s)
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
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedActors.length === filteredActors.length && filteredActors.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Nenhum actor encontrado</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Tente ajustar os filtros ou criar um novo actor
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActors.map((actor) => (
                    <tr key={actor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedActors.includes(actor.id)}
                          onChange={() => toggleSelectActor(actor.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{actor.name}</div>
                        {actor.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {actor.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {actor.number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {actor.actorType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          actor.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {actor.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(actor.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/actors/${actor.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(actor.id)}
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
          
          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="space-y-4 p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="mt-2 text-gray-600">A carregar actores...</p>
                </div>
              ) : filteredActors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum actor encontrado</p>
                  <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros ou adicione um novo actor</p>
                </div>
              ) : (
                filteredActors.map((actor) => (
                  <div key={actor.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedActors.includes(actor.id)}
                          onChange={() => toggleSelectActor(actor.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{actor.name}</h3>
                          <p className="text-sm text-gray-500">#{actor.number}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        actor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {actor.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium text-gray-900">{actor.actorType?.name || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                      <Link
                        href={`/actors/${actor.id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(actor.id)}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default function ActorsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ActorsPageContent />
    </Suspense>
  )
}