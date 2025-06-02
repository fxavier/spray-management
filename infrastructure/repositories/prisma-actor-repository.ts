import { prisma } from '../prisma/client'
import { ActorRepository, ActorTypeRepository } from '@/domain/repositories/actor-repository'
import { Actor, ActorType, CreateActorInput, UpdateActorInput } from '@/domain/entities/actor'

export class PrismaActorRepository implements ActorRepository {
  async findAll(): Promise<Actor[]> {
    const users = await prisma.user.findMany({
      include: {
        actorType: true,
      },
      where: {
        actorTypeId: {
          not: null,
        },
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return users.map(this.mapToEntity)
  }

  async findById(id: string): Promise<Actor | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        actorType: true,
      },
    })

    return user && user.actorTypeId ? this.mapToEntity(user) : null
  }

  async create(input: CreateActorInput): Promise<Actor> {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: `${input.name.toLowerCase().replace(/\s+/g, '.')}@spray.local`,
        role: 'SPRAYER',
        description: input.description,
        number: input.number,
        actorTypeId: input.actorTypeId,
        isActive: input.isActive ?? true,
      },
      include: {
        actorType: true,
      },
    })

    return this.mapToEntity(user)
  }

  async update(input: UpdateActorInput): Promise<Actor> {
    const user = await prisma.user.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
        ...(input.number && { number: input.number }),
        ...(input.actorTypeId && { actorTypeId: input.actorTypeId }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        actorType: true,
      },
    })

    return this.mapToEntity(user)
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  async findByActorType(actorTypeId: string): Promise<Actor[]> {
    const users = await prisma.user.findMany({
      where: {
        actorTypeId,
        deletedAt: null,
      },
      include: {
        actorType: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return users.map(this.mapToEntity)
  }

  private mapToEntity(user: any): Actor {
    return {
      id: user.id,
      name: user.name,
      description: user.description,
      number: user.number,
      actorType: user.actorType ? {
        id: user.actorType.id,
        name: user.actorType.name,
      } : undefined,
      actorTypeId: user.actorTypeId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    }
  }
}

export class PrismaActorTypeRepository implements ActorTypeRepository {
  async findAll(): Promise<ActorType[]> {
    const actorTypes = await prisma.actorType.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return actorTypes
  }

  async findById(id: string): Promise<ActorType | null> {
    return await prisma.actorType.findUnique({
      where: { id },
    })
  }

  async create(input: { name: string }): Promise<ActorType> {
    return await prisma.actorType.create({
      data: input,
    })
  }

  async update(input: { id: string; name?: string }): Promise<ActorType> {
    return await prisma.actorType.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.actorType.delete({
      where: { id },
    })
  }
}