import { prisma } from '../prisma/client'
import {
  SprayConfigurationRepository,
  SprayTotalsRepository,
} from '@/domain/repositories/spray-repository'
import {
  SprayConfiguration,
  SprayTotals,
  CreateSprayConfigurationInput,
  UpdateSprayConfigurationInput,
  CreateSprayTotalsInput,
  UpdateSprayTotalsInput,
} from '@/domain/entities/spray'

// Helper function to transform Prisma null values to undefined
function transformSprayTotals(total: any): SprayTotals {
  return {
    ...total,
    sprayConfigurationId: total.sprayConfigurationId || undefined,
    reasonNotSprayed: total.reasonNotSprayed || undefined,
    deletedAt: total.deletedAt || undefined,
    deletedBy: total.deletedBy || undefined,
  }
}

export class PrismaSprayConfigurationRepository implements SprayConfigurationRepository {
  async findAll(): Promise<SprayConfiguration[]> {
    const configurations = await prisma.sprayConfiguration.findMany({
      include: {
        province: true,
        district: true,
      },
      orderBy: [
        { year: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    return configurations.map(config => ({
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }))
  }

  async findById(id: string): Promise<SprayConfiguration | null> {
    const config = await prisma.sprayConfiguration.findUnique({
      where: { id },
      include: {
        province: true,
        district: true,
      },
    })
    
    if (!config) return null
    
    return {
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }
  }

  async findByYear(year: number): Promise<SprayConfiguration[]> {
    const configurations = await prisma.sprayConfiguration.findMany({
      where: { year },
      include: {
        province: true,
        district: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return configurations.map(config => ({
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }))
  }

  async findByProvinceId(provinceId: string): Promise<SprayConfiguration[]> {
    const configurations = await prisma.sprayConfiguration.findMany({
      where: { provinceId },
      include: {
        province: true,
        district: true,
      },
      orderBy: [
        { year: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    return configurations.map(config => ({
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }))
  }

  async create(input: CreateSprayConfigurationInput): Promise<SprayConfiguration> {
    const data: any = {
      year: input.year,
      proposedSprayDays: input.proposedSprayDays,
      sprayRounds: input.sprayRounds ?? 1,
      daysBetweenRounds: input.daysBetweenRounds ?? 0,
      isActive: input.isActive ?? true,
    }

    if (input.provinceId) data.provinceId = input.provinceId
    if (input.districtId) data.districtId = input.districtId
    if (input.startDate) data.startDate = input.startDate
    if (input.endDate) data.endDate = input.endDate
    if (input.description) data.description = input.description
    if (input.notes) data.notes = input.notes

    const config = await prisma.sprayConfiguration.create({
      data,
      include: {
        province: true,
        district: true,
      },
    })
    
    return {
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }
  }

  async update(input: UpdateSprayConfigurationInput): Promise<SprayConfiguration> {
    const data: any = {}

    if (input.year !== undefined) data.year = input.year
    if (input.provinceId !== undefined) data.provinceId = input.provinceId
    if (input.districtId !== undefined) data.districtId = input.districtId
    if (input.proposedSprayDays !== undefined) data.proposedSprayDays = input.proposedSprayDays
    if (input.startDate !== undefined) data.startDate = input.startDate
    if (input.endDate !== undefined) data.endDate = input.endDate
    if (input.sprayRounds !== undefined) data.sprayRounds = input.sprayRounds
    if (input.daysBetweenRounds !== undefined) data.daysBetweenRounds = input.daysBetweenRounds
    if (input.description !== undefined) data.description = input.description
    if (input.notes !== undefined) data.notes = input.notes
    if (input.isActive !== undefined) data.isActive = input.isActive

    const config = await prisma.sprayConfiguration.update({
      where: { id: input.id },
      data,
      include: {
        province: true,
        district: true,
      },
    })
    
    return {
      ...config,
      provinceId: config.provinceId || undefined,
      districtId: config.districtId || undefined,
      description: config.description || undefined,
      notes: config.notes || undefined,
      startDate: config.startDate || undefined,
      endDate: config.endDate || undefined,
      createdBy: config.createdBy || undefined,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.sprayConfiguration.delete({
      where: { id },
    })
  }
}

export class PrismaSprayTotalsRepository implements SprayTotalsRepository {
  async findAll(filters?: {
    year?: number
    provinceId?: string
    districtId?: string
    communityId?: string
    sprayStatus?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SprayTotals[]> {
    const where: any = {
      isDeleted: false,
    }

    if (filters?.year) where.sprayYear = filters.year
    if (filters?.communityId) where.communityId = filters.communityId
    if (filters?.sprayStatus) where.sprayStatus = filters.sprayStatus
    if (filters?.startDate || filters?.endDate) {
      where.sprayDate = {}
      if (filters.startDate) where.sprayDate.gte = filters.startDate
      if (filters.endDate) where.sprayDate.lte = filters.endDate
    }

    // Handle nested filtering for province/district
    if (filters?.provinceId || filters?.districtId) {
      where.community = {
        locality: {
          district: {}
        }
      }
      if (filters.provinceId) {
        where.community.locality.district.provinceId = filters.provinceId
      }
      if (filters.districtId) {
        where.community.locality.district.id = filters.districtId
      }
    }

    const totals = await prisma.sprayTotals.findMany({
      where,
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
      orderBy: {
        sprayDate: 'desc',
      },
    })
    
    return totals.map(transformSprayTotals)
  }

  async findById(id: string): Promise<SprayTotals | null> {
    const total = await prisma.sprayTotals.findUnique({
      where: { id },
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
    })
    
    if (!total) return null
    
    return transformSprayTotals(total)
  }

  async findBySprayerId(sprayerId: string): Promise<SprayTotals[]> {
    const totals = await prisma.sprayTotals.findMany({
      where: {
        sprayerId,
        isDeleted: false,
      },
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
      orderBy: {
        sprayDate: 'desc',
      },
    })
    
    return totals.map(transformSprayTotals)
  }

  async findByCommunityId(communityId: string): Promise<SprayTotals[]> {
    const totals = await prisma.sprayTotals.findMany({
      where: {
        communityId,
        isDeleted: false,
      },
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
      orderBy: {
        sprayDate: 'desc',
      },
    })
    
    return totals.map(transformSprayTotals)
  }

  async create(input: CreateSprayTotalsInput): Promise<SprayTotals> {
    const structuresNotSprayed = input.structuresNotSprayed ?? 
      (input.structuresFound - input.structuresSprayed)

    const data: any = {
      sprayerId: input.sprayerId,
      brigadeChiefId: input.brigadeChiefId,
      communityId: input.communityId,
      sprayType: input.sprayType,
      sprayDate: input.sprayDate,
      sprayYear: input.sprayYear,
      sprayRound: input.sprayRound ?? 1,
      sprayStatus: input.sprayStatus ?? 'PLANNED',
      insecticideUsed: input.insecticideUsed,
      structuresFound: input.structuresFound,
      structuresSprayed: input.structuresSprayed,
      structuresNotSprayed,
      compartmentsSprayed: input.compartmentsSprayed,
      wallsType: input.wallsType,
      roofsType: input.roofsType,
      numberOfPersons: input.numberOfPersons,
      childrenUnder5: input.childrenUnder5,
      pregnantWomen: input.pregnantWomen,
    }

    if (input.sprayConfigurationId) data.sprayConfigurationId = input.sprayConfigurationId
    if (input.reasonNotSprayed) data.reasonNotSprayed = input.reasonNotSprayed

    const total = await prisma.sprayTotals.create({
      data,
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
    })
    
    return transformSprayTotals(total)
  }

  async update(input: UpdateSprayTotalsInput): Promise<SprayTotals> {
    const data: any = {}

    if (input.sprayerId !== undefined) data.sprayerId = input.sprayerId
    if (input.brigadeChiefId !== undefined) data.brigadeChiefId = input.brigadeChiefId
    if (input.communityId !== undefined) data.communityId = input.communityId
    if (input.sprayConfigurationId !== undefined) data.sprayConfigurationId = input.sprayConfigurationId
    if (input.sprayType !== undefined) data.sprayType = input.sprayType
    if (input.sprayDate !== undefined) data.sprayDate = input.sprayDate
    if (input.sprayYear !== undefined) data.sprayYear = input.sprayYear
    if (input.sprayRound !== undefined) data.sprayRound = input.sprayRound
    if (input.sprayStatus !== undefined) data.sprayStatus = input.sprayStatus
    if (input.insecticideUsed !== undefined) data.insecticideUsed = input.insecticideUsed
    if (input.structuresFound !== undefined) data.structuresFound = input.structuresFound
    if (input.structuresSprayed !== undefined) data.structuresSprayed = input.structuresSprayed
    if (input.structuresNotSprayed !== undefined) data.structuresNotSprayed = input.structuresNotSprayed
    if (input.compartmentsSprayed !== undefined) data.compartmentsSprayed = input.compartmentsSprayed
    if (input.reasonNotSprayed !== undefined) data.reasonNotSprayed = input.reasonNotSprayed
    if (input.wallsType !== undefined) data.wallsType = input.wallsType
    if (input.roofsType !== undefined) data.roofsType = input.roofsType
    if (input.numberOfPersons !== undefined) data.numberOfPersons = input.numberOfPersons
    if (input.childrenUnder5 !== undefined) data.childrenUnder5 = input.childrenUnder5
    if (input.pregnantWomen !== undefined) data.pregnantWomen = input.pregnantWomen

    // Auto-calculate structuresNotSprayed if both structuresFound and structuresSprayed are provided
    if (input.structuresFound !== undefined && input.structuresSprayed !== undefined) {
      data.structuresNotSprayed = input.structuresFound - input.structuresSprayed
    }

    const total = await prisma.sprayTotals.update({
      where: { id: input.id },
      data,
      include: {
        sprayer: {
          include: {
            actorType: true,
          },
        },
        brigadeChief: {
          include: {
            actorType: true,
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
        sprayConfiguration: true,
      },
    })
    
    return transformSprayTotals(total)
  }

  async delete(id: string): Promise<void> {
    await prisma.sprayTotals.delete({
      where: { id },
    })
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await prisma.sprayTotals.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}