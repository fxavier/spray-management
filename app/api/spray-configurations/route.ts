import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/infrastructure/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sprayConfigurations = await prisma.sprayConfiguration.findMany({
      include: {
        province: true,
        district: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        year: 'desc',
      },
    })

    return NextResponse.json(sprayConfigurations)
  } catch (error) {
    console.error('Error fetching spray configurations:', error)
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
    
    // Basic validation
    if (!body.year || !body.proposedSprayDays) {
      return NextResponse.json(
        { error: 'Ano e dias de pulverização são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const year = parseInt(body.year)
    const proposedSprayDays = parseInt(body.proposedSprayDays)
    const sprayTarget = parseInt(body.sprayTarget) || 0

    if (isNaN(year) || isNaN(proposedSprayDays)) {
      return NextResponse.json(
        { error: 'Ano e dias de pulverização devem ser números válidos' },
        { status: 400 }
      )
    }

    // Check for existing configuration
    const existingConfig = await prisma.sprayConfiguration.findFirst({
      where: {
        year,
        provinceId: body.provinceId || null,
        districtId: body.districtId || null,
      },
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: 'Já existe uma configuração para este ano e localização' },
        { status: 409 }
      )
    }

    // Validate session user id
    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 401 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 401 }
      )
    }

    const sprayConfiguration = await prisma.sprayConfiguration.create({
      data: {
        year,
        provinceId: body.provinceId || null,
        districtId: body.districtId || null,
        proposedSprayDays,
        sprayTarget,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        sprayRounds: parseInt(body.sprayRounds) || 1,
        daysBetweenRounds: parseInt(body.daysBetweenRounds) || 0,
        description: body.description || null,
        notes: body.notes || null,
        isActive: body.isActive ?? true,
        createdBy: session.user.id,
      },
      include: {
        province: true,
        district: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(sprayConfiguration, { status: 201 })
  } catch (error: any) {
    console.error('Error creating spray configuration:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Configuração já existe para esta combinação de ano, província e distrito' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Província ou distrito não encontrado' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message || error.toString(),
        code: error.code 
      },
      { status: 500 }
    )
  }
}