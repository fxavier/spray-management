import {
  SprayConfiguration,
  SprayTotals,
  CreateSprayConfigurationInput,
  UpdateSprayConfigurationInput,
  CreateSprayTotalsInput,
  UpdateSprayTotalsInput,
} from '../entities/spray'

export interface SprayConfigurationRepository {
  findAll(): Promise<SprayConfiguration[]>
  findById(id: string): Promise<SprayConfiguration | null>
  findByYear(year: number): Promise<SprayConfiguration[]>
  findByProvinceId(provinceId: string): Promise<SprayConfiguration[]>
  create(input: CreateSprayConfigurationInput): Promise<SprayConfiguration>
  update(input: UpdateSprayConfigurationInput): Promise<SprayConfiguration>
  delete(id: string): Promise<void>
}

export interface SprayTotalsRepository {
  findAll(filters?: {
    year?: number
    provinceId?: string
    districtId?: string
    communityId?: string
    sprayStatus?: string
    startDate?: Date
    endDate?: Date
  }): Promise<SprayTotals[]>
  findById(id: string): Promise<SprayTotals | null>
  findBySprayerId(sprayerId: string): Promise<SprayTotals[]>
  findByCommunityId(communityId: string): Promise<SprayTotals[]>
  create(input: CreateSprayTotalsInput): Promise<SprayTotals>
  update(input: UpdateSprayTotalsInput): Promise<SprayTotals>
  delete(id: string): Promise<void>
  softDelete(id: string, deletedBy: string): Promise<void>
}