import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { createCommunitySchema } from '@/lib/validations/location-schemas'

const locationRepository = new PrismaLocationRepository()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const localityId = searchParams.get('localityId')

    let communities
    if (localityId) {
      communities = await locationRepository.findCommunitiesByLocality(localityId)
    } else {
      communities = await locationRepository.findAllCommunities()
    }

    return NextResponse.json(communities)
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createCommunitySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const community = await locationRepository.createCommunity(validationResult.data)
    return NextResponse.json(community, { status: 201 })
  } catch (error: any) {
    console.error('Error creating community:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Comunidade já existe nesta localidade' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}