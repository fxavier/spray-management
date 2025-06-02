import { prisma } from '../prisma/client'
import {
  ProvinceRepository,
  DistrictRepository,
  LocalityRepository,
  CommunityRepository,
} from '@/domain/repositories/location-repository'
import {
  Province,
  District,
  Locality,
  Community,
} from '@/domain/entities/location'
import {
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateDistrictInput,
  UpdateDistrictInput,
  CreateLocalityInput,
  UpdateLocalityInput,
  CreateCommunityInput,
  UpdateCommunityInput,
} from '@/lib/validations/location-schemas'

export class PrismaProvinceRepository implements ProvinceRepository {
  async findAll(): Promise<Province[]> {
    return await prisma.province.findMany({
      include: {
        districts: true,
      },
      orderBy: {
        name: 'asc',
      },
    }) as Province[]
  }

  async findById(id: string): Promise<Province | null> {
    const province = await prisma.province.findUnique({
      where: { id },
      include: {
        districts: true,
      },
    })
    
    if (!province) return null
    
    return {
      ...province,
      code: province.code || undefined,
      districts: province.districts?.map(district => ({
        ...district,
        code: district.code || undefined,
      })),
    }
  }

  async create(input: CreateProvinceInput): Promise<Province> {
    const province = await prisma.province.create({
      data: input,
      include: {
        districts: true,
      },
    })
    
    return {
      ...province,
      code: province.code || undefined,
      districts: province.districts?.map(district => ({
        ...district,
        code: district.code || undefined,
      })),
    }
  }

  async update(input: UpdateProvinceInput): Promise<Province> {
    const province = await prisma.province.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code !== undefined && { code: input.code }),
      },
      include: {
        districts: true,
      },
    })
    
    return {
      ...province,
      code: province.code || undefined,
      districts: province.districts?.map(district => ({
        ...district,
        code: district.code || undefined,
      })),
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.province.delete({
      where: { id },
    })
  }
}

export class PrismaDistrictRepository implements DistrictRepository {
  async findAll(): Promise<District[]> {
    const districts = await prisma.district.findMany({
      include: {
        province: true,
        localities: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return districts.map(district => ({
      ...district,
      code: district.code || undefined,
      province: district.province ? {
        ...district.province,
        code: district.province.code || undefined,
      } : undefined,
      localities: district.localities?.map(locality => ({
        ...locality,
      })),
    }))
  }

  async findById(id: string): Promise<District | null> {
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        province: true,
        localities: true,
      },
    })
    
    if (!district) return null
    
    return {
      ...district,
      code: district.code || undefined,
      province: district.province ? {
        ...district.province,
        code: district.province.code || undefined,
      } : undefined,
      localities: district.localities?.map(locality => ({
        ...locality,
      })),
    }
  }

  async findByProvinceId(provinceId: string): Promise<District[]> {
    const districts = await prisma.district.findMany({
      where: { provinceId },
      include: {
        province: true,
        localities: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return districts.map(district => ({
      ...district,
      code: district.code || undefined,
      province: district.province ? {
        ...district.province,
        code: district.province.code || undefined,
      } : undefined,
      localities: district.localities?.map(locality => ({
        ...locality,
      })),
    }))
  }

  async create(input: CreateDistrictInput): Promise<District> {
    const district = await prisma.district.create({
      data: input,
      include: {
        province: true,
        localities: true,
      },
    })
    
    return {
      ...district,
      code: district.code || undefined,
      province: district.province ? {
        ...district.province,
        code: district.province.code || undefined,
      } : undefined,
      localities: district.localities?.map(locality => ({
        ...locality,
      })),
    }
  }

  async update(input: UpdateDistrictInput): Promise<District> {
    const district = await prisma.district.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.provinceId && { provinceId: input.provinceId }),
      },
      include: {
        province: true,
        localities: true,
      },
    })
    
    return {
      ...district,
      code: district.code || undefined,
      province: district.province ? {
        ...district.province,
        code: district.province.code || undefined,
      } : undefined,
      localities: district.localities?.map(locality => ({
        ...locality,
      })),
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.district.delete({
      where: { id },
    })
  }
}

