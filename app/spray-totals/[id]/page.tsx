'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Edit3, AlertCircle, Calendar, MapPin, Users, Activity, Sparkles, Home, Target, Droplets, Eye, Info, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  sprayYear: number
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
  createdAt: string
  updatedAt: string
  sprayer?: User
  brigadeChief?: User
  community?: Community
  sprayConfiguration?: SprayConfiguration
}

export default function ViewSprayTotalPage() {
  const params = useParams()
  // const router = useRouter()
  const sprayTotalId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [sprayTotal, setSprayTotal] = useState<SprayTotal | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchSprayTotal()
  }, [sprayTotalId])

  const fetchSprayTotal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/spray-totals/${sprayTotalId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSprayTotal(data)
      } else if (response.status === 404) {
        setError('Registro não encontrado')
      } else {
        setError('Erro ao carregar registro')
      }
    } catch (error) {
      console.error('Error fetching spray total:', error)
      setError('Erro ao conectar com o servidor')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completo'
      case 'IN_PROGRESS':
        return 'Em Progresso'
      case 'PLANNED':
        return 'Planeado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'PRINCIPAL':
        return 'Principal'
      case 'SECUNDARIA':
        return 'Secundária'
      default:
        return type
    }
  }

  const getWallsTypeText = (type: string) => {
    switch (type) {
      case 'MATOPE':
        return 'Matope'
      case 'COLMO':
        return 'Colmo'
      case 'CIMENTO':
        return 'Cimento'
      default:
        return type
    }
  }

  const getRoofsTypeText = (type: string) => {
    switch (type) {
      case 'CAPIM_PLASTICO':
        return 'Capim/Plástico'
      case 'ZINCO':
        return 'Zinco'
      default:
        return type
    }
  }

  const getReasonNotSprayedText = (reason: string) => {
    switch (reason) {
      case 'RECUSA':
        return 'Recusa do morador'
      case 'FECHADA':
        return 'Casa fechada/ausente'
      case 'OUTRO':
        return 'Outro motivo'
      default:
        return reason || 'Não especificado'
    }
  }

  const calculateCoveragePercentage = () => {
    if (!sprayTotal || sprayTotal.structuresFound === 0) return 0
    return (sprayTotal.structuresSprayed / sprayTotal.structuresFound) * 100
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
            </div>
            <p className="mt-6 text-slate-600 font-medium text-lg">Carregando registro...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (error || !sprayTotal) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Erro</h1>
            <p className="text-lg text-slate-600 mb-6">{error}</p>
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
        <div className="max-w-6xl mx-auto p-6">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              {/* Main header card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-40"></div>
                      <div className="relative bg-white p-3 rounded-xl shadow-lg">
                        <Eye className="h-10 w-10 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-8">
                      <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                        Visualizar Registro
                      </h1>
                      <p className="mt-3 text-xl text-slate-600 font-medium">
                        Detalhes completos do registro de pulverização
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(sprayTotal.sprayDate)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {sprayTotal.community && formatCommunityName(sprayTotal.community)}
                        </div>
                        <Badge className={`${getStatusColor(sprayTotal.sprayStatus)} border`}>
                          {getStatusText(sprayTotal.sprayStatus)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/spray-totals/${sprayTotal.id}/edit`}
                      className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Edit3 className="h-5 w-5 mr-2" />
                      Editar
                    </Link>
                    <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coverage Percentage */}
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
                      {calculateCoveragePercentage().toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {sprayTotal.structuresSprayed} de {sprayTotal.structuresFound} estruturas
                    </p>
                  </CardContent>
                </Card>

                {/* Population Protected */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>População Protegida</span>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-blue-600">
                      {sprayTotal.numberOfPersons}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {sprayTotal.childrenUnder5} crianças &lt;5 anos
                    </p>
                  </CardContent>
                </Card>

                {/* Spray Round */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                  <CardHeader className="pb-3 relative">
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                      <span>Ronda</span>
                      <Activity className="h-4 w-4 text-purple-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-black text-purple-600">
                      {sprayTotal.sprayRound}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      {getTypeText(sprayTotal.sprayType)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Spray Details Section */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-purple-600" />
                      Detalhes da Pulverização
                    </CardTitle>
                    <CardDescription>
                      Informações específicas sobre a operação de pulverização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Data de Pulverização</label>
                        <div className="mt-1 flex items-center text-lg font-medium text-slate-800">
                          <Calendar className="h-5 w-5 mr-2 text-slate-500" />
                          {formatDate(sprayTotal.sprayDate)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Ano da Campanha</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {sprayTotal.sprayYear}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Tipo de Pulverização</label>
                        <div className="mt-1">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {getTypeText(sprayTotal.sprayType)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Status</label>
                        <div className="mt-1">
                          <Badge className={`${getStatusColor(sprayTotal.sprayStatus)} border`}>
                            {getStatusText(sprayTotal.sprayStatus)}
                          </Badge>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Inseticida Usado</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {sprayTotal.insecticideUsed}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Structures Data Section */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-orange-600" />
                      Dados das Estruturas
                    </CardTitle>
                    <CardDescription>
                      Informações detalhadas sobre as estruturas tratadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Encontradas</label>
                        <div className="mt-1 text-2xl font-bold text-slate-800">
                          {sprayTotal.structuresFound}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Pulverizadas</label>
                        <div className="mt-1 text-2xl font-bold text-green-600">
                          {sprayTotal.structuresSprayed}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Não Pulverizadas</label>
                        <div className="mt-1 text-2xl font-bold text-red-600">
                          {sprayTotal.structuresNotSprayed}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Compartimentos</label>
                        <div className="mt-1 text-2xl font-bold text-slate-800">
                          {sprayTotal.compartmentsSprayed}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Tipo de Paredes</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {getWallsTypeText(sprayTotal.wallsType)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Tipo de Telhados</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {getRoofsTypeText(sprayTotal.roofsType)}
                        </div>
                      </div>
                    </div>

                    {sprayTotal.structuresNotSprayed > 0 && sprayTotal.reasonNotSprayed && (
                      <div className="pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700">Motivo Não Pulverizado</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {getReasonNotSprayedText(sprayTotal.reasonNotSprayed)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* Population Data Section */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-600" />
                      Dados Populacionais
                    </CardTitle>
                    <CardDescription>
                      Informações sobre a população beneficiada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Total de Pessoas</label>
                        <div className="mt-1 text-2xl font-bold text-teal-600">
                          {sprayTotal.numberOfPersons}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Crianças &lt;5 anos</label>
                        <div className="mt-1 text-2xl font-bold text-blue-600">
                          {sprayTotal.childrenUnder5}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {sprayTotal.numberOfPersons > 0 ? 
                            `${((sprayTotal.childrenUnder5 / sprayTotal.numberOfPersons) * 100).toFixed(1)}% do total` : 
                            '0% do total'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Mulheres Grávidas</label>
                        <div className="mt-1 text-2xl font-bold text-pink-600">
                          {sprayTotal.pregnantWomen}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {sprayTotal.numberOfPersons > 0 ? 
                            `${((sprayTotal.pregnantWomen / sprayTotal.numberOfPersons) * 100).toFixed(1)}% do total` : 
                            '0% do total'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Right Column - Team & Location Info */}
            <div className="space-y-8">
              {/* Team Information */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Equipe
                    </CardTitle>
                    <CardDescription>
                      Informações da equipe responsável
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Pulverizador</label>
                      <div className="mt-1 text-lg font-medium text-slate-800">
                        {sprayTotal.sprayer?.name || 'Não especificado'}
                        {sprayTotal.sprayer?.number && (
                          <span className="text-sm text-slate-500 ml-2">
                            ({sprayTotal.sprayer.number})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Chefe de Brigada</label>
                      <div className="mt-1 text-lg font-medium text-slate-800">
                        {sprayTotal.brigadeChief?.name || 'Não especificado'}
                        {sprayTotal.brigadeChief?.number && (
                          <span className="text-sm text-slate-500 ml-2">
                            ({sprayTotal.brigadeChief.number})
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Location Information */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Localização
                    </CardTitle>
                    <CardDescription>
                      Informações geográficas do registro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sprayTotal.community && (
                      <>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Comunidade</label>
                          <div className="mt-1 text-lg font-medium text-slate-800">
                            {sprayTotal.community.name}
                          </div>
                        </div>
                        {sprayTotal.community.locality && (
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Localidade</label>
                            <div className="mt-1 text-lg font-medium text-slate-800">
                              {sprayTotal.community.locality.name}
                            </div>
                          </div>
                        )}
                        {sprayTotal.community.locality?.district && (
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Distrito</label>
                            <div className="mt-1 text-lg font-medium text-slate-800">
                              {sprayTotal.community.locality.district.name}
                            </div>
                          </div>
                        )}
                        {sprayTotal.community.locality?.district?.province && (
                          <div>
                            <label className="text-sm font-semibold text-slate-700">Província</label>
                            <div className="mt-1 text-lg font-medium text-slate-800">
                              {sprayTotal.community.locality.district.province.name}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* Configuration Information */}
              {sprayTotal.sprayConfiguration && (
                <Card className="relative overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl blur"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-600" />
                        Configuração
                      </CardTitle>
                      <CardDescription>
                        Configuração de pulverização associada
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Ano</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {sprayTotal.sprayConfiguration.year}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Meta de Estruturas</label>
                        <div className="mt-1 text-lg font-medium text-slate-800">
                          {sprayTotal.sprayConfiguration.sprayTarget.toLocaleString()}
                        </div>
                      </div>
                      {sprayTotal.sprayConfiguration.description && (
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Descrição</label>
                          <div className="mt-1 text-lg font-medium text-slate-800">
                            {sprayTotal.sprayConfiguration.description}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              )}

              {/* Meta Information */}
              <Card className="relative overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-xl blur"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-slate-600" />
                      Informações do Sistema
                    </CardTitle>
                    <CardDescription>
                      Dados de criação e modificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">ID do Registro</label>
                      <div className="mt-1 text-sm font-mono text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                        {sprayTotal.id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Criado em</label>
                      <div className="mt-1 flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDateTime(sprayTotal.createdAt)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Última atualização</label>
                      <div className="mt-1 flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDateTime(sprayTotal.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}