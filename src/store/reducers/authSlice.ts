import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  role: 'user' | 'provider' | 'admin'
  city: string | null
  avatar: string | null
  serviceProvider?: any
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('nolva_token', action.payload.token)
        localStorage.setItem('nolva_user', JSON.stringify(action.payload.user))
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('nolva_user', JSON.stringify(action.payload))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nolva_token')
        localStorage.removeItem('nolva_user')
      }
    },
    initFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nolva_token')
        const userStr = localStorage.getItem('nolva_user')
        if (token && userStr) {
          state.token = token
          state.user = JSON.parse(userStr)
          state.isAuthenticated = true
        }
      }
    },
  },
})

export const { setCredentials, updateUser, logout, initFromStorage } = authSlice.actions
export default authSlice.reducer
