import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaActorRepository } from '@/infrastructure/repositories/prisma-actor-repository'
import { updateActorSchema } from '@/lib/validations/actor-schemas'

const actorRepository = new PrismaActorRepository()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const actor = await actorRepository.findById(params.id)
    if (!actor) {
      return NextResponse.json({ error: 'Actor não encontrado' }, { status: 404 })
    }

    return NextResponse.json(actor)
  } catch (error) {
    console.error('Error fetching actor:', error)
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
    const validationResult = updateActorSchema.safeParse({
      ...body,
      id: params.id,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const actor = await actorRepository.update(validationResult.data)
    return NextResponse.json(actor)
  } catch (error) {
    console.error('Error updating actor:', error)
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

    await actorRepository.delete(params.id)
    return NextResponse.json({ message: 'Actor eliminado com sucesso' })
  } catch (error) {
    console.error('Error deleting actor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}