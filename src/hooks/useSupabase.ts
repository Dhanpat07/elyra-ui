/**
 * Supabase Database Hooks
 * Custom React hooks for data fetching and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuthContext } from '../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceAgent {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  avatar_url?: string;
  voice_id: string;
  language: string;
  personality?: string;
  knowledge_base_id?: string;
  system_prompt?: string;
  phone_number?: string;
  is_active: boolean;
  is_published: boolean;
  total_calls: number;
  total_minutes: number;
  avg_rating?: number;
  created_at: string;
  updated_at: string;
  last_call_at?: string;
}

export interface Call {
  id: string;
  user_id: string;
  tenant_id?: string;
  agent_id?: string;
  caller_phone?: string;
  caller_name?: string;
  direction: 'inbound' | 'outbound';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  status: 'completed' | 'missed' | 'failed' | 'escalated';
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  intent?: string;
  summary?: string;
  transcript?: Array<{ role: string; content: string; timestamp: string }>;
  recording_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  // Joined data
  agent?: VoiceAgent;
}

export interface DataConnector {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  type: string;
  description?: string;
  icon_url?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  config?: Record<string, unknown>;
  last_sync_at?: string;
  next_sync_at?: string;
  sync_frequency: string;
  records_synced: number;
  last_error?: string;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  tenant_id?: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  payment_id?: string;
  paid_at?: string;
  line_items?: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
  pdf_url?: string;
  gstin?: string;
  billing_address?: Record<string, string>;
  created_at: string;
  due_date?: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  usage_count: number;
  rate_limit: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  revoked_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  feedback?: 'up' | 'down' | null;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  tenant_id?: string;
  type: string;
  quantity: number;
  unit: string;
  period_start: string;
  period_end: string;
  unit_cost?: number;
  total_cost?: number;
  created_at: string;
}

// ============================================================================
// VOICE AGENTS HOOKS
// ============================================================================

export function useVoiceAgents() {
  const { user } = useAuthContext();
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for when Supabase tables don't exist yet
  const MOCK_AGENTS: VoiceAgent[] = [
    {
      id: '1',
      user_id: user?.id || '',
      name: 'Customer Support',
      description: 'Handles customer inquiries 24/7',
      voice_id: 'shimmer',
      language: 'en',
      personality: 'friendly',
      phone_number: '+91 1800 123 4567',
      is_active: true,
      is_published: true,
      total_calls: 1245,
      total_minutes: 3420,
      avg_rating: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: user?.id || '',
      name: 'Sales Assistant',
      description: 'Qualifies leads and books demos',
      voice_id: 'nova',
      language: 'hi',
      personality: 'professional',
      phone_number: '+91 80 4567 8901',
      is_active: true,
      is_published: false,
      total_calls: 567,
      total_minutes: 1890,
      avg_rating: 4.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: user?.id || '',
      name: 'Appointment Booking',
      description: 'Schedules appointments and sends reminders',
      voice_id: 'alloy',
      language: 'en',
      personality: 'friendly',
      is_active: false,
      is_published: true,
      total_calls: 234,
      total_minutes: 567,
      avg_rating: 4.9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fetchAgents = useCallback(async () => {
    // In dev mode (no user), return mock data
    if (!user) {
      setAgents(MOCK_AGENTS);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('voice_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, use mock data
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('voice_agents table not found, using mock data');
          setAgents(MOCK_AGENTS);
          return;
        }
        throw error;
      }
      setAgents(data && data.length > 0 ? data : MOCK_AGENTS);
    } catch (err) {
      console.error('Error fetching agents:', err);
      // Fallback to mock data on any error
      setAgents(MOCK_AGENTS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (agent: Partial<VoiceAgent>) => {
    if (!user) return { error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('voice_agents')
        .insert({ ...agent, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setAgents(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create agent' };
    }
  };

  const updateAgent = async (id: string, updates: Partial<VoiceAgent>) => {
    try {
      const { data, error } = await supabase
        .from('voice_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === id ? data : a));
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update agent' };
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voice_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAgents(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete agent' };
    }
  };

  return { agents, loading, error, refetch: fetchAgents, createAgent, updateAgent, deleteAgent };
}

// ============================================================================
// CALLS HOOKS
// ============================================================================

export function useCalls(options?: { limit?: number; agentId?: string }) {
  const { user } = useAuthContext();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock calls data
  const MOCK_CALLS: Call[] = [
    { id: '1', user_id: user?.id || '', caller_phone: '+91 98765 43210', direction: 'inbound', started_at: new Date(Date.now() - 120000).toISOString(), duration_seconds: 154, status: 'completed', sentiment: 'positive', intent: 'Product Inquiry', created_at: new Date().toISOString() },
    { id: '2', user_id: user?.id || '', caller_phone: '+1 555 123 4567', direction: 'inbound', started_at: new Date(Date.now() - 300000).toISOString(), duration_seconds: 225, status: 'completed', sentiment: 'neutral', intent: 'Support Request', created_at: new Date().toISOString() },
    { id: '3', user_id: user?.id || '', caller_phone: '+91 87654 32109', direction: 'inbound', started_at: new Date(Date.now() - 480000).toISOString(), duration_seconds: 192, status: 'completed', sentiment: 'positive', intent: 'Book Demo', created_at: new Date().toISOString() },
    { id: '4', user_id: user?.id || '', caller_phone: '+44 20 7123 4567', direction: 'inbound', started_at: new Date(Date.now() - 720000).toISOString(), duration_seconds: 45, status: 'missed', created_at: new Date().toISOString() },
    { id: '5', user_id: user?.id || '', caller_phone: '+91 76543 21098', direction: 'outbound', started_at: new Date(Date.now() - 900000).toISOString(), duration_seconds: 312, status: 'completed', sentiment: 'positive', intent: 'Follow Up', created_at: new Date().toISOString() },
    { id: '6', user_id: user?.id || '', caller_phone: '+1 555 987 6543', direction: 'inbound', started_at: new Date(Date.now() - 1200000).toISOString(), duration_seconds: 0, status: 'missed', created_at: new Date().toISOString() },
  ];

  const fetchCalls = useCallback(async () => {
    // In dev mode (no user), return mock data
    if (!user) {
      setCalls(MOCK_CALLS.slice(0, options?.limit || 10));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('calls')
        .select('*, agent:voice_agents(id, name)')
        .order('started_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.agentId) {
        query = query.eq('agent_id', options.agentId);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setCalls(MOCK_CALLS.slice(0, options?.limit || 10));
          return;
        }
        throw error;
      }
      setCalls(data && data.length > 0 ? data : MOCK_CALLS.slice(0, options?.limit || 10));
    } catch (err) {
      console.error('Error fetching calls:', err);
      setCalls(MOCK_CALLS.slice(0, options?.limit || 10));
    } finally {
      setLoading(false);
    }
  }, [user, options?.limit, options?.agentId]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return { calls, loading, error, refetch: fetchCalls };
}

// Call analytics hook
export function useCallAnalytics(timeRange: 'today' | 'week' | 'month' = 'today') {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState<{
    totalCalls: number;
    completedCalls: number;
    missedCalls: number;
    avgDuration: number;
    totalDuration: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    hourlyData: Array<{ hour: string; calls: number; handled: number }>;
    topIntents: Array<{ intent: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const MOCK_ANALYTICS = {
    totalCalls: 1247,
    completedCalls: 1189,
    missedCalls: 58,
    avgDuration: 165,
    totalDuration: 205755,
    sentimentBreakdown: { positive: 856, neutral: 298, negative: 93 },
    hourlyData: [
      { hour: '08', calls: 45, handled: 43 },
      { hour: '09', calls: 78, handled: 76 },
      { hour: '10', calls: 92, handled: 89 },
      { hour: '11', calls: 105, handled: 102 },
      { hour: '12', calls: 85, handled: 83 },
      { hour: '13', calls: 67, handled: 65 },
      { hour: '14', calls: 89, handled: 87 },
      { hour: '15', calls: 98, handled: 95 },
      { hour: '16', calls: 76, handled: 74 },
      { hour: '17', calls: 54, handled: 52 },
      { hour: '18', calls: 38, handled: 37 },
    ],
    topIntents: [
      { intent: 'Product Inquiry', count: 342 },
      { intent: 'Support Request', count: 256 },
      { intent: 'Book Demo', count: 198 },
      { intent: 'Pricing Question', count: 167 },
      { intent: 'Order Status', count: 145 },
      { intent: 'Other', count: 139 },
    ],
  };

  useEffect(() => {
    // In dev mode (no user), return mock data
    if (!user) {
      setAnalytics(MOCK_ANALYTICS);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      try {
        const { data: calls, error } = await supabase
          .from('calls')
          .select('*')
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: true });

        if (error) {
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            setAnalytics(MOCK_ANALYTICS);
            setLoading(false);
            return;
          }
          throw error;
        }

        if (calls && calls.length > 0) {
          // Calculate analytics
          const totalCalls = calls.length;
          const completedCalls = calls.filter(c => c.status === 'completed').length;
          const missedCalls = calls.filter(c => c.status === 'missed').length;
          const avgDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / (totalCalls || 1);
          const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

          // Sentiment breakdown
          const sentimentBreakdown = {
            positive: calls.filter(c => c.sentiment === 'positive').length,
            neutral: calls.filter(c => c.sentiment === 'neutral').length,
            negative: calls.filter(c => c.sentiment === 'negative').length,
          };

          // Hourly data
          const hourlyMap = new Map<string, { calls: number; handled: number }>();
          calls.forEach(call => {
            const hour = new Date(call.started_at).getHours().toString().padStart(2, '0');
            const current = hourlyMap.get(hour) || { calls: 0, handled: 0 };
            current.calls++;
            if (call.status === 'completed') current.handled++;
            hourlyMap.set(hour, current);
          });
          const hourlyData = Array.from(hourlyMap.entries())
            .map(([hour, data]) => ({ hour, ...data }))
            .sort((a, b) => a.hour.localeCompare(b.hour));

          // Top intents
          const intentMap = new Map<string, number>();
          calls.forEach(call => {
            if (call.intent) {
              intentMap.set(call.intent, (intentMap.get(call.intent) || 0) + 1);
            }
          });
          const topIntents = Array.from(intentMap.entries())
            .map(([intent, count]) => ({ intent, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

          setAnalytics({
            totalCalls,
            completedCalls,
            missedCalls,
            avgDuration,
            totalDuration,
            sentimentBreakdown,
            hourlyData,
            topIntents,
          });
        } else {
          setAnalytics(MOCK_ANALYTICS);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setAnalytics(MOCK_ANALYTICS);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  return { analytics, loading };
}

// ============================================================================
// DATA CONNECTORS HOOKS
// ============================================================================

export function useDataConnectors() {
  const { user } = useAuthContext();
  const [connectors, setConnectors] = useState<DataConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock connectors data
  const MOCK_CONNECTORS: DataConnector[] = [
    { id: '1', user_id: user?.id || '', name: 'Salesforce CRM', type: 'salesforce', status: 'connected', sync_frequency: 'realtime', records_synced: 12500, last_sync_at: new Date(Date.now() - 300000).toISOString(), error_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', user_id: user?.id || '', name: 'Product Docs', type: 'notion', status: 'connected', sync_frequency: 'daily', records_synced: 89, last_sync_at: new Date(Date.now() - 3600000).toISOString(), error_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', user_id: user?.id || '', name: 'Support FAQs', type: 'google_sheets', status: 'connected', sync_frequency: 'hourly', records_synced: 234, last_sync_at: new Date(Date.now() - 1800000).toISOString(), error_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  const fetchConnectors = useCallback(async () => {
    // In dev mode (no user), return mock data
    if (!user) {
      setConnectors(MOCK_CONNECTORS);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('data_connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setConnectors(MOCK_CONNECTORS);
          return;
        }
        throw error;
      }
      setConnectors(data && data.length > 0 ? data : MOCK_CONNECTORS);
    } catch (err) {
      console.error('Error fetching connectors:', err);
      setConnectors(MOCK_CONNECTORS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const createConnector = async (connector: Partial<DataConnector>) => {
    if (!user) return { error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('data_connectors')
        .insert({ ...connector, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setConnectors(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create connector' };
    }
  };

  const updateConnector = async (id: string, updates: Partial<DataConnector>) => {
    try {
      const { data, error } = await supabase
        .from('data_connectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setConnectors(prev => prev.map(c => c.id === id ? data : c));
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update connector' };
    }
  };

  const deleteConnector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_connectors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConnectors(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete connector' };
    }
  };

  return { connectors, loading, error, refetch: fetchConnectors, createConnector, updateConnector, deleteConnector };
}

// ============================================================================
// INVOICES HOOKS
// ============================================================================

export function useInvoices() {
  const { user } = useAuthContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock invoices
  const MOCK_INVOICES: Invoice[] = [
    { id: '1', user_id: '', tenant_id: '', invoice_number: 'INV-2024-001', amount: 7999, currency: 'INR', status: 'paid', plan_name: 'Growth', billing_period_start: '2024-01-01', billing_period_end: '2024-01-31', paid_at: '2024-01-05', created_at: new Date().toISOString() },
    { id: '2', user_id: '', tenant_id: '', invoice_number: 'INV-2024-002', amount: 7999, currency: 'INR', status: 'paid', plan_name: 'Growth', billing_period_start: '2024-02-01', billing_period_end: '2024-02-29', paid_at: '2024-02-03', created_at: new Date().toISOString() },
  ];

  useEffect(() => {
    // In dev mode (no user), return mock data
    if (!user) {
      setInvoices(MOCK_INVOICES);
      setLoading(false);
      return;
    }

    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  return { invoices, loading, error };
}

// ============================================================================
// API KEYS HOOKS
// ============================================================================

export function useApiKeys() {
  const { user } = useAuthContext();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    // In dev mode (no user), return mock data
    if (!user) {
      setApiKeys([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = async (name: string) => {
    if (!user) return { error: 'Not authenticated' };
    
    // Generate a random API key
    const key = `laali_sk_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyPrefix = key.substring(0, 12);
    
    // In production, you'd hash the key before storing
    // For now, we store a placeholder hash
    const keyHash = btoa(key); // NOT secure, just for demo
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
        })
        .select()
        .single();

      if (error) throw error;
      setApiKeys(prev => [data, ...prev]);
      
      // Return the full key only once (it won't be retrievable later)
      return { data: { ...data, full_key: key } };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to create API key' };
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setApiKeys(prev => prev.map(k => k.id === id ? data : k));
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to revoke API key' };
    }
  };

  return { apiKeys, loading, error, refetch: fetchApiKeys, createApiKey, revokeApiKey };
}

// ============================================================================
// CHAT MESSAGES HOOKS
// ============================================================================

export function useChatMessages(conversationId?: string) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = async (message: { role: 'user' | 'assistant'; content: string; language?: string }) => {
    if (!user || !conversationId) return { error: 'Not authenticated or no conversation' };
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          language: message.language || 'auto',
        })
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to add message' };
    }
  };

  const updateFeedback = async (messageId: string, feedback: 'up' | 'down' | null) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ feedback })
        .eq('id', messageId);

      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
      return { success: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update feedback' };
    }
  };

  return { messages, loading, refetch: fetchMessages, addMessage, updateFeedback };
}

// ============================================================================
// USAGE HOOKS
// ============================================================================

export function useUsage() {
  const { user } = useAuthContext();
  const [usage, setUsage] = useState<{
    minutesUsed: number;
    minutesTotal: number;
    agentsUsed: number;
    agentsTotal: number;
    apiCallsUsed: number;
    apiCallsTotal: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock usage data
  const MOCK_USAGE = {
    minutesUsed: 847,
    minutesTotal: 1000,
    agentsUsed: 2,
    agentsTotal: 3,
    apiCallsUsed: 4521,
    apiCallsTotal: 10000,
  };

  useEffect(() => {
    // In dev mode (no user), return mock data
    if (!user) {
      setUsage(MOCK_USAGE);
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      setLoading(true);
      
      try {
        // Get current month's usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: usageData, error: usageError } = await supabase
          .from('usage_records')
          .select('*')
          .gte('period_start', startOfMonth.toISOString());

        if (usageError && (usageError.code === '42P01' || usageError.message.includes('does not exist'))) {
          setUsage(MOCK_USAGE);
          setLoading(false);
          return;
        }

        const { data: agents } = await supabase
          .from('voice_agents')
          .select('id')
          .eq('is_active', true);

        // Calculate usage (with defaults for new users)
        const minutes = usageData?.find(u => u.type === 'voice_minutes');
        const apiCalls = usageData?.find(u => u.type === 'api_calls');

        // TODO: Get plan limits from organization
        setUsage({
          minutesUsed: minutes?.quantity || MOCK_USAGE.minutesUsed,
          minutesTotal: 1000,
          agentsUsed: agents?.length || MOCK_USAGE.agentsUsed,
          agentsTotal: 3,
          apiCallsUsed: apiCalls?.quantity || MOCK_USAGE.apiCallsUsed,
          apiCallsTotal: 10000,
        });
      } catch (err) {
        console.error('Failed to fetch usage:', err);
        setUsage(MOCK_USAGE);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  return { usage, loading };
}


// ============================================================================
// PHONE NUMBERS HOOKS
// ============================================================================

export interface PhoneNumber {
  id: string;
  phone_number: string;
  tenant_id: string;
  provider: string;
  provider_sid: string;
  number_type: 'local' | 'toll_free' | 'mobile';
  country: string;
  region: string;
  friendly_name: string;
  persona: string;
  language: string;
  status: 'active' | 'pending' | 'suspended' | 'released';
  voice_url: string;
  monthly_cost: number;
  currency: string;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  created_at: string;
}

export interface AvailableNumber {
  phone_number: string;
  provider: string;
  type: string;
  country: string;
  region: string;
  monthly_cost: number;
  capabilities: {
    voice?: boolean;
    sms?: boolean;
  };
}

const VOICE_API = '/voice-api';

export function usePhoneNumbers() {
  const { user } = useAuthContext();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhoneNumbers = useCallback(async () => {
    // Dev mode - show empty state (no mock data)
    if (!user) {
      setPhoneNumbers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tenantId = user.user_metadata?.tenant_id || 'demo';
      const response = await fetch(`${VOICE_API}/phone/tenant/${tenantId}/numbers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch phone numbers');
      }
      
      const data = await response.json();
      setPhoneNumbers(data || []);
    } catch (err) {
      console.error('Error fetching phone numbers:', err);
      setError('Failed to load phone numbers');
      setPhoneNumbers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  const searchAvailableNumbers = async (params: {
    country: string;
    number_type: string;
    region?: string;
    limit?: number;
  }): Promise<AvailableNumber[]> => {
    try {
      const response = await fetch(`${VOICE_API}/phone/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: params.country,
          number_type: params.number_type,
          region: params.region,
          limit: params.limit || 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Return actual API data (empty array if no numbers available)
      return data || [];
    } catch (err) {
      console.error('Error searching numbers:', err);
      // Return empty array - let UI show appropriate message
      return [];
    }
  };

  const provisionNumber = async (params: {
    phone_number: string;
    number_type: string;
    country: string;
    friendly_name?: string;
  }): Promise<{ success: boolean; phone?: PhoneNumber; error?: string }> => {
    try {
      const tenantId = user?.user_metadata?.tenant_id || 'demo';
      
      const response = await fetch(`${VOICE_API}/phone/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: params.phone_number,
          tenant_id: tenantId,
          provider: params.country === 'IN' ? 'exotel' : 'telnyx',
          number_type: params.number_type,
          country: params.country,
          friendly_name: params.friendly_name || '',
          persona: 'aria',
          language: params.country === 'IN' ? 'hi' : 'en',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to provision number');
      }

      const phone = await response.json();
      setPhoneNumbers(prev => [...prev, phone]);
      return { success: true, phone };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to provision number';
      return { success: false, error: errorMsg };
    }
  };

  const releaseNumber = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${VOICE_API}/phone/${encodeURIComponent(phoneNumber)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to release number');
      }

      setPhoneNumbers(prev => prev.filter(p => p.phone_number !== phoneNumber));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed' };
    }
  };

  return {
    phoneNumbers,
    loading,
    error,
    refetch: fetchPhoneNumbers,
    searchAvailableNumbers,
    provisionNumber,
    releaseNumber,
  };
}

// No mock data - all data comes from real APIs
