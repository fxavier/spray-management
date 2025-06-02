import { Actor, ActorType, CreateActorInput, UpdateActorInput } from '../entities/actor'

export interface ActorRepository {
  findAll(): Promise<Actor[]>
  findById(id: string): Promise<Actor | null>
  create(input: CreateActorInput): Promise<Actor>
  update(input: UpdateActorInput): Promise<Actor>
  delete(id: string): Promise<void>
  findByActorType(actorTypeId: string): Promise<Actor[]>
}

export interface ActorTypeRepository {
  findAll(): Promise<ActorType[]>
  findById(id: string): Promise<ActorType | null>
  create(input: { name: string; number: number }): Promise<ActorType>
  update(input: { id: string; name?: string; number?: number }): Promise<ActorType>
  delete(id: string): Promise<void>
}