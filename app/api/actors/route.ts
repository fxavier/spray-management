import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaActorRepository } from '@/infrastructure/repositories/prisma-actor-repository'
import { createActorSchema } from '@/lib/validations/actor-schemas'

const actorRepository = new PrismaActorRepository()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const actorTypeId = searchParams.get('actorTypeId')

    let actors
    if (actorTypeId) {
      actors = await actorRepository.findByActorType(actorTypeId)
    } else {
      actors = await actorRepository.findAll()
    }

    return NextResponse.json(actors)
  } catch (error) {
    console.error('Error fetching actors:', error)
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
    const validationResult = createActorSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const actor = await actorRepository.create(validationResult.data)
    return NextResponse.json(actor, { status: 201 })
  } catch (error) {
    console.error('Error creating actor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}