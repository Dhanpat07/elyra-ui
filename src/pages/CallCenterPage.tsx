import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, PhoneOff, PhoneIncoming, Users, Clock, Activity,
  Pause, Play, ArrowRightLeft, Volume2, AlertTriangle,
  TrendingUp, Zap, MessageSquare, RefreshCw
} from 'lucide-react'
import { cn, formatMs } from '../lib'
import { StatCard } from '../components/StatCard'
import { useStore } from '../store'

// Types
interface Room {
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

interface DashboardStats {
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

const STATE_COLORS: Record<string, string> = {
  IDLE: 'bg-slate-500',
  RINGING: 'bg-yellow-500 animate-pulse',
  CONNECTED: 'bg-blue-500',
  LISTENING: 'bg-emerald-500',
  THINKING: 'bg-purple-500 animate-pulse',
  SPEAKING: 'bg-brand-500',
  INTERRUPTED: 'bg-orange-500',
  ON_HOLD: 'bg-gray-500',
  ENDED: 'bg-red-500',
}

const STATE_ICONS: Record<string, React.ReactNode> = {
  RINGING: <PhoneIncoming size={14} />,
  LISTENING: <Volume2 size={14} />,
  THINKING: <Activity size={14} className="animate-pulse" />,
  SPEAKING: <MessageSquare size={14} />,
  ON_HOLD: <Pause size={14} />,
}

function StateIndicator({ state }: { state: string }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white',
      STATE_COLORS[state] || 'bg-slate-600'
    )}>
      {STATE_ICONS[state]}
      <span>{state}</span>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  if (phone.startsWith('+')) {
    return phone.replace(/(\+\d{1,2})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4')
  }
  return phone
}

function RoomCard({ room, onControl }: { 
  room: Room
  onControl: (roomId: string, action: string) => void 
}) {
  const isActive = !['ENDED', 'IDLE'].includes(room.state)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'bg-surface-800/80 backdrop-blur rounded-xl border p-4 transition-all',
        isActive ? 'border-brand-500/30 shadow-lg shadow-brand-500/5' : 'border-white/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isActive ? 'bg-brand-500/20' : 'bg-slate-700'
          )}>
            <Phone size={18} className={isActive ? 'text-brand-400' : 'text-slate-400'} />
          </div>
          <div>
            <p className="font-semibold text-white">
              {room.caller_name || formatPhone(room.caller_phone)}
            </p>
            <p className="text-xs text-slate-500">
              {room.caller_name ? formatPhone(room.caller_phone) : room.room_id.slice(-12)}
            </p>
          </div>
        </div>
        <StateIndicator state={room.state} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-surface-900/50 rounded-lg">
          <Clock size={14} className="mx-auto text-slate-500 mb-1" />
          <p className="text-sm font-medium text-white">{formatDuration(room.duration_sec)}</p>
          <p className="text-[10px] text-slate-500">Duration</p>
        </div>
        <div className="text-center p-2 bg-surface-900/50 rounded-lg">
          <MessageSquare size={14} className="mx-auto text-slate-500 mb-1" />
          <p className="text-sm font-medium text-white">{room.turn_count}</p>
          <p className="text-[10px] text-slate-500">Turns</p>
        </div>
        <div className="text-center p-2 bg-surface-900/50 rounded-lg">
          <Zap size={14} className="mx-auto text-slate-500 mb-1" />
          <p className="text-sm font-medium text-white">{room.avg_latency_ms.toFixed(0)}ms</p>
          <p className="text-[10px] text-slate-500">Latency</p>
        </div>
      </div>

      {/* Last Turn */}
      {room.last_turn && (
        <div className="p-3 bg-surface-900/50 rounded-lg mb-3 text-sm">
          <p className="text-slate-400 truncate">
            <span className="text-slate-500">Q:</span> {room.last_turn.q}
          </p>
          <p className="text-emerald-400 truncate mt-1">
            <span className="text-slate-500">A:</span> {room.last_turn.a}
          </p>
        </div>
      )}

      {/* Controls */}
      {isActive && (
        <div className="flex gap-2">
          {room.state === 'ON_HOLD' ? (
            <button
              onClick={() => onControl(room.room_id, 'resume')}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition text-sm"
            >
              <Play size={14} /> Resume
            </button>
          ) : (
            <button
              onClick={() => onControl(room.room_id, 'hold')}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition text-sm"
            >
              <Pause size={14} /> Hold
            </button>
          )}
          <button
            onClick={() => onControl(room.room_id, 'transfer')}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition text-sm"
          >
            <ArrowRightLeft size={14} /> Transfer
          </button>
          <button
            onClick={() => onControl(room.room_id, 'end')}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition text-sm"
          >
            <PhoneOff size={14} /> End
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
        <span>{room.persona} · {room.language.toUpperCase()}</span>
        <span>{room.tenant_id}</span>
      </div>
    </motion.div>
  )
}

