import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Province {
  id: string
  name: string
  code?: string
}

export interface District {
  id: string
  name: string
  code?: string
  provinceId: string
  province?: Province
}

export interface Locality {
  id: string
  name: string
  districtId: string
  district?: District
}

export interface Community {
  id: string
  name: string
  localityId: string
  locality?: Locality
}

interface LocationState {
  provinces: Province[]
  districts: District[]
  localities: Locality[]
  communities: Community[]
  selectedProvince: Province | null
  selectedDistrict: District | null
  selectedLocality: Locality | null
  selectedCommunity: Community | null
  isLoading: boolean
  error: string | null
}

const initialState: LocationState = {
  provinces: [],
  districts: [],
  localities: [],
  communities: [],
  selectedProvince: null,
  selectedDistrict: null,
  selectedLocality: null,
  selectedCommunity: null,
  isLoading: false,
  error: null,
}

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setProvinces: (state, action: PayloadAction<Province[]>) => {
      state.provinces = action.payload
      state.error = null
    },
    setDistricts: (state, action: PayloadAction<District[]>) => {
      state.districts = action.payload
      state.error = null
    },
    setLocalities: (state, action: PayloadAction<Locality[]>) => {
      state.localities = action.payload
      state.error = null
    },
    setCommunities: (state, action: PayloadAction<Community[]>) => {
      state.communities = action.payload
      state.error = null
    },
    setSelectedProvince: (state, action: PayloadAction<Province | null>) => {
      state.selectedProvince = action.payload
      state.selectedDistrict = null
      state.selectedLocality = null
      state.selectedCommunity = null
    },
    setSelectedDistrict: (state, action: PayloadAction<District | null>) => {
      state.selectedDistrict = action.payload
      state.selectedLocality = null
      state.selectedCommunity = null
    },
    setSelectedLocality: (state, action: PayloadAction<Locality | null>) => {
      state.selectedLocality = action.payload
      state.selectedCommunity = null
    },
    setSelectedCommunity: (state, action: PayloadAction<Community | null>) => {
      state.selectedCommunity = action.payload
    },
    addProvince: (state, action: PayloadAction<Province>) => {
      state.provinces.push(action.payload)
    },
    updateProvince: (state, action: PayloadAction<Province>) => {
      const index = state.provinces.findIndex(province => province.id === action.payload.id)
      if (index !== -1) {
        state.provinces[index] = action.payload
      }
    },
    removeProvince: (state, action: PayloadAction<string>) => {
      state.provinces = state.provinces.filter(province => province.id !== action.payload)
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setProvinces,
  setDistricts,
  setLocalities,
  setCommunities,
  setSelectedProvince,
  setSelectedDistrict,
  setSelectedLocality,
  setSelectedCommunity,
  addProvince,
  updateProvince,
  removeProvince,
  setError,
  clearError,
} = locationSlice.actions

export default locationSlice.reducer