'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Province {
  id: string
  name: string
  code?: string
}

export default function NewDistrictPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingProvinces, setIsFetchingProvinces] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [provinces, setProvinces] = useState<Province[]>([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    provinceId: '',
  })

  useEffect(() => {
    fetchProvinces()
  }, [])

  const fetchProvinces = async () => {
    try {
      const response = await fetch('/api/provinces')
      if (response.ok) {
        const data = await response.json()
        setProvinces(data)
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setIsFetchingProvinces(false)
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
    
    if (!formData.provinceId) {
      newErrors.provinceId = 'Província é obrigatória'
    }
    
    if (formData.code && !/^[A-Z0-9]{2,10}$/.test(formData.code)) {
      newErrors.code = 'Código deve conter 2-10 caracteres (letras maiúsculas e números)'
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
      const response = await fetch('/api/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/locations?success=created&type=district')
      } else {
        const data = await response.json()
        if (data.error?.includes('Unique constraint')) {
          if (data.error.includes('code')) {
            setErrors({ code: 'Este código já está em uso nesta província' })
          } else {
            setErrors({ name: 'Este distrito já existe nesta província' })
          }
        } else {
          setErrors({ submit: data.error || 'Erro ao criar distrito' })
        }
      }
    } catch (_error) {
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
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
            <Building2 className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Distrito</h1>
              <p className="mt-1 text-gray-600">
                Adicione um novo distrito a uma província
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
              {/* Province Field */}
              <div>
                <label htmlFor="provinceId" className="block text-sm font-medium text-gray-700 mb-2">
                  Província <span className="text-red-500">*</span>
                </label>
                <select
                  id="provinceId"
                  name="provinceId"
                  value={formData.provinceId}
                  onChange={handleInputChange}
                  disabled={isFetchingProvinces}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.provinceId ? 'border-red-300' : 'border-gray-300'
                  } ${isFetchingProvinces ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione uma província</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name} {province.code && `(${province.code})`}
                    </option>
                  ))}
                </select>
                {errors.provinceId && (
                  <p className="mt-1 text-sm text-red-600">{errors.provinceId}</p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Distrito <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Maputo Cidade"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Code Field */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Distrito
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: MPC"
                  maxLength={10}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Opcional. Use 2-10 caracteres (letras maiúsculas e números).
                </p>
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
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    A criar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Distrito
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Dica</h3>
          <p className="text-sm text-blue-700">
            Após criar o distrito, você poderá adicionar localidades a ele. As localidades podem então ter comunidades,
            completando a hierarquia de localizações.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  )
}