// All requests go through Vite proxy → no CORS issues
export const VOICE_API  = '/voice-api'
export const RAG_API    = '/rag-api'
export const BRIDGE_API = '/bridge-api'
export const BRIDGE_WS  = `ws://${location.host}/ws`
export const VOICE_WS   = `ws://${location.host}/ws`   // proxied through bridge

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Health ────────────────────────────────────────────────────
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

// ── Voice ─────────────────────────────────────────────────────
export const fetchVoices = () =>
  req<{ id: string; name: string; lang: string }[]>(`${VOICE_API}/voices`)

export const fetchPersonas = () =>
  req<{ id: string; name: string; role: string; tone: string }[]>(`${VOICE_API}/personas`)

export const voiceLogin = (userId: string, tenantId: string, name = '', email = '') =>
  req<{ token: string; user_id: string; tenant_id: string }>(
    `${VOICE_API}/auth/login`,
    { method: 'POST', body: JSON.stringify({ user_id: userId, tenant_id: tenantId, name, email }) }
  )

// ── RAG ───────────────────────────────────────────────────────
export const ragQuery = (tenantId: string, question: string) =>
  req<{ answer: string; route: string; ms: number; score?: number; sql?: string }>(
    `${RAG_API}/rag/query`,
    { method: 'POST', body: JSON.stringify({ tenant_id: tenantId, question }) }
  )

export const fetchQAPairs = (tenantId: string, limit = 30) =>
  req<{ qa_pairs: { question: string; answer: string; category: string; score: number }[]; source?: string }>(
    `${RAG_API}/rag/qa/${tenantId}?limit=${limit}`
  )

export const fetchQueryLogs = (tenantId: string, limit = 50) =>
  req<{
    logs: {
      id: string; question: string; answer: string
      route: string; latency_ms: number; score: number | null; created_at: string
    }[]
  }>(`${RAG_API}/rag/logs/${tenantId}?limit=${limit}`)

export const fetchTenantUsers = (tenantId: string) =>
  req<{ users: { user_id: string; email: string; name: string; role: string }[] }>(
    `${RAG_API}/rag/users/${tenantId}`
  )

export const triggerIngest = (body: Record<string, unknown>) =>
  req<{ status: string; tenant_id: string }>(
    `${RAG_API}/rag/ingest`,
    { method: 'POST', body: JSON.stringify(body) }
  )

export const pollIngestStatus = (tenantId: string, since = 0) =>
  req<{
    status: string; stage: string; pct: number
    stored: number; total: number; tables: number; domain: string
    log: { level: string; msg: string }[]
  }>(`${RAG_API}/rag/status/${tenantId}?since=${since}`)

export const fetchTenants = () =>
  req<{ tenant_id: string; name: string; plan: string }[]>(`${RAG_API}/tenants`)

// ── File upload ───────────────────────────────────────────────
export const uploadFile = (tenantId: string, file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('tenant_id', tenantId)
  return fetch(`${RAG_API}/connect/file`, { method: 'POST', body: fd }).then(r => r.json())
}

// ── Call Center ───────────────────────────────────────────────

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
  req<DashboardStats>(
    `${VOICE_API}/dashboard${tenantId ? `?tenant_id=${tenantId}` : ''}`
  )

export const fetchActiveRooms = (tenantId?: string, state?: string) => {
  const params = new URLSearchParams()
  if (tenantId) params.set('tenant_id', tenantId)
  if (state) params.set('state', state)
  const qs = params.toString()
  return req<{ count: number; rooms: Room[] }>(
    `${VOICE_API}/telephony/rooms${qs ? `?${qs}` : ''}`
  )
}

export const fetchRoomDetails = (roomId: string) =>
  req<Room & { 
    call_sid: string
    user_id: string
    worker_id: string
    connected_at: number
    interruption_count: number
    conversation: Array<{ q: string; a: string; ts: number; latency_ms: number; route: string }>
    metadata: Record<string, unknown>
  }>(`${VOICE_API}/telephony/rooms/${roomId}`)

export const controlCall = (roomId: string, action: 'hold' | 'resume' | 'transfer' | 'end', target = '') =>
  req<{ status: string; target?: string }>(
    `${VOICE_API}/telephony/control/${roomId}`,
    { method: 'POST', body: JSON.stringify({ action, target }) }
  )

export const initiateOutboundCall = (
  toPhone: string,
  tenantId: string,
  options?: { campaign_id?: string; script?: string; persona?: string; metadata?: Record<string, unknown> }
) =>
  req<{ status: string; room_id: string; call_sid: string }>(
    `${VOICE_API}/telephony/outbound`,
    { method: 'POST', body: JSON.stringify({ to_phone: toPhone, tenant_id: tenantId, ...options }) }
  )

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
