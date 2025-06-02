import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ActorType {
  id: string
  name: string
  number: number
}

export interface Actor {
  id: string
  name: string
  actorType: ActorType
  actorTypeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ActorState {
  actorTypes: ActorType[]
  actors: Actor[]
  currentActor: Actor | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: ActorState = {
  actorTypes: [],
  actors: [],
  currentActor: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

const actorSlice = createSlice({
  name: 'actors',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setActorTypes: (state, action: PayloadAction<ActorType[]>) => {
      state.actorTypes = action.payload
      state.error = null
    },
    setActors: (state, action: PayloadAction<{ actors: Actor[]; pagination: any }>) => {
      state.actors = action.payload.actors
      state.pagination = action.payload.pagination
      state.error = null
    },
    addActor: (state, action: PayloadAction<Actor>) => {
      state.actors.unshift(action.payload)
    },
    updateActor: (state, action: PayloadAction<Actor>) => {
      const index = state.actors.findIndex(actor => actor.id === action.payload.id)
      if (index !== -1) {
        state.actors[index] = action.payload
      }
    },
    removeActor: (state, action: PayloadAction<string>) => {
      state.actors = state.actors.filter(actor => actor.id !== action.payload)
    },
    setCurrentActor: (state, action: PayloadAction<Actor | null>) => {
      state.currentActor = action.payload
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
  setActorTypes,
  setActors,
  addActor,
  updateActor,
  removeActor,
  setCurrentActor,
  setError,
  clearError,
} = actorSlice.actions

export default actorSlice.reducer