import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { updateDistrictSchema } from '@/lib/validations/location-schemas'

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

    const district = await locationRepository.findDistrictById(params.id)
    if (!district) {
      return NextResponse.json({ error: 'Distrito não encontrado' }, { status: 404 })
    }

    return NextResponse.json(district)
  } catch (error) {
    console.error('Error fetching district:', error)
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
    const validationResult = updateDistrictSchema.safeParse({
      ...body,
      id: params.id,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const district = await locationRepository.updateDistrict(validationResult.data)
    return NextResponse.json(district)
  } catch (error: any) {
    console.error('Error updating district:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Distrito ou código já existe nesta província' },
        { status: 409 }
      )
    }
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
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await locationRepository.deleteDistrict(params.id)
    return NextResponse.json({ message: 'Distrito eliminado com sucesso' })
  } catch (error) {
    console.error('Error deleting district:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}