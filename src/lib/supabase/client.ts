// Mock Supabase client for deployment
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve(),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
}