import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { createProvinceSchema, type CreateProvinceInput } from '@/lib/validations/location-schemas'

const locationRepository = new PrismaLocationRepository()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const provinces = await locationRepository.findAllProvinces()
    return NextResponse.json(provinces)
  } catch (error) {
    console.error('Error fetching provinces:', error)
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
    const validationResult = createProvinceSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const province = await locationRepository.createProvince(validationResult.data)
    return NextResponse.json(province, { status: 201 })
  } catch (error: any) {
    console.error('Error creating province:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Província ou código já existe' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}