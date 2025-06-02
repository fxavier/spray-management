'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Calendar, MapPin, Users, Sparkles, Home, Target, Droplets, Edit3 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  number?: string
}

interface Community {
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

interface SprayConfiguration {
  id: string
  year: number
  description?: string
  sprayTarget: number
}

interface SprayTotal {
  id: string
  sprayerId: string
  brigadeChiefId: string
  communityId: string
  sprayConfigurationId?: string
  sprayType: string
  sprayDate: string
  sprayRound: number
  sprayStatus: string
  insecticideUsed: string
  structuresFound: number
  structuresSprayed: number
  structuresNotSprayed: number
  compartmentsSprayed: number
  wallsType: string
  roofsType: string
  numberOfPersons: number
  childrenUnder5: number
  pregnantWomen: number
  reasonNotSprayed?: string
  sprayer?: { id: string; name: string; number?: string }
  brigadeChief?: { id: string; name: string; number?: string }
  community?: Community
  sprayConfiguration?: SprayConfiguration
}

export default function EditSprayTotalPage() {
  const router = useRouter()
  const params = useParams()
  const sprayTotalId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sprayers, setSprayers] = useState<User[]>([])
  const [brigadeChiefs, setBrigadeChiefs] = useState<User[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [sprayConfigurations, setSprayConfigurations] = useState<SprayConfiguration[]>([])
  const [sprayTotal, setSprayTotal] = useState<SprayTotal | null>(null)
  const [formData, setFormData] = useState({
    sprayerId: '',
    brigadeChiefId: '',
    communityId: '',
    sprayConfigurationId: '',
    sprayType: 'PRINCIPAL',
    sprayDate: new Date().toISOString().split('T')[0],
    sprayRound: 1,
    sprayStatus: 'PLANNED',
    insecticideUsed: 'Deltamethrin',
    structuresFound: 0,
    structuresSprayed: 0,
    structuresNotSprayed: 0,
    compartmentsSprayed: 0,
    wallsType: 'MATOPE',
    roofsType: 'ZINCO',
    numberOfPersons: 0,
    childrenUnder5: 0,
    pregnantWomen: 0,
    reasonNotSprayed: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Calculate structuresNotSprayed automatically
  useEffect(() => {
    const notSprayed = Math.max(0, formData.structuresFound - formData.structuresSprayed)
    if (notSprayed !== formData.structuresNotSprayed) {
      setFormData(prev => ({ ...prev, structuresNotSprayed: notSprayed }))
    }
  }, [formData.structuresFound, formData.structuresSprayed])

  const fetchInitialData = async () => {
    try {
      setIsFetchingData(true)
      const [sprayTotalRes, sprayersRes, communitiesRes, sprayConfigsRes] = await Promise.all([
        fetch(`/api/spray-totals/${sprayTotalId}`),
        fetch('/api/actors?type=sprayers'),
        fetch('/api/communities'),
        fetch('/api/spray-configurations'),
      ])

      if (sprayTotalRes.ok) {
        const sprayTotalData = await sprayTotalRes.json()
        setSprayTotal(sprayTotalData)
        
        // Populate form with existing data
        setFormData({
          sprayerId: sprayTotalData.sprayerId || '',
          brigadeChiefId: sprayTotalData.brigadeChiefId || '',
          communityId: sprayTotalData.communityId || '',
          sprayConfigurationId: sprayTotalData.sprayConfigurationId || '',
          sprayType: sprayTotalData.sprayType || 'PRINCIPAL',
          sprayDate: sprayTotalData.sprayDate ? new Date(sprayTotalData.sprayDate).toISOString().split('T')[0] : '',
          sprayRound: sprayTotalData.sprayRound || 1,
          sprayStatus: sprayTotalData.sprayStatus || 'PLANNED',
          insecticideUsed: sprayTotalData.insecticideUsed || '',
          structuresFound: sprayTotalData.structuresFound || 0,
          structuresSprayed: sprayTotalData.structuresSprayed || 0,
          structuresNotSprayed: sprayTotalData.structuresNotSprayed || 0,
          compartmentsSprayed: sprayTotalData.compartmentsSprayed || 0,
          wallsType: sprayTotalData.wallsType || 'MATOPE',
          roofsType: sprayTotalData.roofsType || 'ZINCO',
          numberOfPersons: sprayTotalData.numberOfPersons || 0,
          childrenUnder5: sprayTotalData.childrenUnder5 || 0,
          pregnantWomen: sprayTotalData.pregnantWomen || 0,
          reasonNotSprayed: sprayTotalData.reasonNotSprayed || '',
        })
      } else if (sprayTotalRes.status === 404) {
        setErrors({ submit: 'Registro não encontrado' })
      }

      if (sprayersRes.ok) {
        const sprayersData = await sprayersRes.json()
        // Filter sprayers and brigade chiefs
        setSprayers(sprayersData.filter((actor: any) => actor.actorType?.name === 'Sprayer'))
        setBrigadeChiefs(sprayersData.filter((actor: any) => actor.actorType?.name === 'Brigade Chief'))
      }

      if (communitiesRes.ok) {
        const communitiesData = await communitiesRes.json()
        setCommunities(communitiesData)
      }

      if (sprayConfigsRes.ok) {
        const sprayConfigsData = await sprayConfigsRes.json()
        setSprayConfigurations(sprayConfigsData.filter((config: any) => config.isActive))
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setErrors({ submit: 'Erro ao carregar dados' })
    } finally {
      setIsFetchingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.sprayerId) {
      newErrors.sprayerId = 'Pulverizador é obrigatório'
    }
    
    if (!formData.brigadeChiefId) {
      newErrors.brigadeChiefId = 'Chefe de brigada é obrigatório'
    }

    if (!formData.communityId) {
      newErrors.communityId = 'Comunidade é obrigatória'
    }
    
    if (!formData.sprayDate) {
      newErrors.sprayDate = 'Data de pulverização é obrigatória'
    }

    if (!formData.insecticideUsed.trim()) {
      newErrors.insecticideUsed = 'Inseticida usado é obrigatório'
    }

    if (formData.structuresFound < 0) {
      newErrors.structuresFound = 'Estruturas encontradas não pode ser negativo'
    }

    if (formData.structuresSprayed < 0) {
      newErrors.structuresSprayed = 'Estruturas pulverizadas não pode ser negativo'
    }

    if (formData.structuresSprayed > formData.structuresFound) {
      newErrors.structuresSprayed = 'Estruturas pulverizadas não pode ser maior que encontradas'
    }

    if (formData.sprayRound < 1) {
      newErrors.sprayRound = 'Ronda deve ser pelo menos 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/spray-totals/${sprayTotalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/spray-totals?success=updated')
      } else {
        const data = await response.json()
        console.error('API Error:', response.status, data)
        
        if (response.status === 409) {
          setErrors({ submit: 'Já existe um registro similar' })
        } else if (response.status === 401) {
          setErrors({ submit: 'Não autorizado. Faça login novamente.' })
        } else if (response.status === 404) {
          setErrors({ submit: 'Registro não encontrado' })
        } else {
          setErrors({ submit: data.error || 'Erro ao atualizar registro' })
        }
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCommunityName = (community: Community) => {
    let name = community.name
    if (community.locality) {
      name += `, ${community.locality.name}`
      if (community.locality.district) {
        name += `, ${community.locality.district.name}`
        if (community.locality.district.province) {
          name += `, ${community.locality.district.province.name}`
        }
      }
    }
    return name
  }

  if (isFetchingData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium text-lg">Carregando dados...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (errors.submit && !sprayTotal) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Erro</h1>
            <p className="text-lg text-slate-600 mb-6">{errors.submit}</p>
            <Link
              href="/spray-totals"
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para registros
            </Link>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="mb-12">
            <Link 
              href="/spray-totals"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 mb-8 transition-all duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Voltar para registros
            </Link>
            
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              {/* Main header card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-40"></div>
                    <div className="relative bg-white p-3 rounded-xl shadow-lg">
                      <Edit3 className="h-10 w-10 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-8">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
                      Editar Registro
                    </h1>
                    <p className="mt-3 text-xl text-slate-600 font-medium">
                      Atualize os dados de pulverização existentes
                    </p>
                    {sprayTotal && (
                      <div className="mt-2 flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(sprayTotal.sprayDate).toLocaleDateString('pt-BR')}
                        {sprayTotal.community && (
                          <>
                            <span className="mx-2">•</span>
                            <MapPin className="h-4 w-4 mr-1" />
                            {formatCommunityName(sprayTotal.community)}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    <Sparkles className="h-8 w-8 text-orange-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Enhanced Error Alert */}
                {errors.submit && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                    <div className="relative bg-red-50 border border-red-200 rounded-xl p-6 flex items-start">
                      <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 mr-4 flex-shrink-0" />
                      <div className="text-red-800 font-medium">{errors.submit}</div>
                    </div>
                  </div>
                )}

                {/* Team Assignment Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Atribuição de Equipe</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Sprayer Field */}
                    <div className="group/field">
                      <label htmlFor="sprayerId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Pulverizador <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="sprayerId"
                          name="sprayerId"
                          value={formData.sprayerId}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium ${
                            errors.sprayerId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <option value="">Selecione o pulverizador</option>
                          {sprayers.map((sprayer) => (
                            <option key={sprayer.id} value={sprayer.id}>
                              {sprayer.name} {sprayer.number && `(${sprayer.number})`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.sprayerId && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.sprayerId}</p>
                      )}
                    </div>

                    {/* Brigade Chief Field */}
                    <div className="group/field">
                      <label htmlFor="brigadeChiefId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Chefe de Brigada <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="brigadeChiefId"
                          name="brigadeChiefId"
                          value={formData.brigadeChiefId}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium ${
                            errors.brigadeChiefId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <option value="">Selecione o chefe de brigada</option>
                          {brigadeChiefs.map((chief) => (
                            <option key={chief.id} value={chief.id}>
                              {chief.name} {chief.number && `(${chief.number})`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.brigadeChiefId && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.brigadeChiefId}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Configuration Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Localização e Configuração</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Community Field */}
                    <div className="group/field">
                      <label htmlFor="communityId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Comunidade <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="communityId"
                          name="communityId"
                          value={formData.communityId}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium ${
                            errors.communityId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <option value="">Selecione a comunidade</option>
                          {communities.map((community) => (
                            <option key={community.id} value={community.id}>
                              {formatCommunityName(community)}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.communityId && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.communityId}</p>
                      )}
                    </div>

                    {/* Spray Configuration Field */}
                    <div className="group/field">
                      <label htmlFor="sprayConfigurationId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Configuração de Pulverização
                      </label>
                      <div className="relative">
                        <select
                          id="sprayConfigurationId"
                          name="sprayConfigurationId"
                          value={formData.sprayConfigurationId}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="">Configuração opcional</option>
                          {sprayConfigurations.map((config) => (
                            <option key={config.id} value={config.id}>
                              {config.year} - {config.description || `Meta: ${config.sprayTarget} estruturas`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 font-medium">
                        Associe este registro a uma configuração de pulverização específica
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spray Details Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <Droplets className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Detalhes da Pulverização</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Spray Date */}
                    <div className="group/field">
                      <label htmlFor="sprayDate" className="block text-sm font-semibold text-slate-700 mb-3">
                        Data de Pulverização <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="date"
                          id="sprayDate"
                          name="sprayDate"
                          value={formData.sprayDate}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg font-medium ${
                            errors.sprayDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.sprayDate && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.sprayDate}</p>
                      )}
                    </div>

                    {/* Spray Type */}
                    <div className="group/field">
                      <label htmlFor="sprayType" className="block text-sm font-semibold text-slate-700 mb-3">
                        Tipo de Pulverização
                      </label>
                      <div className="relative">
                        <select
                          id="sprayType"
                          name="sprayType"
                          value={formData.sprayType}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="PRINCIPAL">Principal</option>
                          <option value="SECUNDARIA">Secundária</option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Spray Status */}
                    <div className="group/field">
                      <label htmlFor="sprayStatus" className="block text-sm font-semibold text-slate-700 mb-3">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          id="sprayStatus"
                          name="sprayStatus"
                          value={formData.sprayStatus}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="PLANNED">Planeado</option>
                          <option value="IN_PROGRESS">Em Progresso</option>
                          <option value="COMPLETED">Completo</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Spray Round */}
                    <div className="group/field">
                      <label htmlFor="sprayRound" className="block text-sm font-semibold text-slate-700 mb-3">
                        Ronda de Pulverização
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="sprayRound"
                          name="sprayRound"
                          value={formData.sprayRound}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg font-medium ${
                            errors.sprayRound ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.sprayRound && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.sprayRound}</p>
                      )}
                    </div>

                    {/* Insecticide Used */}
                    <div className="group/field md:col-span-2">
                      <label htmlFor="insecticideUsed" className="block text-sm font-semibold text-slate-700 mb-3">
                        Inseticida Usado <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="insecticideUsed"
                          name="insecticideUsed"
                          value={formData.insecticideUsed}
                          onChange={handleInputChange}
                          placeholder="Ex: Deltamethrin, Pirimiphos-methyl..."
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-slate-400 text-lg font-medium ${
                            errors.insecticideUsed ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.insecticideUsed && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.insecticideUsed}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Structures Data Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <Home className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Dados das Estruturas</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Structures Found */}
                    <div className="group/field">
                      <label htmlFor="structuresFound" className="block text-sm font-semibold text-slate-700 mb-3">
                        Estruturas Encontradas
                      </label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          id="structuresFound"
                          name="structuresFound"
                          value={formData.structuresFound}
                          onChange={handleInputChange}
                          min="0"
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg font-medium ${
                            errors.structuresFound ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.structuresFound && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.structuresFound}</p>
                      )}
                    </div>

                    {/* Structures Sprayed */}
                    <div className="group/field">
                      <label htmlFor="structuresSprayed" className="block text-sm font-semibold text-slate-700 mb-3">
                        Estruturas Pulverizadas
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="structuresSprayed"
                          name="structuresSprayed"
                          value={formData.structuresSprayed}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.structuresFound}
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg font-medium ${
                            errors.structuresSprayed ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.structuresSprayed && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.structuresSprayed}</p>
                      )}
                    </div>

                    {/* Structures Not Sprayed (Auto-calculated) */}
                    <div className="group/field">
                      <label htmlFor="structuresNotSprayed" className="block text-sm font-semibold text-slate-700 mb-3">
                        Não Pulverizadas
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="structuresNotSprayed"
                          name="structuresNotSprayed"
                          value={formData.structuresNotSprayed}
                          readOnly
                          className="w-full px-6 py-4 border-2 rounded-xl bg-slate-100/80 backdrop-blur-sm text-lg font-medium border-slate-200 text-slate-600"
                        />
                      </div>
                      <p className="mt-2 text-sm text-slate-500 font-medium">
                        Calculado automaticamente
                      </p>
                    </div>

                    {/* Compartments Sprayed */}
                    <div className="group/field">
                      <label htmlFor="compartmentsSprayed" className="block text-sm font-semibold text-slate-700 mb-3">
                        Compartimentos Pulverizados
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="compartmentsSprayed"
                          name="compartmentsSprayed"
                          value={formData.compartmentsSprayed}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* Structure Types */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Walls Type */}
                    <div className="group/field">
                      <label htmlFor="wallsType" className="block text-sm font-semibold text-slate-700 mb-3">
                        Tipo de Paredes
                      </label>
                      <div className="relative">
                        <select
                          id="wallsType"
                          name="wallsType"
                          value={formData.wallsType}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="MATOPE">Matope</option>
                          <option value="COLMO">Colmo</option>
                          <option value="CIMENTO">Cimento</option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Roofs Type */}
                    <div className="group/field">
                      <label htmlFor="roofsType" className="block text-sm font-semibold text-slate-700 mb-3">
                        Tipo de Telhados
                      </label>
                      <div className="relative">
                        <select
                          id="roofsType"
                          name="roofsType"
                          value={formData.roofsType}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="CAPIM_PLASTICO">Capim/Plástico</option>
                          <option value="ZINCO">Zinco</option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Population Data Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <Users className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Dados Populacionais</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Number of Persons */}
                    <div className="group/field">
                      <label htmlFor="numberOfPersons" className="block text-sm font-semibold text-slate-700 mb-3">
                        Número de Pessoas
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          id="numberOfPersons"
                          name="numberOfPersons"
                          value={formData.numberOfPersons}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full pl-12 pr-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Children Under 5 */}
                    <div className="group/field">
                      <label htmlFor="childrenUnder5" className="block text-sm font-semibold text-slate-700 mb-3">
                        Crianças &lt;5 anos
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="childrenUnder5"
                          name="childrenUnder5"
                          value={formData.childrenUnder5}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.numberOfPersons}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Pregnant Women */}
                    <div className="group/field">
                      <label htmlFor="pregnantWomen" className="block text-sm font-semibold text-slate-700 mb-3">
                        Mulheres Grávidas
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="pregnantWomen"
                          name="pregnantWomen"
                          value={formData.pregnantWomen}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.numberOfPersons}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason Not Sprayed Section */}
                {formData.structuresNotSprayed > 0 && (
                  <div className="group">
                    <div className="flex items-center mb-8">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                        <div className="relative bg-white p-2 rounded-lg">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <h3 className="ml-4 text-2xl font-bold text-slate-800">Motivo Não Pulverizado</h3>
                    </div>
                    
                    <div className="group/field">
                      <label htmlFor="reasonNotSprayed" className="block text-sm font-semibold text-slate-700 mb-3">
                        Por que algumas estruturas não foram pulverizadas?
                      </label>
                      <div className="relative">
                        <select
                          id="reasonNotSprayed"
                          name="reasonNotSprayed"
                          value={formData.reasonNotSprayed}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-lg font-medium border-slate-200 hover:border-slate-300"
                        >
                          <option value="">Selecione o motivo</option>
                          <option value="RECUSA">Recusa do morador</option>
                          <option value="FECHADA">Casa fechada/ausente</option>
                          <option value="OUTRO">Outro motivo</option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex items-center justify-end space-x-6 pt-10 border-t border-slate-200">
                  <Link
                    href="/spray-totals"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-6 w-6 mr-3" />
                        Atualizar Registro
                      </>
                    )}
                    <div className="absolute inset-0 rounded-xl bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}