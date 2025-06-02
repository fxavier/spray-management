import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { updateCommunitySchema } from '@/lib/validations/location-schemas'

const locationRepository = new PrismaLocationRepository()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const community = await locationRepository.findCommunityById(params.id)
    
    if (!community) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(community)
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updateCommunitySchema.safeParse({
      ...body,
      id: params.id
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    try {
      const community = await locationRepository.updateCommunity(validationResult.data)
      return NextResponse.json(community)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Comunidade não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Comunidade já existe nesta localidade' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating community:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    try {
      await locationRepository.deleteCommunity(params.id)
      return NextResponse.json({ message: 'Comunidade deletada com sucesso' })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Comunidade não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Não é possível deletar comunidade que possui registros de pulverização' },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting community:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}