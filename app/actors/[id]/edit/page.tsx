'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditActorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchingTypes, setIsFetchingTypes] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [actorTypes, setActorTypes] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    number: '',
    actorTypeId: '',
    isActive: true,
  })

  useEffect(() => {
    Promise.all([fetchActor(), fetchActorTypes()])
  }, [params.id])

  const fetchActor = async () => {
    try {
      const response = await fetch(`/api/actors/${params.id}`)
      if (response.ok) {
        const actor = await response.json()
        setFormData({
          name: actor.name || '',
          description: actor.description || '',
          number: actor.number || '',
          actorTypeId: actor.actorTypeId || '',
          isActive: actor.isActive ?? true,
        })
      } else {
        setErrors({ fetch: 'Erro ao carregar dados do actor' })
      }
    } catch (error) {
      setErrors({ fetch: 'Erro ao conectar com o servidor' })
    } finally {
      setIsFetching(false)
    }
  }

  const fetchActorTypes = async () => {
    try {
      const response = await fetch('/api/actor-types')
      if (response.ok) {
        const types = await response.json()
        setActorTypes(types)
      }
    } catch (error) {
      console.error('Error fetching actor types:', error)
    } finally {
      setIsFetchingTypes(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
    }
    
    if (!formData.actorTypeId) {
      newErrors.actorTypeId = 'Tipo de actor é obrigatório'
    }
    
    if (formData.number && !/^[A-Z0-9-]+$/.test(formData.number)) {
      newErrors.number = 'Número deve conter apenas letras maiúsculas, números e hífens'
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
      const response = await fetch(`/api/actors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.push('/actors?success=updated')
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || 'Erro ao actualizar actor' })
      }
    } catch (error) {
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
            <p className="text-gray-600">A carregar dados do actor...</p>
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
            <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar actor</h2>
            <p className="text-red-600 mb-4">{errors.fetch}</p>
            <Link
              href="/actors"
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/actors"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para lista
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Editar Actor</h1>
          <p className="mt-2 text-gray-600">
            Actualize os dados do actor abaixo
          </p>
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

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Actor <span className="text-red-500">*</span>
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
                  placeholder="Ex: João Silva"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Actor Type Field */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="actorTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Actor <span className="text-red-500">*</span>
                </label>
                <select
                  id="actorTypeId"
                  name="actorTypeId"
                  value={formData.actorTypeId}
                  onChange={handleInputChange}
                  disabled={isFetchingTypes}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.actorTypeId ? 'border-red-300' : 'border-gray-300'
                  } ${isFetchingTypes ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Selecione um tipo</option>
                  {actorTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.actorTypeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.actorTypeId}</p>
                )}
              </div>

              {/* Number Field */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Identificação
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: SP001"
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Opcional. Use letras maiúsculas, números e hífens.
                </p>
              </div>

              {/* Active Status */}
              <div className="col-span-2 md:col-span-1 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Actor Activo
                </label>
              </div>

              {/* Description Field */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Informações adicionais sobre o actor..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                href="/actors"
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
                    A actualizar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Actor
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