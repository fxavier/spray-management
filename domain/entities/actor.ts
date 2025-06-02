export interface ActorType {
  id: string
  name: string
}

export interface Actor {
  id: string
  name: string
  description?: string
  number?: string
  actorType?: ActorType
  actorTypeId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface CreateActorInput {
  name: string
  description?: string
  number?: string
  actorTypeId: string
  isActive?: boolean
}

export interface UpdateActorInput {
  id: string
  name?: string
  description?: string
  number?: string
  actorTypeId?: string
  isActive?: boolean
}