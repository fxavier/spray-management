import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/infrastructure/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const communityId = searchParams.get('communityId')
    const sprayerId = searchParams.get('sprayerId')

    // Build where clause based on filters
    const where: any = {
      isDeleted: false
    }

    if (year) {
      where.sprayYear = parseInt(year)
    }

    if (status) {
      where.sprayStatus = status
    }

    if (type) {
      where.sprayType = type
    }

    if (communityId) {
      where.communityId = communityId
    }

    if (sprayerId) {
      where.sprayerId = sprayerId
    }

    const sprayTotals = await prisma.sprayTotals.findMany({
      where,
      include: {
        sprayer: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        brigadeChief: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        community: {
          include: {
            locality: {
              include: {
                district: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
        sprayConfiguration: {
          select: {
            id: true,
            year: true,
            description: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { sprayDate: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(sprayTotals)
  } catch (error) {
    console.error('Error fetching spray totals:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR', 'SPRAYER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.sprayerId || !body.brigadeChiefId || !body.communityId || !body.sprayDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: sprayerId, brigadeChiefId, communityId, sprayDate' },
        { status: 400 }
      )
    }

    // Validate user exists and is active
    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 401 }
      )
    }

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

    // Validate sprayer and brigade chief exist
    const [sprayer, brigadeChief, community] = await Promise.all([
      prisma.user.findUnique({
        where: { id: body.sprayerId },
        select: { id: true, isActive: true, actorTypeId: true }
      }),
      prisma.user.findUnique({
        where: { id: body.brigadeChiefId },
        select: { id: true, isActive: true, actorTypeId: true }
      }),
      prisma.community.findUnique({
        where: { id: body.communityId },
        select: { id: true }
      })
    ])

    if (!sprayer || !sprayer.isActive) {
      return NextResponse.json(
        { error: 'Pulverizador não encontrado ou inativo' },
        { status: 400 }
      )
    }

    if (!brigadeChief || !brigadeChief.isActive) {
      return NextResponse.json(
        { error: 'Chefe de brigada não encontrado ou inativo' },
        { status: 400 }
      )
    }

    if (!community) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const sprayDate = new Date(body.sprayDate)
    const sprayYear = sprayDate.getFullYear()
    const structuresFound = parseInt(body.structuresFound) || 0
    const structuresSprayed = parseInt(body.structuresSprayed) || 0
    const structuresNotSprayed = parseInt(body.structuresNotSprayed) || 0

    // Validate structure counts
    if (structuresSprayed + structuresNotSprayed !== structuresFound) {
      return NextResponse.json(
        { error: 'A soma de estruturas pulverizadas e não pulverizadas deve ser igual ao total encontrado' },
        { status: 400 }
      )
    }

    const sprayTotal = await prisma.sprayTotals.create({
      data: {
        createdBy: session.user.id,
        sprayerId: body.sprayerId,
        brigadeChiefId: body.brigadeChiefId,
        communityId: body.communityId,
        sprayConfigurationId: body.sprayConfigurationId || null,
        sprayType: body.sprayType || 'PRINCIPAL',
        sprayDate,
        sprayYear,
        sprayRound: parseInt(body.sprayRound) || 1,
        sprayStatus: body.sprayStatus || 'PLANNED',
        insecticideUsed: body.insecticideUsed || '',
        structuresFound,
        structuresSprayed,
        structuresNotSprayed,
        compartmentsSprayed: parseInt(body.compartmentsSprayed) || 0,
        wallsType: body.wallsType || 'MATOPE',
        roofsType: body.roofsType || 'ZINCO',
        numberOfPersons: parseInt(body.numberOfPersons) || 0,
        childrenUnder5: parseInt(body.childrenUnder5) || 0,
        pregnantWomen: parseInt(body.pregnantWomen) || 0,
        reasonNotSprayed: body.reasonNotSprayed || null,
      },
      include: {
        sprayer: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        brigadeChief: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        community: {
          include: {
            locality: {
              include: {
                district: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
        sprayConfiguration: {
          select: {
            id: true,
            year: true,
            description: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(sprayTotal, { status: 201 })
  } catch (error: any) {
    console.error('Error creating spray total:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Registro duplicado para esta combinação de dados' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referência inválida - verifique os dados fornecidos' },
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