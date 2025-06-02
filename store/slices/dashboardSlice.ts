import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DashboardMetrics {
  sprayProgress: {
    completedDays: number
    configuredDays: number
    percentage: number
  }
  coverage: {
    structuresSprayed: number
    structuresFound: number
    percentage: number
  }
  performance: {
    structuresPerHour: number
    brigadeCount: number
  }
}

export interface ChartData {
  name: string
  value: number
  date?: string
}

interface DashboardState {
  metrics: DashboardMetrics | null
  progressChart: ChartData[]
  coverageChart: ChartData[]
  performanceChart: ChartData[]
  isLoading: boolean
  error: string | null
}

const initialState: DashboardState = {
  metrics: null,
  progressChart: [],
  coverageChart: [],
  performanceChart: [],
  isLoading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setMetrics: (state, action: PayloadAction<DashboardMetrics>) => {
      state.metrics = action.payload
      state.error = null
    },
    setProgressChart: (state, action: PayloadAction<ChartData[]>) => {
      state.progressChart = action.payload
    },
    setCoverageChart: (state, action: PayloadAction<ChartData[]>) => {
      state.coverageChart = action.payload
    },
    setPerformanceChart: (state, action: PayloadAction<ChartData[]>) => {
      state.performanceChart = action.payload
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
  setMetrics,
  setProgressChart,
  setCoverageChart,
  setPerformanceChart,
  setError,
  clearError,
} = dashboardSlice.actions

export default dashboardSlice.reducer