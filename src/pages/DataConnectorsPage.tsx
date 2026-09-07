import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Database,
  Globe,
  FileSpreadsheet,
  Cloud,
  Webhook,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Search,
  Link,
  Clock,
} from 'lucide-react';
import { cn } from '../lib';
import { useDataConnectors } from '../hooks/useSupabase';
import type { DataConnector } from '../hooks/useSupabase';

// Connector type definitions
interface ConnectorType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

// Connector categories
const CATEGORIES = [
  { id: 'all', name: 'All', icon: Globe },
  { id: 'databases', name: 'Databases', icon: Database },
  { id: 'saas', name: 'SaaS Apps', icon: Cloud },
  { id: 'files', name: 'Files', icon: FileSpreadsheet },
  { id: 'custom', name: 'Custom', icon: Webhook },
];

// Available connector types
const CONNECTOR_TYPES: ConnectorType[] = [
  { id: 'postgresql', name: 'PostgreSQL', description: 'Connect to PostgreSQL databases', icon: '🐘', category: 'databases' },
  { id: 'mysql', name: 'MySQL', description: 'Connect to MySQL/MariaDB databases', icon: '🐬', category: 'databases' },
  { id: 'mongodb', name: 'MongoDB', description: 'Connect to MongoDB collections', icon: '🍃', category: 'databases' },
  { id: 'google_sheets', name: 'Google Sheets', description: 'Sync data from Google Spreadsheets', icon: '📊', category: 'files' },
  { id: 'notion', name: 'Notion', description: 'Connect to Notion workspaces', icon: '📝', category: 'saas' },
  { id: 'airtable', name: 'Airtable', description: 'Sync Airtable bases', icon: '📋', category: 'saas' },
  { id: 'salesforce', name: 'Salesforce', description: 'Connect to Salesforce CRM', icon: '☁️', category: 'saas' },
  { id: 'hubspot', name: 'HubSpot', description: 'Connect to HubSpot CRM', icon: '🧡', category: 'saas' },
  { id: 'zendesk', name: 'Zendesk', description: 'Connect to Zendesk support', icon: '💬', category: 'saas' },
  { id: 'shopify', name: 'Shopify', description: 'Connect to Shopify stores', icon: '🛍️', category: 'saas' },
  { id: 'rest_api', name: 'REST API', description: 'Connect to any REST API', icon: '🔌', category: 'custom' },
  { id: 'webhook', name: 'Webhook', description: 'Receive data via webhooks', icon: '🪝', category: 'custom' },
];

// Get connector icon
const getConnectorIcon = (type: string): string => {
  const connector = CONNECTOR_TYPES.find(c => c.id === type);
  return connector?.icon || '🔌';
};

export default function DataConnectorsPage() {
  const { connectors, loading, error, createConnector, updateConnector, deleteConnector } = useDataConnectors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConnectorType, setSelectedConnectorType] = useState<ConnectorType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter connectors by search
  const filteredConnectors = connectors.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter connector types by category
  const filteredTypes = CONNECTOR_TYPES.filter(c => 
    selectedCategory === 'all' || c.category === selectedCategory
  );

  // Handle sync
  const handleSync = async (connector: DataConnector) => {
    await updateConnector(connector.id, { 
      status: 'syncing',
      last_sync_at: new Date().toISOString() 
    });
    
    // Simulate sync (in production, this would trigger actual sync)
    setTimeout(async () => {
      await updateConnector(connector.id, { 
        status: 'connected',
        records_synced: connector.records_synced + Math.floor(Math.random() * 50)
      });
    }, 2000);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this connector?')) {
      await deleteConnector(id);
    }
  };

  // Handle create connector
  const handleCreateConnector = async () => {
    if (!selectedConnectorType) return;
    
    setIsCreating(true);
    const result = await createConnector({
      name: `My ${selectedConnectorType.name}`,
      type: selectedConnectorType.id,
      description: selectedConnectorType.description,
      status: 'connected',
      sync_frequency: 'daily',
      records_synced: 0,
    });
    
    setIsCreating(false);
    if (!result.error) {
      setShowAddModal(false);
      setSelectedConnectorType(null);
    }
  };

  // Format time ago
  const timeAgo = (date?: string) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Connectors</h2>
          <p className="text-slate-500 mt-1">
            {connectors.length} connected • {connectors.reduce((sum, c) => sum + (c.records_synced || 0), 0).toLocaleString()} records synced
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Connector
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search connectors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-800 border border-white/[0.05] text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
        />
      </div>

      {/* Empty State */}
      {connectors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-2xl border border-white/[0.05] p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            <Database className="w-8 h-8 text-gold-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No connectors yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Connect your data sources to power your voice agents with real-time information.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Your First Connector
          </button>
        </motion.div>
      )}

      {/* Connected Data Sources */}
      {filteredConnectors.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredConnectors.map((connector, index) => (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface-800 rounded-2xl border border-white/[0.05] p-5 hover:border-white/[0.1] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-2xl">
                      {getConnectorIcon(connector.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{connector.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {connector.status === 'connected' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle size={12} />
                            Connected
                          </span>
                        )}
                        {connector.status === 'syncing' && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Loader2 size={12} className="animate-spin" />
                            Syncing
                          </span>
                        )}
                        {connector.status === 'error' && (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <XCircle size={12} />
                            Error
                          </span>
                        )}
                        {connector.status === 'disconnected' && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle size={12} />
                            Disconnected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface-700/50 rounded-lg p-2.5">
                    <div className="text-lg font-semibold text-white">
                      {connector.records_synced?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-slate-500">Records</div>
                  </div>
                  <div className="bg-surface-700/50 rounded-lg p-2.5">
                    <div className="text-sm font-semibold text-white flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {timeAgo(connector.last_sync_at)}
                    </div>
                    <div className="text-xs text-slate-500">Last Sync</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(connector)}
                    disabled={connector.status === 'syncing'}
                    className="flex-1 py-2.5 rounded-xl bg-surface-700 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-surface-600 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={connector.status === 'syncing' ? 'animate-spin' : ''} />
                    Sync
                  </button>
                  <button
                    onClick={() => handleDelete(connector.id)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Connector Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-800 rounded-2xl border border-white/[0.1] w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                <h3 className="text-lg font-semibold text-white">Add Data Connector</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 p-4 border-b border-white/[0.05] overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                      selectedCategory === cat.id
                        ? "bg-gold-500 text-surface-900"
                        : "bg-surface-700 text-slate-400 hover:text-white"
                    )}
                  >
                    <cat.icon size={16} />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Connector Grid */}
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedConnectorType(type)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        selectedConnectorType?.id === type.id
                          ? "bg-gold-500/10 border-gold-500/50"
                          : "bg-surface-700/50 border-white/[0.05] hover:border-white/[0.1]"
                      )}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-white text-sm">{type.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-white/[0.05]">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConnector}
                  disabled={!selectedConnectorType || isCreating}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 text-surface-900 font-medium hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link size={16} />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
