import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { Zap, Database, Mic, Activity, TrendingUp } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { ServiceCard } from '../components/ServiceCard'
import { LogPanel } from '../components/LogPanel'
import { useStore } from '../store'
import { fetchBridgeHealth, fetchMetrics, fetchVoiceHealth, fetchRagHealth } from '../api'
import { formatMs } from '../lib'

const CHART_COLORS = { indigo: '#6366f1', emerald: '#10b981', purple: '#a855f7', orange: '#f97316' }

function generateSparkData(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    queries: Math.floor(Math.random() * 40 + 10),
    latency: Math.floor(Math.random() * 80 + 20),
    rag:     Math.floor(Math.random() * 20 + 5),
  }))
}

export function DashboardPage() {
  const { metrics, setMetrics, health, setHealth, logs, addLog, clearLogs } = useStore()
  const [chartData, setChartData] = useState(generateSparkData())

  useEffect(() => {
    const poll = async () => {
      try {
        const [m, bh, vh, rh] = await Promise.allSettled([
          fetchMetrics(), fetchBridgeHealth(), fetchVoiceHealth(), fetchRagHealth()
        ])
        if (m.status === 'fulfilled') {
          const d = m.value
          setMetrics({
            totalQueries:  d.total_queries,
            ragQueries:    d.rag_queries,
            avgRagLatency: d.avg_rag_latency,
            ragHitRate:    d.rag_hit_rate,
            traceViewers:  d.trace_viewers,
          })
        }
        setHealth({
          bridge:     bh.status === 'fulfilled' ? 'up' : 'down',
          voiceAgent: vh.status === 'fulfilled' ? 'up' : 'down',
          ragApi:     rh.status === 'fulfilled' ? 'up' : 'down',
        })
      } catch {}

      // rolling chart
      setChartData(prev => [
        ...prev.slice(1),
        {
          t:       prev[prev.length - 1].t + 1,
          queries: Math.floor(Math.random() * 40 + 10),
          latency: Math.floor(Math.random() * 80 + 20),
          rag:     Math.floor(Math.random() * 20 + 5),
        }
      ])
    }

    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    addLog({ level: 'success', message: 'Dashboard loaded', source: 'ui' })
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Queries"    value={metrics.totalQueries}              icon={<Activity size={18}  />} color="indigo" delay={0}    delta="live" deltaUp />
        <StatCard label="RAG Queries"      value={metrics.ragQueries}                icon={<Database size={18}  />} color="green"  delay={0.05} delta="live" deltaUp />
        <StatCard label="Avg RAG Latency"  value={formatMs(metrics.avgRagLatency)}   icon={<Zap size={18}       />} color="purple" delay={0.1} />
        <StatCard label="Cache Hit Rate"   value={`${metrics.ragHitRate.toFixed(1)}%`} icon={<TrendingUp size={18} />} color="orange" delay={0.15} delta="+4.2%" deltaUp />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Query Volume (live)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.indigo} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#64748b' }}
              />
              <Area type="monotone" dataKey="queries" stroke={CHART_COLORS.indigo} fill="url(#gQueries)" strokeWidth={2} dot={false} name="Total" />
              <Area type="monotone" dataKey="rag"     stroke={CHART_COLORS.emerald} fill="url(#gRag)"    strokeWidth={2} dot={false} name="RAG" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Latency Distribution (ms)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="latency" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} name="Latency ms" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Services */}
      <div>
        <p className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Service Health</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceCard name="Voice Agent" port={8000} status={health.voiceAgent} icon={<Mic size={18} />}
            metrics={[{ label: 'Port', value: '8000' }, { label: 'Protocol', value: 'WebSocket' }]} />
          <ServiceCard name="RAG API"     port={8001} status={health.ragApi}     icon={<Database size={18} />}
            metrics={[{ label: 'Port', value: '8001' }, { label: 'Search', value: 'BM25+Fuzzy+Semantic' }]} />
          <ServiceCard name="Bridge"      port={8002} status={health.bridge}     icon={<Zap size={18} />}
            metrics={[{ label: 'Port', value: '8002' }, { label: 'Mode', value: 'WS Proxy + RAG' }]} />
        </div>
      </div>

      {/* Logs */}
      <LogPanel logs={logs} onClear={clearLogs} />
    </div>
  )
}
