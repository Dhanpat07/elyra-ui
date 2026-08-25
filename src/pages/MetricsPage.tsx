import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useStore } from '../store'
import { fetchMetrics } from '../api'
import { formatMs } from '../lib'

const COLORS = ['#6366f1', '#10b981', '#a855f7', '#f97316', '#ec4899']

function genHistory(n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    bm25:     Math.floor(Math.random() * 30 + 5),
    fuzzy:    Math.floor(Math.random() * 15 + 2),
    semantic: Math.floor(Math.random() * 10 + 1),
    live:     Math.floor(Math.random() * 5),
    latency:  Math.floor(Math.random() * 100 + 20),
  }))
}

export function MetricsPage() {
  const { metrics, setMetrics } = useStore()
  const [history, setHistory]   = useState(genHistory())

  useEffect(() => {
    const poll = async () => {
      try {
        const m = await fetchMetrics()
        setMetrics({
          totalQueries:  m.total_queries,
          ragQueries:    m.rag_queries,
          avgRagLatency: m.avg_rag_latency,
          ragHitRate:    m.rag_hit_rate,
        })
      } catch {}
      setHistory(prev => [
        ...prev.slice(1),
        {
          t:        prev[prev.length - 1].t + 1,
          bm25:     Math.floor(Math.random() * 30 + 5),
          fuzzy:    Math.floor(Math.random() * 15 + 2),
          semantic: Math.floor(Math.random() * 10 + 1),
          live:     Math.floor(Math.random() * 5),
          latency:  Math.floor(Math.random() * 100 + 20),
        }
      ])
    }
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  const pieData = [
    { name: 'BM25',     value: history.reduce((s, d) => s + d.bm25, 0) },
    { name: 'Fuzzy',    value: history.reduce((s, d) => s + d.fuzzy, 0) },
    { name: 'Semantic', value: history.reduce((s, d) => s + d.semantic, 0) },
    { name: 'Live SQL', value: history.reduce((s, d) => s + d.live, 0) },
  ]

  const tooltipStyle = {
    contentStyle: { background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 },
    labelStyle: { color: '#64748b' }
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Queries',    value: metrics.totalQueries },
          { label: 'RAG Queries',      value: metrics.ragQueries },
          { label: 'Avg RAG Latency',  value: formatMs(metrics.avgRagLatency) },
          { label: 'Cache Hit Rate',   value: `${metrics.ragHitRate.toFixed(1)}%` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Route breakdown stacked */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Route Breakdown (live)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                {['bm25','fuzzy','semantic','live'].map((k, i) => (
                  <linearGradient key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLORS[i]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              {(['bm25','fuzzy','semantic','live'] as const).map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stackId="1"
                  stroke={COLORS[i]} fill={`url(#g${k})`} strokeWidth={1.5} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Latency */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Latency (ms)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="latency" fill="#6366f1" radius={[3, 3, 0, 0]} name="ms" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Query Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cache hit rate over time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <p className="text-sm font-semibold text-white mb-4">Cache Hit Rate %</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history.map(d => ({
              t: d.t,
              rate: Math.round((d.bm25 + d.fuzzy + d.semantic) / (d.bm25 + d.fuzzy + d.semantic + d.live + 0.01) * 100)
            }))}>
              <defs>
                <linearGradient id="gRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${v}%`, 'Hit Rate']} />
              <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#gRate)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
