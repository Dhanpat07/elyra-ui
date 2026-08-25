import { cn } from '../lib'
import type { RAGRoute } from '../store'

const routeConfig: Record<RAGRoute, { label: string; color: string }> = {
  bm25:     { label: '⚡ BM25',     color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  fuzzy:    { label: '🔤 Fuzzy',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  semantic: { label: '🧠 Semantic', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  live:     { label: '🔄 Live SQL', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  error:    { label: '❌ Error',    color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  none:     { label: '—',           color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
}

export function RouteBadge({ route }: { route: RAGRoute }) {
  const cfg = routeConfig[route] ?? routeConfig.none
  return (
    <span className={cn('badge border text-xs', cfg.color)}>{cfg.label}</span>
  )
}
