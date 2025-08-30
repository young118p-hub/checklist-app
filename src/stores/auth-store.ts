import { create } from 'zustand'

interface AuthState {
  user: { id: string; email: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'mock-user', email: 'user@example.com' },
  loading: false,
  
  signIn: async () => ({ }),
  signUp: async () => ({ }),
  signOut: async () => {},
  initialize: () => {},
}))