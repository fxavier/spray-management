'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Loader2, Calendar, MapPin, Target, Settings, Sparkles } from 'lucide-react'
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
  provinceId: string
}

export default function EditSprayConfigurationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchingLocations, setIsFetchingLocations] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    provinceId: '',
    districtId: '',
    proposedSprayDays: 30,
    sprayTarget: 0,
    startDate: '',
    endDate: '',
    sprayRounds: 1,
    daysBetweenRounds: 21,
    description: '',
    notes: '',
    isActive: true,
  })

  useEffect(() => {
    Promise.all([fetchConfiguration(), fetchLocations()])
  }, [params.id])

  useEffect(() => {
    // Filter districts based on selected province
    if (formData.provinceId) {
      setFilteredDistricts(districts.filter(d => d.provinceId === formData.provinceId))
    } else {
      setFilteredDistricts([])
    }
  }, [formData.provinceId, districts])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/spray-configurations/${params.id}`)
      if (response.ok) {
        const config = await response.json()
        setFormData({
          year: config.year || new Date().getFullYear(),
          provinceId: config.provinceId || '',
          districtId: config.districtId || '',
          proposedSprayDays: config.proposedSprayDays || 30,
          sprayTarget: config.sprayTarget || 0,
          startDate: config.startDate ? config.startDate.split('T')[0] : '',
          endDate: config.endDate ? config.endDate.split('T')[0] : '',
          sprayRounds: config.sprayRounds || 1,
          daysBetweenRounds: config.daysBetweenRounds || 21,
          description: config.description || '',
          notes: config.notes || '',
          isActive: config.isActive ?? true,
        })
      } else {
        setErrors({ fetch: 'Erro ao carregar configuração' })
      }
    } catch (_error) {
      setErrors({ fetch: 'Erro ao conectar com o servidor' })
    } finally {
      setIsFetching(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const [provincesRes, districtsRes] = await Promise.all([
        fetch('/api/provinces'),
        fetch('/api/districts')
      ])

      if (provincesRes.ok) {
        const provincesData = await provincesRes.json()
        setProvinces(provincesData)
      }

      if (districtsRes.ok) {
        const districtsData = await districtsRes.json()
        setDistricts(districtsData)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setIsFetchingLocations(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'provinceId' && value !== formData.provinceId) {
      // Reset district when province changes
      setFormData(prev => ({
        ...prev,
        provinceId: value,
        districtId: ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.year || formData.year < 2020 || formData.year > 2050) {
      newErrors.year = 'Ano deve estar entre 2020 e 2050'
    }
    
    if (formData.proposedSprayDays < 1 || formData.proposedSprayDays > 365) {
      newErrors.proposedSprayDays = 'Dias propostos deve estar entre 1 e 365'
    }

    if (formData.sprayTarget < 1) {
      newErrors.sprayTarget = 'Meta de estruturas deve ser maior que zero'
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (start >= end) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início'
      }
    }
    
    if (formData.sprayRounds < 1 || formData.sprayRounds > 10) {
      newErrors.sprayRounds = 'Número de rondas deve estar entre 1 e 10'
    }
    
    if (formData.sprayRounds > 1 && formData.daysBetweenRounds < 1) {
      newErrors.daysBetweenRounds = 'Dias entre rondas deve ser pelo menos 1'
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
      const response = await fetch(`/api/spray-configurations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/spray-config?success=updated')
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || 'Erro ao actualizar configuração' })
      }
    } catch (_error) {
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar configuração...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (errors.fetch) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar configuração</h2>
            <p className="text-red-600 mb-4">{errors.fetch}</p>
            <Link
              href="/spray-config"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
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
              href="/spray-config"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 mb-8 transition-all duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Voltar para configurações
            </Link>
            
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
              
              {/* Main header card */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-40"></div>
                    <div className="relative bg-white p-3 rounded-xl shadow-lg">
                      <Settings className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-8">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                      Editar Configuração
                    </h1>
                    <p className="mt-3 text-xl text-slate-600 font-medium">
                      Actualize os parâmetros da campanha de pulverização inteligente
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
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

                {/* Basic Information Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Informações Básicas</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Year Field */}
                    <div className="group/field">
                      <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-3">
                        Ano <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          min="2020"
                          max="2050"
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-slate-400 text-lg font-medium ${
                            errors.year ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.year && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.year}</p>
                      )}
                    </div>

                    {/* Proposed Spray Days */}
                    <div className="group/field">
                      <label htmlFor="proposedSprayDays" className="block text-sm font-semibold text-slate-700 mb-3">
                        Dias de Pulverização <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="proposedSprayDays"
                          name="proposedSprayDays"
                          value={formData.proposedSprayDays}
                          onChange={handleInputChange}
                          min="1"
                          max="365"
                          className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-slate-400 text-lg font-medium ${
                            errors.proposedSprayDays ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.proposedSprayDays && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.proposedSprayDays}</p>
                      )}
                    </div>

                    {/* Spray Target */}
                    <div className="group/field">
                      <label htmlFor="sprayTarget" className="block text-sm font-semibold text-slate-700 mb-3">
                        Meta de Estruturas <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          id="sprayTarget"
                          name="sprayTarget"
                          value={formData.sprayTarget}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full pl-12 pr-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-slate-400 text-lg font-medium ${
                            errors.sprayTarget ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          placeholder="Ex: 15000"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover/field:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                      {errors.sprayTarget && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.sprayTarget}</p>
                      )}
                      <p className="mt-2 text-sm text-slate-500 font-medium">
                        Número total de estruturas a pulverizar neste período
                      </p>
                    </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

                {/* Location Section */}
                <div className="group">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                      <div className="relative bg-white p-2 rounded-lg">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="ml-4 text-2xl font-bold text-slate-800">Localização</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Province Field */}
                    <div className="group/field">
                      <label htmlFor="provinceId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Província
                      </label>
                      <select
                        id="provinceId"
                        name="provinceId"
                        value={formData.provinceId}
                        onChange={handleInputChange}
                        disabled={isFetchingLocations}
                        className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium ${
                          isFetchingLocations ? 'bg-slate-100 cursor-not-allowed' : 'hover:border-slate-300'
                        } border-slate-200`}
                      >
                        <option value="">Todas as províncias</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-slate-500 font-medium">
                        Deixe vazio para configuração nacional
                      </p>
                    </div>

                    {/* District Field */}
                    <div className="group/field">
                      <label htmlFor="districtId" className="block text-sm font-semibold text-slate-700 mb-3">
                        Distrito
                      </label>
                      <select
                        id="districtId"
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleInputChange}
                        disabled={!formData.provinceId || isFetchingLocations}
                        className={`w-full px-6 py-4 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg font-medium ${
                          !formData.provinceId || isFetchingLocations ? 'bg-slate-100 cursor-not-allowed' : 'hover:border-slate-300'
                        } border-slate-200`}
                      >
                        <option value="">Todos os distritos</option>
                        {filteredDistricts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-slate-500 font-medium">
                        Selecione uma província primeiro
                      </p>
                    </div>
                  </div>
                </div>

            {/* Spray Rounds Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rondas de Pulverização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spray Rounds */}
                <div>
                  <label htmlFor="sprayRounds" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Rondas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="sprayRounds"
                    name="sprayRounds"
                    value={formData.sprayRounds}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.sprayRounds ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.sprayRounds && (
                    <p className="mt-1 text-sm text-red-600">{errors.sprayRounds}</p>
                  )}
                </div>

                {/* Days Between Rounds */}
                <div>
                  <label htmlFor="daysBetweenRounds" className="block text-sm font-medium text-gray-700 mb-2">
                    Dias entre Rondas
                  </label>
                  <input
                    type="number"
                    id="daysBetweenRounds"
                    name="daysBetweenRounds"
                    value={formData.daysBetweenRounds}
                    onChange={handleInputChange}
                    min="0"
                    disabled={formData.sprayRounds <= 1}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.daysBetweenRounds ? 'border-red-300' : 'border-gray-300'
                    } ${formData.sprayRounds <= 1 ? 'bg-gray-100' : ''}`}
                  />
                  {errors.daysBetweenRounds && (
                    <p className="mt-1 text-sm text-red-600">{errors.daysBetweenRounds}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Descrição breve da configuração..."
                />
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Notas adicionais..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Configuração Activa
                </label>
              </div>
            </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center justify-end space-x-6 pt-10 border-t border-slate-200">
                  <Link
                    href="/spray-config"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative inline-flex items-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-6 w-6 mr-3" />
                        Actualizar Configuração
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