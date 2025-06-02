'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Settings, Calendar, MapPin, Target, Sparkles } from 'lucide-react'
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
  province?: Province
}

export default function NewSprayConfigPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingLocations, setIsFetchingLocations] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    provinceId: '',
    districtId: '',
    proposedSprayDays: 30,
    sprayTarget: 10000,
    startDate: '',
    endDate: '',
    sprayRounds: 1,
    daysBetweenRounds: 21,
    description: '',
    notes: '',
    isActive: true,
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    // Filter districts based on selected province
    if (formData.provinceId) {
      setFilteredDistricts(districts.filter(d => d.provinceId === formData.provinceId))
    } else {
      setFilteredDistricts([])
    }
    
    // Reset district selection when province changes
    if (formData.districtId && !filteredDistricts.some(d => d.id === formData.districtId)) {
      setFormData(prev => ({ ...prev, districtId: '' }))
    }
  }, [formData.provinceId, districts])

  const fetchLocations = async () => {
    try {
      setIsFetchingLocations(true)
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
    }))
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
      const response = await fetch('/api/spray-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/spray-config?success=created')
      } else {
        const data = await response.json()
        console.error('API Error:', response.status, data)
        
        if (response.status === 409) {
          setErrors({ submit: 'Já existe uma configuração para este ano e localização' })
        } else if (response.status === 401) {
          setErrors({ submit: 'Não autorizado. Faça login novamente.' })
        } else {
          setErrors({ submit: data.error || 'Erro ao criar configuração' })
        }
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
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
                      Nova Configuração
                    </h1>
                    <p className="mt-3 text-xl text-slate-600 font-medium">
                      Configure os parâmetros para uma campanha de pulverização inteligente
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
                        Criando...
                      </>
                    ) : (
                      <>
                        <Save className="h-6 w-6 mr-3" />
                        Criar Configuração
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