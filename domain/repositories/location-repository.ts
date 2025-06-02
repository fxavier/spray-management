import {
  Province,
  District,
  Locality,
  Community,
  CreateProvinceInput,
  UpdateProvinceInput,
  CreateDistrictInput,
  UpdateDistrictInput,
  CreateLocalityInput,
  UpdateLocalityInput,
  CreateCommunityInput,
  UpdateCommunityInput,
} from '../entities/location'

export interface ProvinceRepository {
  findAll(): Promise<Province[]>
  findById(id: string): Promise<Province | null>
  create(input: CreateProvinceInput): Promise<Province>
  update(input: UpdateProvinceInput): Promise<Province>
  delete(id: string): Promise<void>
}

export interface DistrictRepository {
  findAll(): Promise<District[]>
  findById(id: string): Promise<District | null>
  findByProvinceId(provinceId: string): Promise<District[]>
  create(input: CreateDistrictInput): Promise<District>
  update(input: UpdateDistrictInput): Promise<District>
  delete(id: string): Promise<void>
}

export interface LocalityRepository {
  findAll(): Promise<Locality[]>
  findById(id: string): Promise<Locality | null>
  findByDistrictId(districtId: string): Promise<Locality[]>
  create(input: CreateLocalityInput): Promise<Locality>
  update(input: UpdateLocalityInput): Promise<Locality>
  delete(id: string): Promise<void>
}

export interface CommunityRepository {
  findAll(): Promise<Community[]>
  findById(id: string): Promise<Community | null>
  findByLocalityId(localityId: string): Promise<Community[]>
  create(input: CreateCommunityInput): Promise<Community>
  update(input: UpdateCommunityInput): Promise<Community>
  delete(id: string): Promise<void>
}