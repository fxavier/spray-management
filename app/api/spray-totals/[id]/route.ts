import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/infrastructure/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sprayTotal = await prisma.sprayTotals.findUnique({
      where: {
        id: params.id,
        isDeleted: false,
      },
      include: {
        sprayer: {
          select: {
            id: true,
            name: true,
            number: true,
            actorType: {
              select: {
                name: true,
              },
            },
          },
        },
        brigadeChief: {
          select: {
            id: true,
            name: true,
            number: true,
            actorType: {
              select: {
                name: true,
              },
            },
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
            proposedSprayDays: true,
            sprayTarget: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!sprayTotal) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(sprayTotal)
  } catch (error) {
    console.error('Error fetching spray total:', error)
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
    
    if (!session || !['ADMIN', 'SUPERVISOR', 'SPRAYER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Check if spray total exists and is not deleted
    const existingSprayTotal = await prisma.sprayTotals.findUnique({
      where: {
        id: params.id,
        isDeleted: false,
      },
      select: {
        id: true,
        createdBy: true,
      },
    })

    if (!existingSprayTotal) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Only allow the creator, admins, or supervisors to update
    if (session.user.role === 'SPRAYER' && existingSprayTotal.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Você só pode editar registros criados por você' },
        { status: 403 }
      )
    }

    // Validate user exists and is active
    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado na sessão' },
        { status: 401 }
      )
    }

    // If sprayer or brigade chief are being updated, validate them
    if (body.sprayerId || body.brigadeChiefId || body.communityId) {
      const validations = []
      
      if (body.sprayerId) {
        validations.push(
          prisma.user.findUnique({
            where: { id: body.sprayerId },
            select: { id: true, isActive: true }
          })
        )
      }
      
      if (body.brigadeChiefId) {
        validations.push(
          prisma.user.findUnique({
            where: { id: body.brigadeChiefId },
            select: { id: true, isActive: true }
          })
        )
      }
      
      if (body.communityId) {
        validations.push(
          prisma.community.findUnique({
            where: { id: body.communityId },
            select: { id: true }
          })
        )
      }

      const results = await Promise.all(validations)
      
      if (results.some(result => !result || (result as any).isActive === false)) {
        return NextResponse.json(
          { error: 'Pulverizador, chefe de brigada ou comunidade inválidos' },
          { status: 400 }
        )
      }
    }

    // Validate structure counts if provided
    if (body.structuresFound !== undefined || body.structuresSprayed !== undefined || body.structuresNotSprayed !== undefined) {
      const structuresFound = parseInt(body.structuresFound) || 0
      const structuresSprayed = parseInt(body.structuresSprayed) || 0
      const structuresNotSprayed = parseInt(body.structuresNotSprayed) || 0

      if (structuresSprayed + structuresNotSprayed !== structuresFound) {
        return NextResponse.json(
          { error: 'A soma de estruturas pulverizadas e não pulverizadas deve ser igual ao total encontrado' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {
      updatedBy: session.user.id,
    }

    // Only update fields that are provided
    if (body.sprayerId) updateData.sprayerId = body.sprayerId
    if (body.brigadeChiefId) updateData.brigadeChiefId = body.brigadeChiefId
    if (body.communityId) updateData.communityId = body.communityId
    if (body.sprayConfigurationId !== undefined) updateData.sprayConfigurationId = body.sprayConfigurationId || null
    if (body.sprayType) updateData.sprayType = body.sprayType
    if (body.sprayDate) {
      updateData.sprayDate = new Date(body.sprayDate)
      updateData.sprayYear = new Date(body.sprayDate).getFullYear()
    }
    if (body.sprayRound !== undefined) updateData.sprayRound = parseInt(body.sprayRound)
    if (body.sprayStatus) updateData.sprayStatus = body.sprayStatus
    if (body.insecticideUsed !== undefined) updateData.insecticideUsed = body.insecticideUsed
    if (body.structuresFound !== undefined) updateData.structuresFound = parseInt(body.structuresFound)
    if (body.structuresSprayed !== undefined) updateData.structuresSprayed = parseInt(body.structuresSprayed)
    if (body.structuresNotSprayed !== undefined) updateData.structuresNotSprayed = parseInt(body.structuresNotSprayed)
    if (body.compartmentsSprayed !== undefined) updateData.compartmentsSprayed = parseInt(body.compartmentsSprayed)
    if (body.wallsType) updateData.wallsType = body.wallsType
    if (body.roofsType) updateData.roofsType = body.roofsType
    if (body.numberOfPersons !== undefined) updateData.numberOfPersons = parseInt(body.numberOfPersons)
    if (body.childrenUnder5 !== undefined) updateData.childrenUnder5 = parseInt(body.childrenUnder5)
    if (body.pregnantWomen !== undefined) updateData.pregnantWomen = parseInt(body.pregnantWomen)
    if (body.reasonNotSprayed !== undefined) updateData.reasonNotSprayed = body.reasonNotSprayed || null

    const sprayTotal = await prisma.sprayTotals.update({
      where: { id: params.id },
      data: updateData,
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
        updatedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(sprayTotal)
  } catch (error: any) {
    console.error('Error updating spray total:', {
      error: error.message,
      code: error.code,
      meta: error.meta,
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
      },
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
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado - apenas administradores e supervisores podem deletar' }, { status: 401 })
    }

    // Check if spray total exists and is not already deleted
    const existingSprayTotal = await prisma.sprayTotals.findUnique({
      where: {
        id: params.id,
        isDeleted: false,
      },
      select: {
        id: true,
        sprayStatus: true,
      },
    })

    if (!existingSprayTotal) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Prevent deletion of completed spray totals (optional business rule)
    if (existingSprayTotal.sprayStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Não é possível deletar registros já completados' },
        { status: 400 }
      )
    }

    // Soft delete the spray total
    await prisma.sprayTotals.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    })

    return NextResponse.json(
      { message: 'Registro deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting spray total:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}