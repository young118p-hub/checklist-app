import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: { id: string; email: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signInWithProvider: (provider: 'google' | 'naver' | 'kakao') => Promise<{ error?: string }>
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      if (data.user) {
        set({ 
          user: { id: data.user.id, email: data.user.email || '' },
          loading: false
        })
      }

      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      if (data.user) {
        set({ 
          user: { id: data.user.id, email: data.user.email || '' },
          loading: false
        })
      }

      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  signInWithProvider: async (provider: 'google' | 'naver' | 'kakao') => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      // OAuth는 리다이렉트이므로 여기서는 로딩을 false로 설정하지 않음
      // 리다이렉트 후 initialize에서 처리됨
      
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await supabase.auth.signOut()
      set({ user: null, loading: false })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ loading: false })
    }
  },

  initialize: () => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ 
          user: { id: session.user.id, email: session.user.email || '' },
          loading: false
        })
      } else {
        set({ user: null, loading: false })
      }
    })

    // 인증 상태 변경 리스너
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        set({ 
          user: { id: session.user.id, email: session.user.email || '' },
          loading: false
        })
      } else {
        set({ user: null, loading: false })
      }
    })
  },
}))