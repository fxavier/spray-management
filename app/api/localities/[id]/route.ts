import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { updateLocalitySchema } from '@/lib/validations/location-schemas'

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

    const locality = await locationRepository.findLocalityById(params.id)
    
    if (!locality) {
      return NextResponse.json(
        { error: 'Localidade não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(locality)
  } catch (error) {
    console.error('Error fetching locality:', error)
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
    const validationResult = updateLocalitySchema.safeParse({
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
      const locality = await locationRepository.updateLocality(validationResult.data)
      return NextResponse.json(locality)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Localidade não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Localidade já existe neste distrito' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating locality:', error)
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
      await locationRepository.deleteLocality(params.id)
      return NextResponse.json({ message: 'Localidade deletada com sucesso' })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Localidade não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Não é possível deletar localidade que possui comunidades' },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting locality:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}