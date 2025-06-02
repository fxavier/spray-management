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

    const sprayConfiguration = await prisma.sprayConfiguration.findUnique({
      where: { id: params.id },
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

    if (!sprayConfiguration) {
      return NextResponse.json(
        { error: 'Configuração de pulverização não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(sprayConfiguration)
  } catch (error) {
    console.error('Error fetching spray configuration:', error)
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

    try {
      const sprayConfiguration = await prisma.sprayConfiguration.update({
        where: { id: params.id },
        data: {
          ...(body.year && { year: parseInt(body.year) }),
          ...(body.provinceId !== undefined && { provinceId: body.provinceId || null }),
          ...(body.districtId !== undefined && { districtId: body.districtId || null }),
          ...(body.proposedSprayDays && { proposedSprayDays: parseInt(body.proposedSprayDays) }),
          ...(body.sprayTarget !== undefined && { sprayTarget: parseInt(body.sprayTarget) || 0 }),
          ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
          ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
          ...(body.sprayRounds && { sprayRounds: parseInt(body.sprayRounds) }),
          ...(body.daysBetweenRounds !== undefined && { daysBetweenRounds: parseInt(body.daysBetweenRounds) || 0 }),
          ...(body.description !== undefined && { description: body.description || null }),
          ...(body.notes !== undefined && { notes: body.notes || null }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
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

      return NextResponse.json(sprayConfiguration)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Configuração de pulverização não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Configuração já existe para esta combinação de ano, província e distrito' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating spray configuration:', error)
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
      await prisma.sprayConfiguration.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ message: 'Configuração de pulverização deletada com sucesso' })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Configuração de pulverização não encontrada' },
          { status: 404 }
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Não é possível deletar configuração que possui registros de pulverização associados' },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error deleting spray configuration:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}