import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaActorTypeRepository } from '@/infrastructure/repositories/prisma-actor-repository'
import { createActorTypeSchema } from '@/lib/validations/actor-schemas'

const actorTypeRepository = new PrismaActorTypeRepository()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const actorTypes = await actorTypeRepository.findAll()
    return NextResponse.json(actorTypes)
  } catch (error) {
    console.error('Error fetching actor types:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createActorTypeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const actorType = await actorTypeRepository.create(validationResult.data)
    return NextResponse.json(actorType, { status: 201 })
  } catch (error) {
    console.error('Error creating actor type:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}