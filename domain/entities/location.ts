export interface Province {
  id: string
  name: string
  code?: string | null
  districts?: District[]
}

export interface District {
  id: string
  name: string
  code?: string | null
  provinceId: string
  province?: Province
  localities?: Locality[]
}

export interface Locality {
  id: string
  name: string
  districtId: string
  district?: District
  communities?: Community[]
}

export interface Community {
  id: string
  name: string
  localityId: string
  locality?: Locality
}

export interface CreateProvinceInput {
  name: string
  code?: string
}

export interface UpdateProvinceInput {
  id: string
  name?: string
  code?: string
}

export interface CreateDistrictInput {
  name: string
  code?: string
  provinceId: string
}

export interface UpdateDistrictInput {
  id: string
  name?: string
  code?: string
  provinceId?: string
}

export interface CreateLocalityInput {
  name: string
  districtId: string
}

export interface UpdateLocalityInput {
  id: string
  name?: string
  districtId?: string
}

export interface CreateCommunityInput {
  name: string
  localityId: string
}

export interface UpdateCommunityInput {
  id: string
  name?: string
  localityId?: string
}