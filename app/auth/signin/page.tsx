'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { translations } from '@/lib/constants/translations'
import { LogIn, UserPlus, Eye, EyeOff, Sparkles, Shield, Users, Lock, Mail, User, Briefcase, Hash } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ActorType {
  id: string
  name: string
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingActorTypes, setIsLoadingActorTypes] = useState(false)
  const [actorTypes, setActorTypes] = useState<ActorType[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    actorTypeId: '',
    number: ''
  })

  // Fetch actor types for registration
  useEffect(() => {
    if (!isLogin) {
      fetchActorTypes()
    }
  }, [isLogin])

  const fetchActorTypes = async () => {
    try {
      setIsLoadingActorTypes(true)
      const response = await fetch('/api/auth/register')
      if (response.ok) {
        const data = await response.json()
        setActorTypes(data)
      }
    } catch (error) {
      console.error('Error fetching actor types:', error)
    } finally {
      setIsLoadingActorTypes(false)
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ submit: 'Credenciais inválidas. Verifique seu email e senha.' })
      } else {
        toast({
          title: 'Sucesso',
          description: 'Login realizado com sucesso!',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Conta criada com sucesso! Faça login para continuar.',
        })
        setIsLogin(true)
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          actorTypeId: '',
          number: ''
        })
      } else {
        if (data.details && Array.isArray(data.details)) {
          const newErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            newErrors[error.field] = error.message
          })
          setErrors(newErrors)
        } else {
          setErrors({ submit: data.error || 'Erro ao criar conta' })
        }
      }
    } catch (error) {
      setErrors({ submit: 'Erro ao conectar com o servidor' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    // Convert "none" back to empty string for actorTypeId
    const actualValue = name === 'actorTypeId' && value === 'none' ? '' : value
    setRegisterData(prev => ({ ...prev, [name]: actualValue }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        {/* Background decoration */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-20 animate-pulse"></div>
        
        {/* Main card */}
        <Card className="relative bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-40"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <Sparkles className="h-6 w-6 text-purple-500 animate-pulse ml-2" />
            </div>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Sistema de Gestão
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 font-medium">
              {isLogin ? 'Entre com suas credenciais' : 'Crie sua conta'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tab buttons */}
            <div className="flex space-x-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isLogin
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  !isLogin
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar
              </button>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                <div className="relative bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                  <div className="text-red-800 text-sm font-medium">{errors.submit}</div>
                </div>
              </div>
            )}

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginInputChange}
                      required
                      placeholder="usuario@exemplo.pt"
                      className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      required
                      placeholder="••••••••"
                      className={`pl-12 pr-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                        errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      Entrar
                    </div>
                  )}
                </Button>
              </form>
            )}

            {/* Registration Form */}
            {!isLogin && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-semibold text-slate-700">
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      value={registerData.name}
                      onChange={handleRegisterInputChange}
                      required
                      placeholder="Seu nome completo"
                      className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                        errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-semibold text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterInputChange}
                      required
                      placeholder="usuario@exemplo.pt"
                      className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-role" className="text-sm font-semibold text-slate-700">
                      Função
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <Select
                        value={registerData.role}
                        onValueChange={(value) => handleSelectChange('role', value)}
                      >
                        <SelectTrigger className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                          errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="sprayer">Pulverizador</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.role && (
                      <p className="text-sm text-red-600 font-medium">{errors.role}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-number" className="text-sm font-semibold text-slate-700">
                      Número (Opcional)
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="register-number"
                        name="number"
                        type="text"
                        value={registerData.number}
                        onChange={handleRegisterInputChange}
                        placeholder="Ex: 001, SP-123"
                        className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                          errors.number ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.number && (
                      <p className="text-sm text-red-600 font-medium">{errors.number}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-actorType" className="text-sm font-semibold text-slate-700">
                    Tipo de Ator (Opcional)
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                    <Select
                      value={registerData.actorTypeId || 'none'}
                      onValueChange={(value) => handleSelectChange('actorTypeId', value)}
                      disabled={isLoadingActorTypes}
                    >
                      <SelectTrigger className={`pl-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                        errors.actorTypeId ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <SelectValue placeholder="Selecione o tipo (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {actorTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.actorTypeId && (
                    <p className="text-sm text-red-600 font-medium">{errors.actorTypeId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-semibold text-slate-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className={`pl-12 pr-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                        errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword" className="text-sm font-semibold text-slate-700">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={handleRegisterInputChange}
                      required
                      placeholder="Repita a senha"
                      className={`pl-12 pr-12 h-12 border-2 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Criando conta...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Criar Conta
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}