export class PrismaLocalityRepository implements LocalityRepository {
  async findAll(): Promise<Locality[]> {
    const localities = await prisma.locality.findMany({
      include: {
        district: {
          include: {
            province: true,
          },
        },
        communities: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return localities.map(locality => ({
      ...locality,
      district: locality.district ? {
        ...locality.district,
        code: locality.district.code || undefined,
        province: locality.district.province ? {
          ...locality.district.province,
          code: locality.district.province.code || undefined,
        } : undefined,
      } : undefined,
      communities: locality.communities?.map(community => ({
        ...community,
      })),
    }))
  }

  async findById(id: string): Promise<Locality | null> {
    const locality = await prisma.locality.findUnique({
      where: { id },
      include: {
        district: {
          include: {
            province: true,
          },
        },
        communities: true,
      },
    })
    
    if (!locality) return null
    
    return {
      ...locality,
      district: locality.district ? {
        ...locality.district,
        code: locality.district.code || undefined,
        province: locality.district.province ? {
          ...locality.district.province,
          code: locality.district.province.code || undefined,
        } : undefined,
      } : undefined,
      communities: locality.communities?.map(community => ({
        ...community,
      })),
    }
  }

  async findByDistrictId(districtId: string): Promise<Locality[]> {
    const localities = await prisma.locality.findMany({
      where: { districtId },
      include: {
        district: {
          include: {
            province: true,
          },
        },
        communities: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return localities.map(locality => ({
      ...locality,
      district: locality.district ? {
        ...locality.district,
        code: locality.district.code || undefined,
        province: locality.district.province ? {
          ...locality.district.province,
          code: locality.district.province.code || undefined,
        } : undefined,
      } : undefined,
      communities: locality.communities?.map(community => ({
        ...community,
      })),
    }))
  }

  async create(input: CreateLocalityInput): Promise<Locality> {
    const locality = await prisma.locality.create({
      data: input,
      include: {
        district: {
          include: {
            province: true,
          },
        },
        communities: true,
      },
    })
    
    return {
      ...locality,
      district: locality.district ? {
        ...locality.district,
        code: locality.district.code || undefined,
        province: locality.district.province ? {
          ...locality.district.province,
          code: locality.district.province.code || undefined,
        } : undefined,
      } : undefined,
      communities: locality.communities?.map(community => ({
        ...community,
      })),
    }
  }

  async update(input: UpdateLocalityInput): Promise<Locality> {
    const locality = await prisma.locality.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.districtId && { districtId: input.districtId }),
      },
      include: {
        district: {
          include: {
            province: true,
          },
        },
        communities: true,
      },
    })
    
    return {
      ...locality,
      district: locality.district ? {
        ...locality.district,
        code: locality.district.code || undefined,
        province: locality.district.province ? {
          ...locality.district.province,
          code: locality.district.province.code || undefined,
        } : undefined,
      } : undefined,
      communities: locality.communities?.map(community => ({
        ...community,
      })),
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.locality.delete({
      where: { id },
    })
  }
}

export class PrismaCommunityRepository implements CommunityRepository {
  async findAll(): Promise<Community[]> {
    const communities = await prisma.community.findMany({
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
      orderBy: {
        name: 'asc',
      },
    })
    
    return communities.map(community => ({
      ...community,
      locality: community.locality ? {
        ...community.locality,
        district: community.locality.district ? {
          ...community.locality.district,
          code: community.locality.district.code || undefined,
          province: community.locality.district.province ? {
            ...community.locality.district.province,
            code: community.locality.district.province.code || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    }))
  }

  async findById(id: string): Promise<Community | null> {
    const community = await prisma.community.findUnique({
      where: { id },
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
    })
    
    if (!community) return null
    
    return {
      ...community,
      locality: community.locality ? {
        ...community.locality,
        district: community.locality.district ? {
          ...community.locality.district,
          code: community.locality.district.code || undefined,
          province: community.locality.district.province ? {
            ...community.locality.district.province,
            code: community.locality.district.province.code || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    }
  }

  async findByLocalityId(localityId: string): Promise<Community[]> {
    const communities = await prisma.community.findMany({
      where: { localityId },
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
      orderBy: {
        name: 'asc',
      },
    })
    
    return communities.map(community => ({
      ...community,
      locality: community.locality ? {
        ...community.locality,
        district: community.locality.district ? {
          ...community.locality.district,
          code: community.locality.district.code || undefined,
          province: community.locality.district.province ? {
            ...community.locality.district.province,
            code: community.locality.district.province.code || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    }))
  }

  async create(input: CreateCommunityInput): Promise<Community> {
    const community = await prisma.community.create({
      data: input,
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
    })
    
    return {
      ...community,
      locality: community.locality ? {
        ...community.locality,
        district: community.locality.district ? {
          ...community.locality.district,
          code: community.locality.district.code || undefined,
          province: community.locality.district.province ? {
            ...community.locality.district.province,
            code: community.locality.district.province.code || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    }
  }

  async update(input: UpdateCommunityInput): Promise<Community> {
    const community = await prisma.community.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.localityId && { localityId: input.localityId }),
      },
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
    })
    
    return {
      ...community,
      locality: community.locality ? {
        ...community.locality,
        district: community.locality.district ? {
          ...community.locality.district,
          code: community.locality.district.code || undefined,
          province: community.locality.district.province ? {
            ...community.locality.district.province,
            code: community.locality.district.province.code || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.community.delete({
      where: { id },
    })
  }
}

// Unified Location Repository that combines all location-related operations
export class PrismaLocationRepository {
  private provinceRepo = new PrismaProvinceRepository()
  private districtRepo = new PrismaDistrictRepository()
  private localityRepo = new PrismaLocalityRepository()
  private communityRepo = new PrismaCommunityRepository()

  // Province methods
  async findAllProvinces() {
    return this.provinceRepo.findAll()
  }

  async findProvinceById(id: string) {
    return this.provinceRepo.findById(id)
  }

  async createProvince(input: CreateProvinceInput) {
    return this.provinceRepo.create(input)
  }

  async updateProvince(input: UpdateProvinceInput) {
    return this.provinceRepo.update(input)
  }

  async deleteProvince(id: string) {
    return this.provinceRepo.delete(id)
  }

  // District methods
  async findAllDistricts() {
    return this.districtRepo.findAll()
  }

  async findDistrictById(id: string) {
    return this.districtRepo.findById(id)
  }

  async findDistrictsByProvince(provinceId: string) {
    return this.districtRepo.findByProvinceId(provinceId)
  }

  async createDistrict(input: CreateDistrictInput) {
    return this.districtRepo.create(input)
  }

  async updateDistrict(input: UpdateDistrictInput) {
    return this.districtRepo.update(input)
  }

  async deleteDistrict(id: string) {
    return this.districtRepo.delete(id)
  }

  // Locality methods
  async findAllLocalities() {
    return this.localityRepo.findAll()
  }

  async findLocalityById(id: string) {
    return this.localityRepo.findById(id)
  }

  async findLocalitiesByDistrict(districtId: string) {
    return this.localityRepo.findByDistrictId(districtId)
  }

  async createLocality(input: CreateLocalityInput) {
    return this.localityRepo.create(input)
  }

  async updateLocality(input: UpdateLocalityInput) {
    return this.localityRepo.update(input)
  }

  async deleteLocality(id: string) {
    return this.localityRepo.delete(id)
  }

  // Community methods
  async findAllCommunities() {
    return this.communityRepo.findAll()
  }

  async findCommunityById(id: string) {
    return this.communityRepo.findById(id)
  }

  async findCommunitiesByLocality(localityId: string) {
    return this.communityRepo.findByLocalityId(localityId)
  }

  async createCommunity(input: CreateCommunityInput) {
    return this.communityRepo.create(input)
  }

  async updateCommunity(input: UpdateCommunityInput) {
    return this.communityRepo.update(input)
  }

  async deleteCommunity(id: string) {
    return this.communityRepo.delete(id)
  }
}