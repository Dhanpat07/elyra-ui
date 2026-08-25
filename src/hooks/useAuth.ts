import { create } from 'zustand'
import { supabase, type Profile } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user:        User | null
  session:     Session | null
  profile:     Profile | null
  loading:     boolean
  initialized: boolean

  signIn:       (email: string, password: string) => Promise<string | null>
  signUp:       (email: string, password: string, name: string, tenantId: string) => Promise<string | null>
  signOut:      () => Promise<void>
  loadProfile:  () => Promise<void>
  updateProfile:(updates: Partial<Profile>) => Promise<void>
  init:         () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user:        null,
  session:     null,
  profile:     null,
  loading:     false,
  initialized: false,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })
    if (session?.user) await get().loadProfile()
    set({ initialized: true })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) await get().loadProfile()
      else set({ profile: null })
    })
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signUp: async (email, password, name, tenantId) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, tenant_id: tenantId } }
    })
    if (error) { set({ loading: false }); return error.message }

    // Insert into users table
    if (data.user) {
      await supabase.from('users').insert({
        id:        data.user.id,
        tenant_id: tenantId,
        email,
        name,
        role:      'user',
      })
    }
    set({ loading: false })
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },

  loadProfile: async () => {
    const user = get().user
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) set({ profile: data as Profile })
  },

  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return
    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) set({ profile: data as Profile })
  },
}))
