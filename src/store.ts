import { create } from 'zustand'

export type ServiceStatus = 'up' | 'down' | 'checking'
export type RAGRoute = 'bm25' | 'fuzzy' | 'semantic' | 'live' | 'error' | 'none'
export type VoiceState = 'IDLE' | 'LISTENING' | 'PREDICTING' | 'GENERATING' | 'SPEAKING' | 'BARGE_IN'

export interface Metrics {
  totalQueries: number
  ragQueries: number
  avgRagLatency: number
  ragHitRate: number
  traceViewers: number
}

export interface ServiceHealth {
  voiceAgent: ServiceStatus
  ragApi: ServiceStatus
  bridge: ServiceStatus
}

export interface QueryResult {
  id: string
  question: string
  answer: string
  route: RAGRoute
  ms: number
  score?: number
  timestamp: number
}

export interface LogEntry {
  id: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
  source: string
}

export interface QAPair {
  question: string
  answer: string
  category: string
  score: number
}

interface AppState {
  // Navigation
  activePage: string
  setActivePage: (page: string) => void

  // Voice
  voiceState: VoiceState
  setVoiceState: (s: VoiceState) => void
  transcript: string
  setTranscript: (t: string) => void
  agentResponse: string
  setAgentResponse: (r: string) => void
  isConnected: boolean
  setIsConnected: (v: boolean) => void
  isMicOn: boolean
  setIsMicOn: (v: boolean) => void

  // Metrics
  metrics: Metrics
  setMetrics: (m: Partial<Metrics>) => void

  // Health
  health: ServiceHealth
  setHealth: (h: Partial<ServiceHealth>) => void

  // Query history
  queryHistory: QueryResult[]
  addQuery: (q: QueryResult) => void

  // Logs
  logs: LogEntry[]
  addLog: (l: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void

  // RAG
  qaPairs: QAPair[]
  setQAPairs: (pairs: QAPair[]) => void
  tenantId: string
  setTenantId: (id: string) => void

  // Ingest
  ingestStatus: 'idle' | 'running' | 'done' | 'error'
  ingestPct: number
  ingestStage: string
  setIngest: (s: { status?: AppState['ingestStatus']; pct?: number; stage?: string }) => void
}

export const useStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  voiceState: 'IDLE',
  setVoiceState: (s) => set({ voiceState: s }),
  transcript: '',
  setTranscript: (t) => set({ transcript: t }),
  agentResponse: '',
  setAgentResponse: (r) => set({ agentResponse: r }),
  isConnected: false,
  setIsConnected: (v) => set({ isConnected: v }),
  isMicOn: false,
  setIsMicOn: (v) => set({ isMicOn: v }),

  metrics: { totalQueries: 0, ragQueries: 0, avgRagLatency: 0, ragHitRate: 0, traceViewers: 0 },
  setMetrics: (m) => set((s) => ({ metrics: { ...s.metrics, ...m } })),

  health: { voiceAgent: 'checking', ragApi: 'checking', bridge: 'checking' },
  setHealth: (h) => set((s) => ({ health: { ...s.health, ...h } })),

  queryHistory: [],
  addQuery: (q) => set((s) => ({ queryHistory: [q, ...s.queryHistory].slice(0, 50) })),

  logs: [],
  addLog: (l) => set((s) => ({
    logs: [{ ...l, id: crypto.randomUUID(), timestamp: Date.now() }, ...s.logs].slice(0, 200)
  })),
  clearLogs: () => set({ logs: [] }),

  qaPairs: [],
  setQAPairs: (pairs) => set({ qaPairs: pairs }),
  tenantId: 'demo',
  setTenantId: (id) => set({ tenantId: id }),

  ingestStatus: 'idle',
  ingestPct: 0,
  ingestStage: '',
  setIngest: (s) => set((prev) => ({
    ingestStatus: s.status ?? prev.ingestStatus,
    ingestPct:    s.pct    ?? prev.ingestPct,
    ingestStage:  s.stage  ?? prev.ingestStage,
  })),
}))
