/**
 * LAALI Page - Data Source Connection & Chat
 * 
 * Connect to Trino databases, profile schemas, and query with natural language.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Send,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  User,
  Clock,
  TableProperties,
  Search,
  Server,
  X,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '../lib';
import {
  laaliHealth,
  laaliListTenants,
  laaliConnect,
  laaliReconnect,
  laaliQuery,
  laaliDeleteTenant,
  laaliClearCache,
  setCurrentTenant,
  getCurrentTenantId,
  type LaaliTenant,
  type LaaliQueryResult,
} from '../api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    method?: string;
    template?: string;
    sql?: string;
    latency_ms?: number;
    rows?: number;
    cached?: boolean;
  };
}

interface DataSource {
  tenant_id: string;
  name: string;
  db_type: string;
  host: string;
  port: number;
  user: string;
  catalog_schema: string;
  status: LaaliTenant | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function LaaliPage() {
  // State
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeSource, setActiveSource] = useState<DataSource | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check health on mount
  useEffect(() => {
    checkHealth();
    loadDataSources();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when source selected
  useEffect(() => {
    if (activeSource?.status?.connected) {
      inputRef.current?.focus();
    }
  }, [activeSource]);

  // ─────────────────────────────────────────────────────────────────────────
  // API Functions
  // ─────────────────────────────────────────────────────────────────────────

  async function checkHealth() {
    try {
      const res = await laaliHealth();
      setHealthy(res.status === 'ok');
    } catch {
      setHealthy(false);
    }
  }

  async function loadDataSources() {
    try {
      const res = await laaliListTenants();
      const sources: DataSource[] = res.tenants.map((t) => ({
        tenant_id: t.tenant_id,
        name: t.tenant_id,
        db_type: 'trino',
        host: '',
        port: 8080,
        user: 'admin',
        catalog_schema: '',
        status: t,
      }));
      setDataSources(sources);
      
      // Select first connected source and set it as current tenant
      const connected = sources.find(s => s.status?.profiled);
      if (connected && !activeSource) {
        await setCurrentTenant(connected.tenant_id);
        setActiveSource(connected);
      }
    } catch (err) {
      // laaliListTenants requires admin — guests can't list all tenants.
      // This is OK; they can still add/query their own data sources.
      console.log('Could not list tenants (admin-only):', err);
    }
  }

  async function handleConnect(source: DataSource) {
    setConnecting(true);
    try {
      // Set the current tenant before connecting (token will be scoped to this tenant)
      await setCurrentTenant(source.tenant_id);
      
      const res = await laaliConnect(
        source.db_type,
        source.host,
        source.port,
        source.user,
        source.catalog_schema
      );
      
      if (res.success) {
        // Update source status
        const updated = { ...source, status: res.status };
        setDataSources(prev => 
          prev.map(s => s.tenant_id === source.tenant_id ? updated : s)
        );
        setActiveSource(updated);
        setShowAddModal(false);
        
        // Add welcome message
        setMessages([{
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `✅ Connected to **${source.catalog_schema}**!\n\nI found ${res.status.tables} tables with entities: ${res.status.entities.join(', ')}.\n\nTry asking:\n• "How many customers?"\n• "Show top 10 orders"\n• "Count products by category"`,
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      console.error('Connection failed:', err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setConnecting(false);
    }
  }

  async function handleReconnect(source: DataSource) {
    setConnecting(true);
    try {
      // Ensure we have a token for this tenant
      await setCurrentTenant(source.tenant_id);
      
      const res = await laaliReconnect(
        source.db_type,
        source.host,
        source.port,
        source.user,
        source.catalog_schema
      );
      
      if (res.success) {
        const updated = { ...source, status: res.status };
        setDataSources(prev => 
          prev.map(s => s.tenant_id === source.tenant_id ? updated : s)
        );
        setActiveSource(updated);
      }
    } catch (err) {
      console.error('Reconnection failed:', err);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDelete(source: DataSource) {
    if (!confirm(`Delete data source "${source.tenant_id}"? This will remove all cached data.`)) {
      return;
    }
    
    try {
      await laaliDeleteTenant(source.tenant_id);
      setDataSources(prev => prev.filter(s => s.tenant_id !== source.tenant_id));
      if (activeSource?.tenant_id === source.tenant_id) {
        setActiveSource(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleClearCache(source: DataSource) {
    try {
      await laaliClearCache(source.tenant_id);
      // Refresh status
      loadDataSources();
    } catch (err) {
      console.error('Clear cache failed:', err);
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeSource || loading) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Ensure we have a token for the active tenant
      if (getCurrentTenantId() !== activeSource.tenant_id) {
        await setCurrentTenant(activeSource.tenant_id);
      }
      
      const res = await laaliQuery(userMessage.content);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer || 'No response',
        timestamp: new Date(),
        metadata: {
          method: res.method,
          template: res.template,
          sql: res.sql,
          latency_ms: res.latency_ms,
          rows: res.rows,
          cached: res.cached,
        },
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Check if needs reconnect
      if (res.needs_reconnect) {
        setActiveSource(prev => prev ? { ...prev, status: { ...prev.status!, connected: false } } : null);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSql(text);
    setTimeout(() => setCopiedSql(null), 2000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar - Data Sources */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <div className="glass-panel p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Data Sources</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-4 text-xs">
            {healthy === null ? (
              <Loader2 className="w-3 h-3 animate-spin text-surface-400" />
            ) : healthy ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-400" />
            )}
            <span className={cn(
              healthy === null ? 'text-surface-400' : healthy ? 'text-green-400' : 'text-red-400'
            )}>
              {healthy === null ? 'Checking...' : healthy ? 'LAALI Online' : 'LAALI Offline'}
            </span>
          </div>

          {/* Source List */}
          <div className="flex-1 space-y-2 overflow-auto">
            {dataSources.length === 0 ? (
              <div className="text-center py-8 text-surface-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No data sources</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-primary text-sm hover:underline"
                >
                  Add your first source
                </button>
              </div>
            ) : (
              dataSources.map((source) => (
                <div
                  key={source.tenant_id}
                  onClick={() => setActiveSource(source)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all group',
                    activeSource?.tenant_id === source.tenant_id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-surface-800/50 hover:bg-surface-800 border border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Database className={cn(
                        'w-4 h-4',
                        source.status?.connected ? 'text-green-400' : 'text-surface-400'
                      )} />
                      <span className="text-sm font-medium text-surface-100">
                        {source.tenant_id}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(source); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {source.status && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-700 text-surface-300">
                        {source.status.tables} tables
                      </span>
                      {source.status.entities.slice(0, 3).map(e => (
                        <span key={e} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSource ? (
          <>
            {/* Chat Header */}
            <div className="glass-panel p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    activeSource.status?.connected
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-surface-700 text-surface-400'
                  )}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-surface-100">
                      {activeSource.tenant_id}
                    </h2>
                    <p className="text-sm text-surface-400">
                      {activeSource.status?.tables || 0} tables • {activeSource.status?.templates || 0} templates
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!activeSource.status?.connected && (
                    <button
                      onClick={() => handleReconnect(activeSource)}
                      disabled={connecting}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors disabled:opacity-50"
                    >
                      {connecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Reconnect
                    </button>
                  )}
                  <button
                    onClick={() => handleClearCache(activeSource)}
                    className="p-2 rounded-lg hover:bg-surface-700 text-surface-400 transition-colors"
                    title="Clear Cache"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Entities */}
              {activeSource.status?.entities && activeSource.status.entities.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-surface-400">Entities:</span>
                  {activeSource.status.entities.map(entity => (
                    <span
                      key={entity}
                      className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 glass-panel p-4 overflow-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-surface-400">
                  <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-surface-200 mb-2">Ask anything about your data</h3>
                  <p className="text-sm text-center max-w-md">
                    LAALI uses AI to understand your questions and query your database automatically.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {['How many customers?', 'Show top 10 orders', 'Count products', 'Recent transactions'].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        className="px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm text-surface-300 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={cn(
                        'max-w-[70%] rounded-lg px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-surface-800'
                      )}>
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content.split('**').map((part, i) => 
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                          )}
                        </div>
                        
                        {/* Metadata */}
                        {msg.metadata && (
                          <div className="mt-2 pt-2 border-t border-surface-700 space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-surface-400">
                              {msg.metadata.method === 'template' && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                                  <Zap className="w-3 h-3" /> Template
                                </span>
                              )}
                              {msg.metadata.method === 'llm' && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                  <Sparkles className="w-3 h-3" /> LLM
                                </span>
                              )}
                              {msg.metadata.cached && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                  <Clock className="w-3 h-3" /> Cached
                                </span>
                              )}
                              {msg.metadata.latency_ms !== undefined && (
                                <span className="text-surface-500">
                                  {msg.metadata.latency_ms.toFixed(0)}ms
                                </span>
                              )}
                              {msg.metadata.rows !== undefined && (
                                <span className="text-surface-500">
                                  {msg.metadata.rows} rows
                                </span>
                              )}
                            </div>
                            
                            {/* SQL */}
                            {msg.metadata.sql && (
                              <div className="mt-2 relative">
                                <pre className="text-[10px] p-2 rounded bg-surface-900 overflow-x-auto text-surface-300">
                                  {msg.metadata.sql}
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(msg.metadata!.sql!)}
                                  className="absolute top-1 right-1 p-1 rounded bg-surface-800 hover:bg-surface-700 transition-colors"
                                >
                                  {copiedSql === msg.metadata.sql ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-surface-400" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-surface-300" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-surface-800 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-surface-400">
                          <span>Thinking</span>
                          <span className="animate-pulse">...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mt-4">
              <div className="glass-panel p-3 flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={
                    activeSource.status?.connected
                      ? "Ask about your data..."
                      : "Connect to start querying..."
                  }
                  disabled={!activeSource.status?.connected || loading}
                  className="flex-1 bg-transparent border-none outline-none text-surface-100 placeholder:text-surface-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !activeSource.status?.connected || loading}
                  className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Source Selected */
          <div className="flex-1 glass-panel flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-surface-100 mb-2">Connect a Data Source</h2>
              <p className="text-surface-400 mb-6 max-w-md">
                Connect to a Trino database to start querying your data with natural language.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Data Source
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Data Source Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddDataSourceModal
            onClose={() => setShowAddModal(false)}
            onConnect={handleConnect}
            connecting={connecting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADD DATA SOURCE MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface AddDataSourceModalProps {
  onClose: () => void;
  onConnect: (source: DataSource) => void;
  connecting: boolean;
}

function AddDataSourceModal({ onClose, onConnect, connecting }: AddDataSourceModalProps) {
  const [form, setForm] = useState({
    tenant_id: '',
    db_type: 'trino',
    host: '',
    port: 8080,
    user: 'admin',
    catalog_schema: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.tenant_id || !form.host || !form.catalog_schema) {
      return;
    }
    
    onConnect({
      ...form,
      name: form.tenant_id,
      status: null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-800 rounded-xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-100">Add Data Source</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-700 text-surface-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-surface-300 mb-1">Name</label>
            <input
              type="text"
              value={form.tenant_id}
              onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
              placeholder="my_database"
              className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-surface-100 placeholder:text-surface-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          {/* Host */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm text-surface-300 mb-1">Host</label>
              <input
                type="text"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="localhost"
                className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-surface-100 placeholder:text-surface-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-surface-300 mb-1">Port</label>
              <input
                type="number"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 8080 })}
                className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-surface-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* User */}
          <div>
            <label className="block text-sm text-surface-300 mb-1">User</label>
            <input
              type="text"
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              placeholder="admin"
              className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-surface-100 placeholder:text-surface-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Catalog/Schema */}
          <div>
            <label className="block text-sm text-surface-300 mb-1">Catalog.Schema</label>
            <input
              type="text"
              value={form.catalog_schema}
              onChange={(e) => setForm({ ...form, catalog_schema: e.target.value })}
              placeholder="iceberg.my_schema"
              className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-700 text-surface-100 placeholder:text-surface-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
            <p className="text-xs text-surface-500 mt-1">Format: catalog.schema (e.g., iceberg.mills_customer)</p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-surface-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={connecting || !form.tenant_id || !form.host || !form.catalog_schema}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Server className="w-4 h-4" />
                  Connect
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default LaaliPage;