function AlertItem({ alert }: { alert: { level: string; message: string; timestamp: number } }) {
  const colors = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  
  const time = new Date(alert.timestamp * 1000).toLocaleTimeString()
  
  return (
    <div className={cn(
      'flex items-start gap-2 p-2 rounded-lg border text-sm',
      colors[alert.level as keyof typeof colors] || colors.info
    )}>
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="truncate">{alert.message}</p>
        <p className="text-xs opacity-60 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

export function CallCenterPage() {
  const { profile } = useStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const API_BASE = import.meta.env.VITE_VOICE_API_URL || 'http://localhost:8000'

  const fetchData = useCallback(async () => {
    try {
      const tenantId = profile?.tenant_id || 'demo'
      
      // Fetch dashboard stats
      const statsRes = await fetch(`${API_BASE}/dashboard?tenant_id=${tenantId}`)
      if (!statsRes.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes.json()
      
      // Fetch active rooms
      const roomsRes = await fetch(`${API_BASE}/telephony/rooms?tenant_id=${tenantId}`)
      if (!roomsRes.ok) throw new Error('Failed to fetch rooms')
      const roomsData = await roomsRes.json()
      
      setStats(statsData)
      setRooms(roomsData.rooms || [])
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [API_BASE, profile?.tenant_id])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [fetchData])

  const handleControl = async (roomId: string, action: string) => {
    try {
      const res = await fetch(`${API_BASE}/telephony/control/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target: '' }),
      })
      
      if (!res.ok) throw new Error('Control action failed')
      
      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Control error:', err)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <AlertTriangle size={32} className="mx-auto text-red-400 mb-2" />
        <p className="text-red-400 font-medium">{error}</p>
        <p className="text-sm text-slate-500 mt-1">
          Make sure Redis is configured and the voice agent is running.
        </p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active Calls" 
          value={stats?.active_calls || 0} 
          icon={<Phone size={18} />} 
          color="indigo" 
          delay={0}
          delta="live"
          deltaUp
        />
        <StatCard 
          label="Today's Calls" 
          value={stats?.today?.calls_completed || 0} 
          icon={<TrendingUp size={18} />} 
          color="green" 
          delay={0.05}
        />
        <StatCard 
          label="Avg Latency" 
          value={formatMs(stats?.today?.avg_latency_ms || 0)} 
          icon={<Zap size={18} />} 
          color="purple" 
          delay={0.1}
        />
        <StatCard 
          label="Workers" 
          value={`${stats?.workers?.healthy || 0}/${stats?.workers?.total || 0}`} 
          icon={<Users size={18} />} 
          color="orange" 
          delay={0.15}
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Calls List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Phone size={18} className="text-brand-400" />
              Active Calls
              {rooms.length > 0 && (
                <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full text-xs">
                  {rooms.length}
                </span>
              )}
            </h2>
            {lastUpdate && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

          {rooms.length === 0 ? (
            <div className="bg-surface-800/50 rounded-xl border border-white/5 p-12 text-center">
              <Phone size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">No active calls</p>
              <p className="text-sm text-slate-500 mt-1">
                Calls will appear here when they come in via telephony webhooks
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {rooms.map(room => (
                  <RoomCard 
                    key={room.room_id} 
                    room={room} 
                    onControl={handleControl}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* State Breakdown */}
          {stats?.calls_by_state && Object.keys(stats.calls_by_state).length > 0 && (
            <div className="bg-surface-800/50 rounded-xl border border-white/5 p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">By State</h3>
              <div className="space-y-2">
                {Object.entries(stats.calls_by_state).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', STATE_COLORS[state])} />
                      <span className="text-sm text-slate-300">{state}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worker Status */}
          <div className="bg-surface-800/50 rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Worker Load</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Avg Load</span>
                  <span className="text-white">{stats?.workers?.avg_load?.toFixed(1) || 0}%</span>
                </div>
                <div className="h-2 bg-surface-900 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      (stats?.workers?.avg_load || 0) > 80 ? 'bg-red-500' :
                      (stats?.workers?.avg_load || 0) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.workers?.avg_load || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uptime: {formatDuration(stats?.uptime_sec || 0)}</span>
                <span>{stats?.workers?.healthy || 0} healthy</span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-surface-800/50 rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} />
              Recent Alerts
            </h3>
            {stats?.alerts && stats.alerts.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stats.alerts.map((alert, i) => (
                  <AlertItem key={i} alert={alert} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent alerts</p>
            )}
          </div>

          {/* Today's Summary */}
          <div className="bg-surface-800/50 rounded-xl border border-white/5 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-surface-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats?.today?.calls_completed || 0}</p>
                <p className="text-xs text-slate-500">Calls</p>
              </div>
              <div className="text-center p-3 bg-surface-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{stats?.today?.total_turns || 0}</p>
                <p className="text-xs text-slate-500">Turns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
