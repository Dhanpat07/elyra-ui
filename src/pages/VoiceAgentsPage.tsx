import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Phone,
  TrendingUp,
  Mic,
  Globe,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib';
import { useStore } from '../store';
import { useVoiceAgents } from '../hooks/useSupabase';
import type { VoiceAgent } from '../hooks/useSupabase';

const PERSONALITY_INFO: Record<string, { emoji: string; label: string }> = {
  friendly: { emoji: '😊', label: 'Friendly' },
  professional: { emoji: '👔', label: 'Professional' },
  expert: { emoji: '🎓', label: 'Expert' },
  casual: { emoji: '✌️', label: 'Casual' },
};

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  hi: '🇮🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ta: '🇮🇳',
  te: '🇮🇳',
};

export function VoiceAgentsPage() {
  const { setActivePage } = useStore();
  const { agents, loading, error, updateAgent, deleteAgent: removeAgent } = useVoiceAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAgents = agents.filter(a => a.is_active).length;
  const totalCalls = agents.reduce((sum, a) => sum + (a.total_calls || 0), 0);

  const toggleAgentStatus = async (agent: VoiceAgent) => {
    await updateAgent(agent.id, { is_active: !agent.is_active });
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      await removeAgent(agentId);
    }
    setActiveDropdown(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load agents</h3>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Voice Agents</h2>
          <p className="text-slate-500 mt-1">
            {activeAgents} active agents • {totalCalls.toLocaleString()} total calls
          </p>
        </div>
        <button
          onClick={() => setActivePage('onboarding')}
          className="px-4 py-2.5 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Create Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.05] text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
        />
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-2xl border border-white/[0.05] p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-gold-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create your first voice agent to start handling calls automatically.
          </p>
          <button
            onClick={() => setActivePage('onboarding')}
            className="px-6 py-3 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create Your First Agent
          </button>
        </motion.div>
      )}

      {/* Agents Grid */}
      {filteredAgents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((agent, index) => {
              const personality = PERSONALITY_INFO[agent.personality || 'friendly'] || PERSONALITY_INFO.friendly;
              const languageFlag = LANGUAGE_FLAGS[agent.language] || '🌐';
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5 hover:border-white/[0.1] transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                        agent.is_active 
                          ? "bg-gradient-to-br from-gold-500/20 to-amber-500/10" 
                          : "bg-surface-700"
                      )}>
                        {personality.emoji}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            agent.is_active 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : agent.is_published 
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-slate-500/20 text-slate-400"
                          )}>
                            {agent.is_active ? 'Active' : agent.is_published ? 'Paused' : 'Draft'}
                          </span>
                          <span className="text-sm">{languageFlag}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === agent.id ? null : agent.id)}
                        className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === agent.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-surface-700 rounded-xl border border-white/[0.1] shadow-xl z-10 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setActivePage('voice');
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] flex items-center gap-2"
                            >
                              <Mic size={14} />
                              Test Voice
                            </button>
                            <button
                              onClick={() => setActiveDropdown(null)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] flex items-center gap-2"
                            >
                              <Edit size={14} />
                              Edit Agent
                            </button>
                            <button
                              onClick={() => setActiveDropdown(null)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.05] flex items-center gap-2"
                            >
                              <Copy size={14} />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-surface-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-semibold text-white">
                        {agent.total_calls?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-slate-500">Total Calls</div>
                    </div>
                    <div className="bg-surface-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-semibold text-white">
                        {Math.round(agent.total_minutes || 0)}m
                      </div>
                      <div className="text-xs text-slate-500">Minutes</div>
                    </div>
                    <div className="bg-surface-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-semibold text-white">
                        {agent.avg_rating ? `${agent.avg_rating.toFixed(1)}★` : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="mb-4">
                    {agent.phone_number ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gold-500/5 border border-gold-500/20">
                        <Phone size={14} className="text-gold-400" />
                        <span className="text-sm font-mono text-white">{agent.phone_number}</span>
                        <CheckCircle2 size={12} className="text-emerald-400 ml-auto" />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActivePage('phones')}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-surface-700/50 border border-dashed border-slate-600 text-slate-400 hover:border-gold-500/50 hover:text-gold-400 transition-all text-sm"
                      >
                        <Phone size={14} />
                        Assign Phone Number
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAgentStatus(agent)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all",
                        agent.is_active
                          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      {agent.is_active ? (
                        <>
                          <Pause size={16} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setActivePage('analytics')}
                      className="flex-1 py-2.5 rounded-xl bg-surface-700 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-surface-600 transition-all"
                    >
                      <TrendingUp size={16} />
                      Analytics
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* No results */}
      {agents.length > 0 && filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No agents found</h3>
          <p className="text-slate-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
