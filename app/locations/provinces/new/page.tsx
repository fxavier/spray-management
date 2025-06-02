'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Map } from 'lucide-react'
import Link from 'next/link'

interface ExistingProvince {
  id: string
  name: string
  code?: string
}

export default function NewProvincePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingProvinces, setExistingProvinces] = useState<ExistingProvince[]>([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  })

  useEffect(() => {
    fetchExistingProvinces()
  }, [])

  const fetchExistingProvinces = async () => {
    try {
      const response = await fetch('/api/provinces')
      if (response.ok) {
        const data = await response.json()
        setExistingProvinces(data)
      }
    } catch (error) {
      console.error('Error fetching existing provinces:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (formData.code && !/^[A-Z]{2,5}$/.test(formData.code)) {
      newErrors.code = 'Código deve conter 2-5 letras maiúsculas'
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
      const response = await fetch('/api/provinces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/locations?success=created&type=province')
      } else {
        const data = await response.json()
        console.error('API Error:', response.status, data)
        
        if (response.status === 409 || data.error?.includes('já existe')) {
          // Handle duplicate constraints
          if (data.error?.toLowerCase().includes('código') || data.error?.includes('code')) {
            setErrors({ code: 'Este código já está em uso por outra província' })
          } else {
            setErrors({ name: 'Uma província com este nome já existe' })
          }
        } else if (data.error?.includes('Unique constraint') || data.error?.includes('P2002')) {
          setErrors({ submit: 'Esta província ou código já existe no sistema' })
        } else {
          setErrors({ submit: data.error || 'Erro ao criar província' })
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
            <Map className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Província</h1>
              <p className="mt-1 text-gray-600">
                Adicione uma nova província ao sistema
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
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Província <span className="text-red-500">*</span>
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
                  placeholder="Ex: Maputo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Code Field */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Província
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
                  placeholder="Ex: MP"
                  maxLength={5}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Opcional. Use 2-5 letras maiúsculas. Útil para relatórios e referências rápidas.
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
                    Criar Província
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Provinces Info */}
        {existingProvinces.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Províncias Existentes</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Certifique-se de que o nome e código não conflitem com as províncias já existentes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {existingProvinces.map((province) => (
                <div key={province.id} className="text-sm text-yellow-800 bg-yellow-100 rounded px-2 py-1">
                  <span className="font-medium">{province.name}</span>
                  {province.code && <span className="text-yellow-600"> ({province.code})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Dica</h3>
          <p className="text-sm text-blue-700">
            Após criar a província, você poderá adicionar distritos a ela. Os distritos podem então ter localidades, 
            e as localidades podem ter comunidades, formando a hierarquia completa de localizações.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  )
}