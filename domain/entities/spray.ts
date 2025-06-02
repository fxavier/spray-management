export type SprayType = 'PRINCIPAL' | 'SECUNDARIA'
export type ReasonNotSprayed = 'RECUSA' | 'FECHADA' | 'OUTRO'
export type WallsType = 'MATOPE' | 'COLMO' | 'CIMENTO'
export type RoofsType = 'CAPIM_PLASTICO' | 'ZINCO'
export type SprayStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface SprayConfiguration {
  id: string
  year: number
  provinceId?: string
  province?: any
  districtId?: string
  district?: any
  proposedSprayDays: number
  startDate?: Date
  endDate?: Date
  sprayRounds: number
  daysBetweenRounds: number
  description?: string
  notes?: string
  isActive: boolean
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface SprayTotals {
  id: string
  sprayerId: string
  sprayer?: any
  brigadeChiefId: string
  brigadeChief?: any
  communityId: string
  community?: any
  sprayConfigurationId?: string
  sprayConfiguration?: SprayConfiguration
  sprayType: SprayType
  sprayDate: Date
  sprayYear: number
  sprayRound: number
  sprayStatus: SprayStatus
  insecticideUsed: string
  structuresFound: number
  structuresSprayed: number
  structuresNotSprayed: number
  compartmentsSprayed: number
  reasonNotSprayed?: ReasonNotSprayed
  wallsType: WallsType
  roofsType: RoofsType
  numberOfPersons: number
  childrenUnder5: number
  pregnantWomen: number
  isDeleted: boolean
  deletedAt?: Date
  deletedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSprayConfigurationInput {
  year: number
  provinceId?: string
  districtId?: string
  proposedSprayDays: number
  startDate?: Date
  endDate?: Date
  sprayRounds?: number
  daysBetweenRounds?: number
  description?: string
  notes?: string
  isActive?: boolean
}

export interface UpdateSprayConfigurationInput {
  id: string
  year?: number
  provinceId?: string
  districtId?: string
  proposedSprayDays?: number
  startDate?: Date
  endDate?: Date
  sprayRounds?: number
  daysBetweenRounds?: number
  description?: string
  notes?: string
  isActive?: boolean
}

export interface CreateSprayTotalsInput {
  sprayerId: string
  brigadeChiefId: string
  communityId: string
  sprayConfigurationId?: string
  sprayType: SprayType
  sprayDate: Date
  sprayYear: number
  sprayRound?: number
  sprayStatus?: SprayStatus
  insecticideUsed: string
  structuresFound: number
  structuresSprayed: number
  structuresNotSprayed?: number
  compartmentsSprayed: number
  reasonNotSprayed?: ReasonNotSprayed
  wallsType: WallsType
  roofsType: RoofsType
  numberOfPersons: number
  childrenUnder5: number
  pregnantWomen: number
}

export interface UpdateSprayTotalsInput {
  id: string
  sprayerId?: string
  brigadeChiefId?: string
  communityId?: string
  sprayConfigurationId?: string
  sprayType?: SprayType
  sprayDate?: Date
  sprayYear?: number
  sprayRound?: number
  sprayStatus?: SprayStatus
  insecticideUsed?: string
  structuresFound?: number
  structuresSprayed?: number
  structuresNotSprayed?: number
  compartmentsSprayed?: number
  reasonNotSprayed?: ReasonNotSprayed
  wallsType?: WallsType
  roofsType?: RoofsType
  numberOfPersons?: number
  childrenUnder5?: number
  pregnantWomen?: number
}