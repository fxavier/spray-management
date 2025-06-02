'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Users,
  MapPin,
  Settings,
  FileText,
  Droplets,
  LogOut,
  Shield,
  User,
  Activity,
  // Database,
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Painel de Controle',
    icon: BarChart3,
    href: '/dashboard',
    roles: ['ADMIN', 'SUPERVISOR', 'SPRAYER'],
    description: 'Visão geral e estatísticas',
  },
  {
    title: 'Actores',
    icon: Users,
    href: '/actors',
    roles: ['ADMIN', 'SUPERVISOR'],
    description: 'Gestão de equipas e utilizadores',
  },
  {
    title: 'Localizações',
    icon: MapPin,
    href: '/locations',
    roles: ['ADMIN', 'SUPERVISOR'],
    description: 'Províncias, distritos e comunidades',
  },
  {
    title: 'Configurações de Pulverização',
    icon: Settings,
    href: '/spray-config',
    roles: ['ADMIN', 'SUPERVISOR'],
    description: 'Parâmetros e metas de campanhas',
  },
  {
    title: 'Registos de Pulverização',
    icon: Activity,
    href: '/spray-totals',
    roles: ['ADMIN', 'SUPERVISOR', 'SPRAYER'],
    description: 'Gestão de registos diários de pulverização',
    badge: 'Sistema Principal',
  },
  {
    title: 'Relatórios',
    icon: FileText,
    href: '/reports',
    roles: ['ADMIN', 'SUPERVISOR'],
    description: 'Análises e exportações',
  },
]

const roleLabels = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  SPRAYER: 'Pulverizador',
}

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const userRole = session?.user?.role || ''
  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(userRole)
  )

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'SUPERVISOR':
        return <User className="h-4 w-4" />
      case 'SPRAYER':
        return <Droplets className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'SUPERVISOR':
        return 'bg-blue-100 text-blue-800'
      case 'SPRAYER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sistema SGP</h2>
            <p className="text-xs text-gray-500">Gestão de Pulverização</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isSprayTotals = item.href === '/spray-totals'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex flex-col gap-1 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? isSprayTotals
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${isSprayTotals && isActive ? 'text-white' : ''}`} />
                  <span className="font-medium">{item.title}</span>
                  {item.badge && isSprayTotals && (
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <span className={`text-xs opacity-75 ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </span>
                )}
                {isSprayTotals && (
                  <div className={`absolute inset-0 rounded-xl border-2 transition-opacity duration-200 ${
                    isActive 
                      ? 'border-white/30' 
                      : 'border-transparent group-hover:border-blue-200'
                  }`} />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      {session?.user && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <div className="flex items-center gap-1">
                  {getRoleIcon(session.user.role)}
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(session.user.role)}`}
                  >
                    {roleLabels[session.user.role as keyof typeof roleLabels]}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Terminar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  )
}