import React, { useState, useEffect } from 'react';
import {
  Plus,
  Database,
  Globe,
  ShoppingBag,
  FileSpreadsheet,
  Cloud,
  Server,
  Webhook,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Settings,
  Play,
  RefreshCw,
  ChevronRight,
  X,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ConnectorType {
  id: string;
  name: string;
  description: string;
  icon: string;
  auth_types: string[];
  config_schema: Record<string, any>;
}

interface Connector {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'connected' | 'error' | 'pending';
  enabled: boolean;
  tools: string[];
  last_sync: string;
  created_at: string;
}

interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

const API_BASE = 'http://localhost:8001';

const ICON_MAP: Record<string, React.ReactNode> = {
  '🔌': <Globe className="w-6 h-6" />,
  '📊': <FileSpreadsheet className="w-6 h-6" />,
  '📋': <Database className="w-6 h-6" />,
  '🛍️': <ShoppingBag className="w-6 h-6" />,
  '☁️': <Cloud className="w-6 h-6" />,
  '🧡': <Cloud className="w-6 h-6" />,
  '💳': <Database className="w-6 h-6" />,
  '📝': <FileSpreadsheet className="w-6 h-6" />,
  '🐘': <Server className="w-6 h-6" />,
  '🐬': <Server className="w-6 h-6" />,
  '🍃': <Server className="w-6 h-6" />,
  '🪝': <Webhook className="w-6 h-6" />,
};

export default function DataConnectorsPage() {
  const [tenantId] = useState('demo');
  const [connectorTypes, setConnectorTypes] = useState<ConnectorType[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesRes, connectorsRes] = await Promise.all([
        fetch(`${API_BASE}/connectors/types`),
        fetch(`${API_BASE}/connectors/${tenantId}`),
      ]);

      if (typesRes.ok) {
        const data = await typesRes.json();
        setConnectorTypes(data.types);
      }

      if (connectorsRes.ok) {
        const data = await connectorsRes.json();
        setConnectors(data.connectors);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (connectorId: string) => {
    setTestingId(connectorId);
    try {
      const response = await fetch(
        `${API_BASE}/connectors/${tenantId}/${connectorId}/test`,
        { method: 'POST' }
      );
      const data = await response.json();
      
      // Update connector status
      setConnectors(prev =>
        prev.map(c =>
          c.id === connectorId ? { ...c, status: data.status } : c
        )
      );
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteConnector = async (connectorId: string) => {
    if (!confirm('Are you sure you want to delete this connector?')) return;
    
    try {
      await fetch(`${API_BASE}/connectors/${tenantId}/${connectorId}`, {
        method: 'DELETE',
      });
      setConnectors(prev => prev.filter(c => c.id !== connectorId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggleEnabled = async (connector: Connector) => {
    try {
      await fetch(`${API_BASE}/connectors/${tenantId}/${connector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !connector.enabled }),
      });
      setConnectors(prev =>
        prev.map(c =>
          c.id === connector.id ? { ...c, enabled: !c.enabled } : c
        )
      );
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Connectors</h1>
          <p className="mt-2 text-gray-600">
            Connect your data sources so your AI can access real-time information.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Connector
        </button>
      </div>

      {/* Connected Sources */}
      {connectors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Connected Sources ({connectors.length})
          </h2>
          <div className="grid gap-4">
            {connectors.map((connector) => {
              const type = connectorTypes.find(t => t.id === connector.type);
              return (
                <div
                  key={connector.id}
                  className={`bg-white rounded-xl border-2 p-4 transition-all ${
                    connector.enabled
                      ? 'border-gray-200'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        connector.status === 'connected'
                          ? 'bg-green-100 text-green-600'
                          : connector.status === 'error'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {type && ICON_MAP[type.icon] || <Database className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{connector.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            {type?.name || connector.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(connector.status)}
                            {getStatusText(connector.status)}
                          </span>
                          <span>{connector.tools.length} tools available</span>
                          {connector.last_sync && (
                            <span>Last sync: {new Date(connector.last_sync).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestConnection(connector.id)}
                        disabled={testingId === connector.id}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Test Connection"
                      >
                        {testingId === connector.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConnector(connector);
                          setShowConfigModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(connector)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          connector.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {connector.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDeleteConnector(connector.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {connectors.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No connectors yet</h3>
          <p className="text-gray-500 mb-4">
            Connect your first data source to give your AI real-time access to your business data.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Add Your First Connector
          </button>
        </div>
      )}

      {/* Available Connectors Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Connectors</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {connectorTypes.slice(0, 8).map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setShowAddModal(true);
              }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                {ICON_MAP[type.icon] || <Database className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{type.name}</h3>
                <p className="text-xs text-gray-500">{type.description.slice(0, 30)}...</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Connector Modal */}
      {showAddModal && (
        <AddConnectorModal
          types={connectorTypes}
          selectedType={selectedType}
          tenantId={tenantId}
          onClose={() => {
            setShowAddModal(false);
            setSelectedType(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setSelectedType(null);
            loadData();
          }}
        />
      )}

      {/* Config Modal */}
      {showConfigModal && selectedConnector && (
        <ConnectorConfigModal
          connector={selectedConnector}
          tenantId={tenantId}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedConnector(null);
          }}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}


// ============================================================================
// ADD CONNECTOR MODAL
// ============================================================================

function AddConnectorModal({
  types,
  selectedType: initialType,
  tenantId,
  onClose,
  onSuccess,
}: {
  types: ConnectorType[];
  selectedType: ConnectorType | null;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(initialType);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [authType, setAuthType] = useState('api_key');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedType || !name) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          connector_type: selectedType.id,
          name,
          config,
          credentials: {
            auth_type: authType,
            ...credentials,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create connector');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {step === 1 ? 'Choose Connector Type' : `Connect ${selectedType?.name}`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type);
                    setStep(2);
                  }}
                  className="flex items-center gap-3 p-4 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {ICON_MAP[type.icon] || <Database className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && selectedType && (
            <div className="space-y-6">
              {/* Connector Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`My ${selectedType.name}`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Config Fields */}
              {Object.entries(selectedType.config_schema).map(([key, schema]: [string, any]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {schema.label || key}
                    {schema.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={schema.secret ? 'password' : 'text'}
                    value={config[key] || ''}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                    placeholder={schema.placeholder || ''}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}

              {/* Auth Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Type
                </label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {selectedType.auth_types.map((type) => (
                    <option key={type} value={type}>
                      {type === 'api_key' ? 'API Key' :
                       type === 'bearer' ? 'Bearer Token' :
                       type === 'basic' ? 'Username/Password' :
                       type === 'oauth2' ? 'OAuth 2.0' : type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credentials based on auth type */}
              {authType === 'api_key' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={credentials.api_key || ''}
                      onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authType === 'bearer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={credentials.access_token || ''}
                      onChange={(e) => setCredentials({ ...credentials, access_token: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authType === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username / Client ID
                    </label>
                    <input
                      type="text"
                      value={credentials.client_id || ''}
                      onChange={(e) => setCredentials({ ...credentials, client_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password / Client Secret
                    </label>
                    <input
                      type="password"
                      value={credentials.client_secret || ''}
                      onChange={(e) => setCredentials({ ...credentials, client_secret: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {/* Base URL for REST API */}
              {selectedType.id === 'rest_api' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={credentials.base_url || config.base_url || ''}
                    onChange={(e) => setCredentials({ ...credentials, base_url: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={handleCreate}
                disabled={loading || !name}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Connector
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// CONNECTOR CONFIG MODAL
// ============================================================================

function ConnectorConfigModal({
  connector,
  tenantId,
  onClose,
  onUpdate,
}: {
  connector: Connector;
  tenantId: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadTools();
  }, [connector.id]);

  const loadTools = async () => {
    try {
      const response = await fetch(`${API_BASE}/connectors/${tenantId}/${connector.id}`);
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTool = async (toolName: string) => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/connectors/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          tool_name: toolName,
          params: {},
        }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{connector.name}</h2>
            <p className="text-sm text-gray-500">Connector Settings & Tools</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  connector.status === 'connected' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {connector.status === 'connected' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {connector.status === 'connected' ? 'Connected' : 'Connection Error'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {connector.last_sync ? `Last sync: ${new Date(connector.last_sync).toLocaleString()}` : 'Never synced'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Available Tools ({tools.length})</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : tools.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tools configured</p>
            ) : (
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div key={tool.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{tool.name}</h4>
                      <button
                        onClick={() => handleTestTool(tool.name)}
                        disabled={testLoading}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      >
                        {testLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Test
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Test Result */}
            {testResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                testResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                </h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(testResult.data || testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
