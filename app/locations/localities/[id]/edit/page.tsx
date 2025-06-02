'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, MapPin } from 'lucide-react'
import Link from 'next/link'

interface District {
  id: string
  name: string
  code?: string
  province?: {
    id: string
    name: string
    code?: string
  }
}

interface Locality {
  id: string
  name: string
  districtId: string
  district?: District
}

export default function EditLocalityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [districts, setDistricts] = useState<District[]>([])
  const [locality, setLocality] = useState<Locality | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    districtId: '',
  })

  useEffect(() => {
    fetchLocalityAndDistricts()
  }, [params.id])

  const fetchLocalityAndDistricts = async () => {
    try {
      const [localityResponse, districtsResponse] = await Promise.all([
        fetch(`/api/localities/${params.id}`),
        fetch('/api/districts')
      ])

      if (localityResponse.ok) {
        const localityData = await localityResponse.json()
        setLocality(localityData)
        setFormData({
          name: localityData.name,
          districtId: localityData.districtId,
        })
      } else {
        setErrors({ submit: 'Localidade não encontrada' })
      }

      if (districtsResponse.ok) {
        const districtsData = await districtsResponse.json()
        setDistricts(districtsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrors({ submit: 'Erro ao carregar dados' })
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }
    
    if (!formData.districtId) {
      newErrors.districtId = 'Distrito é obrigatório'
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
      const response = await fetch(`/api/localities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/locations?success=updated&type=locality')
      } else {
        const data = await response.json()
        console.error('API Error:', response.status, data)
        
        if (response.status === 409 || data.error?.includes('já existe')) {
          setErrors({ name: 'Uma localidade com este nome já existe neste distrito' })
        } else if (data.error?.includes('Unique constraint') || data.error?.includes('P2002')) {
          setErrors({ submit: 'Esta localidade já existe no distrito selecionado' })
        } else {
          setErrors({ submit: data.error || 'Erro ao atualizar localidade' })
        }
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedDistrict = districts.find(d => d.id === formData.districtId)

  if (isFetching) {
    return (
      <ProtectedLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!locality) {
    return (
      <ProtectedLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Localidade não encontrada</h2>
            <p className="text-gray-600 mb-4">A localidade que você está procurando não existe.</p>
            <Link
              href="/locations"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para localizações
            </Link>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/locations"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para localizações
          </Link>
          
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Localidade</h1>
              <p className="mt-1 text-gray-600">
                Edite as informações da localidade
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Alert */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* District Selection */}
              <div>
                <label htmlFor="districtId" className="block text-sm font-medium text-gray-700 mb-2">
                  Distrito <span className="text-red-500">*</span>
                </label>
                <select
                  id="districtId"
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.districtId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione um distrito</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name} {district.code && `(${district.code})`}
                      {district.province && ` - ${district.province.name}`}
                    </option>
                  ))}
                </select>
                {errors.districtId && (
                  <p className="mt-1 text-sm text-red-600">{errors.districtId}</p>
                )}
                {selectedDistrict && (
                  <p className="mt-1 text-xs text-gray-500">
                    Província: {selectedDistrict.province?.name} 
                    {selectedDistrict.province?.code && ` (${selectedDistrict.province.code})`}
                  </p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Localidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Sede, Centro, Vila..."
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                href="/locations"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    A atualizar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Atualizar Localidade
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  )
}