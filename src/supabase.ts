import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(url, key)

export type Profile = {
  id:                string
  tenant_id:         string
  email:             string
  name:              string
  role:              string
  preferred_voice:   string
  preferred_persona: string
  language:          string
  total_queries:     number
  total_sessions:    number
  last_active:       string | null
  created_at:        string
}

export type Tenant = {
  id:         string
  name:       string
  plan:       string
  rate_limit: number
  active:     boolean
  created_at: string
}

export type QueryLog = {
  id:         string
  tenant_id:  string
  user_id:    string | null
  question:   string
  answer:     string
  route:      string
  latency_ms: number
  score:      number | null
  created_at: string
}
