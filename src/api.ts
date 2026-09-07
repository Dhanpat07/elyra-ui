/**
 * API Client
 *
 * Handles communication with backend services.
 * Authentication: auto-obtains a guest token for LAALI_API if none exists.
 */

// All requests go through Vite proxy → no CORS issues
export const VOICE_API = '/voice-api'
export const RAG_API = '/rag-api'
export const BRIDGE_API = '/bridge-api'
export const LAALI_API = '/laali-api'
export const BRIDGE_WS = `ws://${location.host}/ws`
export const VOICE_WS = `ws://${location.host}/ws` // proxied through bridge

// ═══════════════════════════════════════════════════════════════════════════
// AUTH TOKEN MANAGEMENT (for LAALI_API / voice-agent-mvp)
// ═══════════════════════════════════════════════════════════════════════════

const TOKEN_KEY = 'laali_token'
const TENANT_KEY = 'laali_tenant_id'

interface TokenPayload {
  user_id: string
  tenant_id: string
  role: string
  exp: number
}

let _cachedToken: string | null = null

/** Get current tenant from the stored token */
export function getCurrentTenantId(): string {
  return sessionStorage.getItem(TENANT_KEY) || 'demo'
}

/** Set the active tenant (also fetches a new token scoped to it) */
export async function setCurrentTenant(tenantId: string): Promise<void> {
  sessionStorage.setItem(TENANT_KEY, tenantId)
  // Clear cached token so next request fetches one for this tenant
  _cachedToken = null
  sessionStorage.removeItem(TOKEN_KEY)
}

/** Parse JWT payload (no verification, just decode for exp/tenant) */
function parseToken(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

/** Check if token is expired or will expire within 60s */
function isExpired(token: string): boolean {
  const p = parseToken(token)
  if (!p) return true
  return p.exp * 1000 < Date.now() + 60_000
}

/** Get a valid token, fetching a new guest token if needed */
async function getToken(): Promise<string> {
  // 1. Check memory cache
  if (_cachedToken && !isExpired(_cachedToken)) {
    return _cachedToken
  }

  // 2. Check sessionStorage
  const stored = sessionStorage.getItem(TOKEN_KEY)
  if (stored && !isExpired(stored)) {
    _cachedToken = stored
    return stored
  }

  // 3. Fetch a new guest token
  const tenantId = getCurrentTenantId()
  const res = await fetch(`${LAALI_API}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_id: tenantId }),
  })
  if (!res.ok) {
    throw new Error(`Failed to obtain auth token: ${res.status}`)
  }
  const data = (await res.json()) as { access_token: string }
  _cachedToken = data.access_token
  sessionStorage.setItem(TOKEN_KEY, data.access_token)
  return data.access_token
}

/** Login with username/password (for admin access) */
export async function laaliLogin(
  username: string,
  password: string,
  tenantId: string
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${LAALI_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, tenant_id: tenantId }),
  })
  if (!res.ok) {
    const msg = res.status === 401 ? 'Invalid credentials' : `Login failed: ${res.status}`
    throw new Error(msg)
  }
  const data = (await res.json()) as { access_token: string; token_type: string }
  _cachedToken = data.access_token
  sessionStorage.setItem(TOKEN_KEY, data.access_token)
  sessionStorage.setItem(TENANT_KEY, tenantId)
  return data
}

/** Clear stored token (logout) */
export function laaliLogout(): void {
  _cachedToken = null
  sessionStorage.removeItem(TOKEN_KEY)
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL OTP AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

interface OTPRequestResponse {
  success: boolean
  message: string
}

interface OTPVerifyResponse {
  success: boolean
  message: string
  token: string
  user_id: string
  tenant_id: string
  email: string
}

/** Request OTP to be sent to email */
export async function requestEmailOTP(email: string): Promise<OTPRequestResponse> {
  const res = await fetch(`${LAALI_API}/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    return { success: false, message: data.detail || 'Failed to send OTP' }
  }
  
  return data
}

/** Verify OTP and get auth token */
export async function verifyEmailOTP(
  email: string, 
  otp: string, 
  name?: string
): Promise<OTPVerifyResponse & { error?: string }> {
  const res = await fetch(`${LAALI_API}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, name: name || '' }),
  })
  
  const data = await res.json()
  
  if (!res.ok) {
    return { 
      success: false, 
      message: data.detail || 'Verification failed',
      error: data.detail || 'Verification failed',
      token: '',
      user_id: '',
      tenant_id: '',
      email: '',
    }
  }
  
  // Store the token
  if (data.token) {
    _cachedToken = data.token
    sessionStorage.setItem(TOKEN_KEY, data.token)
    sessionStorage.setItem(TENANT_KEY, data.tenant_id || 'demo')
  }
  
  return data
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Generic request helper (no auth) */
async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  // Handle 204 No Content
  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON, got ${contentType}`)
  }
  return res.json()
}

