'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { 
  Trash2, Edit, Plus, MapPin, Search, CheckCircle, 
  Loader2, ChevronRight, ChevronDown, Building2, Map 
} from 'lucide-react'
import Link from 'next/link'

interface Province {
  id: string
  name: string
  code?: string
  _count?: {
    districts: number
  }
}

interface District {
  id: string
  name: string
  code?: string
  provinceId: string
  province?: Province
  _count?: {
    localities: number
  }
}

interface Locality {
  id: string
  name: string
  districtId: string
  district?: District
  _count?: {
    communities: number
  }
}

interface Community {
  id: string
  name: string
  localityId: string
  locality?: Locality
}

type LocationType = 'province' | 'district' | 'locality' | 'community'

function LocationsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set())
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set())
  const [expandedLocalities, setExpandedLocalities] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState(false)
  // const [activeTab, setActiveTab] = useState<LocationType>('province')

  useEffect(() => {
    // Check for success message
    const success = searchParams.get('success')
    const type = searchParams.get('type')
    if (success && type) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      router.replace('/locations')
    }
    
    fetchData()
  }, [searchParams])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [provincesRes, districtsRes, localitiesRes, communitiesRes] = await Promise.all([
        fetch('/api/provinces'),
        fetch('/api/districts'),
        fetch('/api/localities'),
        fetch('/api/communities')
      ])

      if (provincesRes.ok) {
        const provincesData = await provincesRes.json()
        setProvinces(provincesData)
      }

      if (districtsRes.ok) {
        const districtsData = await districtsRes.json()
        setDistricts(districtsData)
      }

      if (localitiesRes.ok) {
        const localitiesData = await localitiesRes.json()
        setLocalities(localitiesData)
      }

      if (communitiesRes.ok) {
        const communitiesData = await communitiesRes.json()
        setCommunities(communitiesData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, type: LocationType) => {
    const confirmMessage = {
      province: 'Tem certeza que deseja eliminar esta província? Isto também eliminará todos os distritos, localidades e comunidades associadas.',
      district: 'Tem certeza que deseja eliminar este distrito? Isto também eliminará todas as localidades e comunidades associadas.',
      locality: 'Tem certeza que deseja eliminar esta localidade? Isto também eliminará todas as comunidades associadas.',
      community: 'Tem certeza que deseja eliminar esta comunidade?'
    }

    if (!confirm(confirmMessage[type])) return

    try {
      const response = await fetch(`/api/${type}s/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error(`Erro ao eliminar ${type}:`, error)
    }
  }

  const toggleExpanded = (id: string, type: 'province' | 'district' | 'locality') => {
    const setters = {
      province: setExpandedProvinces,
      district: setExpandedDistricts,
      locality: setExpandedLocalities
    }
    
    const setter = setters[type]
    setter(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getDistrictsByProvince = (provinceId: string) => {
    return districts.filter(d => d.provinceId === provinceId)
  }

  const getLocalitiesByDistrict = (districtId: string) => {
    return localities.filter(l => l.districtId === districtId)
  }

  const getCommunitiesByLocality = (localityId: string) => {
    return communities.filter(c => c.localityId === localityId)
  }

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSuccessMessage = () => {
    const success = searchParams.get('success')
    const type = searchParams.get('type')
    
    if (!success || !type) return ''
    
    const typeLabels = {
      province: 'Província',
      district: 'Distrito',
      locality: 'Localidade',
      community: 'Comunidade'
    }
    
    const actionLabels = {
      created: 'criada',
      updated: 'actualizada'
    }
    
    return `${typeLabels[type as LocationType]} ${actionLabels[success as 'created' | 'updated']} com sucesso!`
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar localizações...</p>
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
            <span className="text-green-800">{getSuccessMessage()}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Localizações</h1>
            <p className="text-gray-600 mt-1">
              Gerir províncias, distritos, localidades e comunidades
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Acções Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/locations/provinces/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Província
            </Link>
            <Link
              href="/locations/districts/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Distrito
            </Link>
            <Link
              href="/locations/localities/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Localidade
            </Link>
            <Link
              href="/locations/communities/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Comunidade
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Hierarchical View */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Hierarquia de Localizações</h3>
              <span className="ml-3 text-sm text-gray-500">
                {provinces.length} província(s) • {districts.length} distrito(s) • {localities.length} localidade(s) • {communities.length} comunidade(s)
              </span>
            </div>
          </div>

          <div className="p-6">
            {filteredProvinces.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma localização encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProvinces.map((province) => (
                  <div key={province.id} className="border border-gray-200 rounded-lg">
                    {/* Province Level */}
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleExpanded(province.id, 'province')}
                          className="mr-2"
                        >
                          {expandedProvinces.has(province.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <Map className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <span className="font-medium text-gray-900">{province.name}</span>
                          {province.code && (
                            <span className="ml-2 text-sm text-gray-500">({province.code})</span>
                          )}
                          <span className="ml-3 text-sm text-gray-500">
                            {getDistrictsByProvince(province.id).length} distrito(s)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/locations/provinces/${province.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(province.id, 'province')}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Districts */}
                    {expandedProvinces.has(province.id) && (
                      <div className="border-t border-gray-200">
                        {getDistrictsByProvince(province.id).map((district) => (
                          <div key={district.id} className="pl-8">
                            {/* District Level */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-l-2 border-gray-200">
                              <div className="flex items-center flex-1">
                                <button
                                  onClick={() => toggleExpanded(district.id, 'district')}
                                  className="mr-2"
                                >
                                  {expandedDistricts.has(district.id) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                </button>
                                <Building2 className="h-4 w-4 text-green-500 mr-2" />
                                <div>
                                  <span className="font-medium text-gray-900">{district.name}</span>
                                  {district.code && (
                                    <span className="ml-2 text-sm text-gray-500">({district.code})</span>
                                  )}
                                  <span className="ml-3 text-sm text-gray-500">
                                    {getLocalitiesByDistrict(district.id).length} localidade(s)
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/locations/districts/${district.id}/edit`}
                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(district.id, 'district')}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Localities */}
                            {expandedDistricts.has(district.id) && (
                              <div className="border-t border-gray-200">
                                {getLocalitiesByDistrict(district.id).map((locality) => (
                                  <div key={locality.id} className="pl-8">
                                    {/* Locality Level */}
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-l-2 border-gray-200">
                                      <div className="flex items-center flex-1">
                                        <button
                                          onClick={() => toggleExpanded(locality.id, 'locality')}
                                          className="mr-2"
                                        >
                                          {expandedLocalities.has(locality.id) ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                          )}
                                        </button>
                                        <MapPin className="h-4 w-4 text-orange-500 mr-2" />
                                        <div>
                                          <span className="font-medium text-gray-900">{locality.name}</span>
                                          <span className="ml-3 text-sm text-gray-500">
                                            {getCommunitiesByLocality(locality.id).length} comunidade(s)
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Link
                                          href={`/locations/localities/${locality.id}/edit`}
                                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                          onClick={() => handleDelete(locality.id, 'locality')}
                                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Communities */}
                                    {expandedLocalities.has(locality.id) && (
                                      <div className="border-t border-gray-200">
                                        {getCommunitiesByLocality(locality.id).map((community) => (
                                          <div key={community.id} className="pl-8">
                                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-l-2 border-gray-200">
                                              <div className="flex items-center flex-1">
                                                <div className="w-4 mr-2" /> {/* Spacer */}
                                                <MapPin className="h-4 w-4 text-purple-500 mr-2" />
                                                <span className="font-medium text-gray-900">{community.name}</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Link
                                                  href={`/locations/communities/${community.id}/edit`}
                                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                  onClick={() => handleDelete(community.id, 'community')}
                                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LocationsPageContent />
    </Suspense>
  )
}