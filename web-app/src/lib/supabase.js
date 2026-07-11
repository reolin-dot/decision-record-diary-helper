import { createClient } from '@supabase/supabase-js'
import { getPasswordRecoveryRoute } from './authRedirect.js'

export const passwordRecoveryRoute = typeof window === 'undefined'
  ? null
  : getPasswordRecoveryRoute(window.location)

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