/** Authenticated request helper (for LAALI_API) */
async function authReq<T>(url: string, opts?: RequestInit): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(opts?.headers as Record<string, string>),
  }
  const res = await fetch(url, { ...opts, headers })

  // If 401, clear token and retry once (token may have just expired)
  if (res.status === 401) {
    laaliLogout()
    const newToken = await getToken()
    const retryRes = await fetch(url, {
      ...opts,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    })
    if (!retryRes.ok) {
      const text = await retryRes.text().catch(() => '')
      throw new Error(text || `HTTP ${retryRes.status}`)
    }
    if (retryRes.status === 204) return undefined as T
    return retryRes.json()
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON, got ${contentType}`)
  }
  return res.json()
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH (public, no auth)
// ═══════════════════════════════════════════════════════════════════════════

export const fetchBridgeHealth = () =>
  req<{ status: string; services: Record<string, string> }>(`${BRIDGE_API}/health`)

export const fetchVoiceHealth = () =>
  req<{ status: string; sessions: number }>(`${VOICE_API}/health`)

export const fetchRagHealth = () =>
  req<{ status: string; service: string }>(`${RAG_API}/health`)

// ── Bridge Metrics ────────────────────────────────────────────
export const fetchMetrics = () =>
  req<{
    total_queries: number
    rag_queries: number
    rag_hit_rate: number
    avg_rag_latency: number
    trace_viewers: number
  }>(`${BRIDGE_API}/metrics`)

// ═══════════════════════════════════════════════════════════════════════════
// VOICE (may need auth later, currently public)
// ═══════════════════════════════════════════════════════════════════════════

export const fetchVoices = () =>
  req<{ id: string; name: string; lang: string }[]>(`${VOICE_API}/voices`)

export const fetchPersonas = () =>
  req<{ id: string; name: string; role: string; tone: string }[]>(`${VOICE_API}/personas`)

export const voiceLogin = (userId: string, tenantId: string, name = '', email = '') =>
  req<{ token: string; user_id: string; tenant_id: string }>(
    `${VOICE_API}/auth/login`,
    { method: 'POST', body: JSON.stringify({ user_id: userId, tenant_id: tenantId, name, email }) }
  )

// ═══════════════════════════════════════════════════════════════════════════
// RAG (elyra-rag backend, separate auth — not updated yet)
// ═══════════════════════════════════════════════════════════════════════════

export const ragQuery = (tenantId: string, question: string) =>
  req<{ answer: string; route: string; ms: number; score?: number; sql?: string }>(
    `${RAG_API}/rag/query`,
    { method: 'POST', body: JSON.stringify({ tenant_id: tenantId, question }) }
  )

export const fetchQAPairs = (tenantId: string, limit = 30) =>
  req<{
    qa_pairs: { question: string; answer: string; category: string; score: number }[]
    source?: string
  }>(`${RAG_API}/rag/qa/${tenantId}?limit=${limit}`)

export const fetchQueryLogs = (tenantId: string, limit = 50) =>
  req<{
    logs: {
      id: string
      question: string
      answer: string
      route: string
      latency_ms: number
      score: number | null
      created_at: string
    }[]
  }>(`${RAG_API}/rag/logs/${tenantId}?limit=${limit}`)

export const fetchTenantUsers = (tenantId: string) =>
  req<{ users: { user_id: string; email: string; name: string; role: string }[] }>(
    `${RAG_API}/rag/users/${tenantId}`
  )

export const triggerIngest = (body: Record<string, unknown>) =>
  req<{ status: string; tenant_id: string }>(`${RAG_API}/rag/ingest`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const pollIngestStatus = (tenantId: string, since = 0) =>
  req<{
    status: string
    stage: string
    pct: number
    stored: number
    total: number
    tables: number
    domain: string
    log: { level: string; msg: string }[]
  }>(`${RAG_API}/rag/status/${tenantId}?since=${since}`)

export const fetchTenants = () =>
  req<{ tenant_id: string; name: string; plan: string }[]>(`${RAG_API}/tenants`)

// ── File upload ───────────────────────────────────────────────
export const uploadFile = (tenantId: string, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('tenant_id', tenantId)
  return fetch(`${RAG_API}/connect/file`, { method: 'POST', body: fd }).then((r) => r.json())
}

// ═══════════════════════════════════════════════════════════════════════════
// CALL CENTER (voice-agent-mvp, may need auth later)
// ═══════════════════════════════════════════════════════════════════════════

export interface Room {
  room_id: string
  caller_phone: string
  caller_name: string
  tenant_id: string
  state: string
  persona: string
  language: string
  created_at: number
  duration_sec: number
  turn_count: number
  avg_latency_ms: number
  last_turn: { q: string; a: string; ts: number } | null
}

export interface DashboardStats {
  timestamp: number
  active_calls: number
  calls_by_state: Record<string, number>
  total_duration_sec: number
  total_turns: number
  avg_duration_sec: number
  workers: {
    total: number
    healthy: number
    avg_load: number
  }
  today: {
    calls_completed: number
    total_turns: number
    avg_latency_ms: number
  }
  alerts: Array<{ level: string; message: string; timestamp: number }>
  uptime_sec: number
}

export const fetchCallCenterDashboard = (tenantId?: string) =>
  req<DashboardStats>(`${VOICE_API}/dashboard${tenantId ? `?tenant_id=${tenantId}` : ''}`)

export const fetchActiveRooms = (tenantId?: string, state?: string) => {
  const params = new URLSearchParams()
  if (tenantId) params.set('tenant_id', tenantId)
  if (state) params.set('state', state)
  const qs = params.toString()
  return req<{ count: number; rooms: Room[] }>(`${VOICE_API}/telephony/rooms${qs ? `?${qs}` : ''}`)
}

export const fetchRoomDetails = (roomId: string) =>
  req<
    Room & {
      call_sid: string
      user_id: string
      worker_id: string
      connected_at: number
      interruption_count: number
      conversation: Array<{ q: string; a: string; ts: number; latency_ms: number; route: string }>
      metadata: Record<string, unknown>
    }
  >(`${VOICE_API}/telephony/rooms/${roomId}`)

export const controlCall = (
  roomId: string,
  action: 'hold' | 'resume' | 'transfer' | 'end',
  target = ''
) =>
  req<{ status: string; target?: string }>(`${VOICE_API}/telephony/control/${roomId}`, {
    method: 'POST',
    body: JSON.stringify({ action, target }),
  })

export const initiateOutboundCall = (
  toPhone: string,
  tenantId: string,
  options?: {
    campaign_id?: string
    script?: string
    persona?: string
    metadata?: Record<string, unknown>
  }
) =>
  req<{ status: string; room_id: string; call_sid: string }>(`${VOICE_API}/telephony/outbound`, {
    method: 'POST',
    body: JSON.stringify({ to_phone: toPhone, tenant_id: tenantId, ...options }),
  })

export const fetchCallCenterStats = (tenantId?: string) =>
  req<{
    active_rooms: number
    calls_by_state: Record<string, number>
    workers: Array<{
      worker_id: string
      host: string
      port: number
      active_rooms: number
      max_rooms: number
      load_percent: number
      is_healthy: boolean
    }>
  }>(`${VOICE_API}/telephony/stats${tenantId ? `?tenant_id=${tenantId}` : ''}`)

// ═══════════════════════════════════════════════════════════════════════════
// LAALI AI (voice-agent-mvp api_server.py — NOW REQUIRES AUTH)
// ═══════════════════════════════════════════════════════════════════════════

export interface LaaliTenant {
  tenant_id: string
  profiled: boolean
  connected: boolean
  tables: number
  entities: string[]
  templates: number
  storage_kb?: number
}

export interface LaaliQueryResult {
  success: boolean
  answer: string
  method?: 'template' | 'llm' | 'chat' | 'greeting'
  template?: string
  sql?: string
  latency_ms?: number
  rows?: number
  cached?: boolean
  needs_reconnect?: boolean
  error?: string
}

export interface LaaliConnectResult {
  success: boolean
  message: string
  status: LaaliTenant
  cached?: boolean
  result?: {
    success: boolean
    tables: number
    entities: Record<string, string>
    templates: number
  }
}

export const laaliHealth = () =>
  req<{ status: string; service: string }>(`${LAALI_API}/health`)

/**
 * List all tenants — requires admin role.
 * For non-admin users, use laaliGetTenant() for the current tenant.
 */
export const laaliListTenants = () =>
  authReq<{ tenants: LaaliTenant[]; total_storage: { total_kb: number } }>(`${LAALI_API}/tenants`)

export const laaliGetTenant = (tenantId: string) =>
  authReq<{
    tenant_id: string
    status: LaaliTenant
    data_info: { profile_kb: number; cache_kb: number; total_kb: number }
    entities: Record<string, string>
    templates: Array<{ name: string; description: string; sql: string }>
  }>(`${LAALI_API}/tenant/${tenantId}`)

/**
 * Connect to a database. The tenant_id is derived from your auth token,
 * so you must call setCurrentTenant() first if connecting a new tenant.
 */
export const laaliConnect = (
  dbType: string,
  host: string,
  port: number,
  user: string,
  catalogSchema: string,
  password?: string
) =>
  authReq<LaaliConnectResult>(`${LAALI_API}/connect`, {
    method: 'POST',
    body: JSON.stringify({
      db_type: dbType,
      host,
      port,
      user,
      catalog_schema: catalogSchema,
      password,
    }),
  })

/**
 * Reconnect to database for the current tenant (from token).
 */
export const laaliReconnect = (
  dbType: string,
  host: string,
  port: number,
  user: string,
  catalogSchema: string,
  password?: string
) =>
  authReq<LaaliConnectResult>(`${LAALI_API}/reconnect`, {
    method: 'POST',
    body: JSON.stringify({
      db_type: dbType,
      host,
      port,
      user,
      catalog_schema: catalogSchema,
      password,
    }),
  })

/**
 * Query with natural language. Tenant is derived from auth token.
 */
export const laaliQuery = (query: string) =>
  authReq<LaaliQueryResult>(`${LAALI_API}/query`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  })

export const laaliDeleteTenant = (tenantId: string) =>
  authReq<{ success: boolean; message: string }>(`${LAALI_API}/tenant/${tenantId}`, {
    method: 'DELETE',
  })

export const laaliClearCache = (tenantId: string) =>
  authReq<{ success: boolean; message: string }>(`${LAALI_API}/tenant/${tenantId}/cache`, {
    method: 'DELETE',
  })
