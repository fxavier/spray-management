import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SprayType = 'PRINCIPAL' | 'SECUNDARIA'
export type ReasonNotSprayed = 'RECUSA' | 'FECHADA' | 'OUTRO'
export type WallsType = 'MATOPE' | 'COLMO' | 'CIMENTO'
export type RoofsType = 'CAPIM_PLASTICO' | 'ZINCO'
export type SprayStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface SprayConfiguration {
  id: string
  year: number
  provinceId?: string
  districtId?: string
  proposedSprayDays: number
  startDate?: string
  endDate?: string
  sprayRounds: number
  daysBetweenRounds: number
  description?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SprayTotals {
  id: string
  sprayerId: string
  brigadeChiefId: string
  communityId: string
  sprayConfigurationId?: string
  sprayType: SprayType
  sprayDate: string
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
  createdAt: string
  updatedAt: string
}

interface SprayState {
  configurations: SprayConfiguration[]
  sprayTotals: SprayTotals[]
  currentConfiguration: SprayConfiguration | null
  currentSprayTotal: SprayTotals | null
  isLoading: boolean
  error: string | null
  filters: {
    year?: number
    provinceId?: string
    districtId?: string
    sprayStatus?: SprayStatus
    sprayType?: SprayType
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: SprayState = {
  configurations: [],
  sprayTotals: [],
  currentConfiguration: null,
  currentSprayTotal: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

const spraySlice = createSlice({
  name: 'spray',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setConfigurations: (state, action: PayloadAction<SprayConfiguration[]>) => {
      state.configurations = action.payload
      state.error = null
    },
    setSprayTotals: (state, action: PayloadAction<{ sprayTotals: SprayTotals[]; pagination: any }>) => {
      state.sprayTotals = action.payload.sprayTotals
      state.pagination = action.payload.pagination
      state.error = null
    },
    addConfiguration: (state, action: PayloadAction<SprayConfiguration>) => {
      state.configurations.unshift(action.payload)
    },
    updateConfiguration: (state, action: PayloadAction<SprayConfiguration>) => {
      const index = state.configurations.findIndex(config => config.id === action.payload.id)
      if (index !== -1) {
        state.configurations[index] = action.payload
      }
    },
    removeConfiguration: (state, action: PayloadAction<string>) => {
      state.configurations = state.configurations.filter(config => config.id !== action.payload)
    },
    addSprayTotal: (state, action: PayloadAction<SprayTotals>) => {
      state.sprayTotals.unshift(action.payload)
    },
    updateSprayTotal: (state, action: PayloadAction<SprayTotals>) => {
      const index = state.sprayTotals.findIndex(spray => spray.id === action.payload.id)
      if (index !== -1) {
        state.sprayTotals[index] = action.payload
      }
    },
    removeSprayTotal: (state, action: PayloadAction<string>) => {
      state.sprayTotals = state.sprayTotals.filter(spray => spray.id !== action.payload)
    },
    setCurrentConfiguration: (state, action: PayloadAction<SprayConfiguration | null>) => {
      state.currentConfiguration = action.payload
    },
    setCurrentSprayTotal: (state, action: PayloadAction<SprayTotals | null>) => {
      state.currentSprayTotal = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
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
  setConfigurations,
  setSprayTotals,
  addConfiguration,
  updateConfiguration,
  removeConfiguration,
  addSprayTotal,
  updateSprayTotal,
  removeSprayTotal,
  setCurrentConfiguration,
  setCurrentSprayTotal,
  setFilters,
  clearFilters,
  setError,
  clearError,
} = spraySlice.actions

export default spraySlice.reducer