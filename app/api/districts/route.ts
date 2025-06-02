import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaLocationRepository } from '@/infrastructure/repositories/prisma-location-repository'
import { createDistrictSchema } from '@/lib/validations/location-schemas'

const locationRepository = new PrismaLocationRepository()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('provinceId')

    let districts
    if (provinceId) {
      districts = await locationRepository.findDistrictsByProvince(provinceId)
    } else {
      districts = await locationRepository.findAllDistricts()
    }

    return NextResponse.json(districts)
  } catch (error) {
    console.error('Error fetching districts:', error)
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
    const validationResult = createDistrictSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const district = await locationRepository.createDistrict(validationResult.data)
    return NextResponse.json(district, { status: 201 })
  } catch (error: any) {
    console.error('Error creating district:', error)
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