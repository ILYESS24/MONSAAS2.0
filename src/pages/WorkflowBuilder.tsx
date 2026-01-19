/**
 * Workflow Builder - Visual workflow editor and automation dashboard
 * Full-featured workflow orchestration UI
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Copy,
  Settings,
  Zap,
  GitBranch,
  Clock,
  Bell,
  Database,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Layers,
  Activity,
  BarChart3,
  Grid3X3,
  List,
  Code,
  MessageSquare,
  Mail,
  Globe,
  Link as LinkIcon,
  Box,
  Timer,
  Repeat,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  useWorkflowStore,
  useIntegrations,
  WORKFLOW_TEMPLATES,
  getTemplatesByCategory,
  getPopularTemplates,
  NATIVE_INTEGRATIONS,
  type Workflow,
  type WorkflowNode,
  type WorkflowExecution,
  type Integration,
  type NodeType,
  type WorkflowTemplate,
} from '@/lib/workflow';
import { SEO, seoConfigs } from '@/components/common/SEO';

// ==================== NODE ICONS ====================

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  loop: Repeat,
  delay: Timer,
  transform: Code,
  notification: Bell,
  subworkflow: Layers,
  error_handler: AlertTriangle,
};

const NODE_COLORS: Record<NodeType, string> = {
  trigger: 'bg-yellow-500',
  action: 'bg-blue-500',
  condition: 'bg-purple-500',
  loop: 'bg-orange-500',
  delay: 'bg-gray-500',
  transform: 'bg-cyan-500',
  notification: 'bg-pink-500',
  subworkflow: 'bg-indigo-500',
  error_handler: 'bg-red-500',
};

// ==================== STATUS BADGES ====================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    archived: 'bg-gray-500/20 text-gray-500',
    completed: 'bg-green-500/20 text-green-400',
    running: 'bg-blue-500/20 text-blue-400',
    failed: 'bg-red-500/20 text-red-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ==================== INTEGRATION CARD ====================

const IntegrationCard: React.FC<{
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
}> = ({ integration, onConnect, onDisconnect }) => {
  const def = NATIVE_INTEGRATIONS[integration.id];

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#D4FF00]/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{def?.icon || '🔗'}</span>
          <div>
            <h4 className="text-white font-medium">{integration.name}</h4>
            <p className="text-gray-500 text-xs capitalize">{integration.category}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      {integration.status === 'connected' && (
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {integration.healthCheck.latency}ms
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {integration.rateLimit.remaining}/{integration.rateLimit.requests}
          </span>
        </div>
      )}

      <button
        onClick={integration.status === 'connected' ? onDisconnect : onConnect}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          integration.status === 'connected'
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-[#D4FF00]/20 text-[#D4FF00] hover:bg-[#D4FF00]/30'
        }`}
      >
        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

// ==================== WORKFLOW NODE ====================

const WorkflowNodeCard: React.FC<{
  node: WorkflowNode;
  isSelected: boolean;
  execution?: { status: string };
  onClick: () => void;
  onDelete: () => void;
}> = ({ node, isSelected, execution, onClick, onDelete }) => {
  const Icon = NODE_ICONS[node.type];
  const color = NODE_COLORS[node.type];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#1a1a1a] rounded-xl p-4 border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#D4FF00] shadow-lg shadow-[#D4FF00]/20'
          : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
      }`}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        minWidth: '180px',
      }}
    >
      {/* Execution indicator */}
      {execution && (
        <div className="absolute -top-2 -right-2">
          {execution.status === 'running' && (
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          )}
          {execution.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          {execution.status === 'failed' && (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{node.name}</h4>
          <p className="text-gray-500 text-xs capitalize">{node.type.replace('_', ' ')}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>

      {node.description && (
        <p className="text-gray-500 text-xs line-clamp-2">{node.description}</p>
      )}

      {/* Connection handles */}
      <div className="absolute -left-2 top-1/2 w-4 h-4 bg-[#2a2a2a] rounded-full border-2 border-[#3a3a3a]" />
      <div className="absolute -right-2 top-1/2 w-4 h-4 bg-[#2a2a2a] rounded-full border-2 border-[#3a3a3a]" />
    </div>
  );
};

// ==================== TEMPLATE CARD ====================

const TemplateCard: React.FC<{
  template: WorkflowTemplate;
  onUse: () => void;
}> = ({ template, onUse }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#D4FF00]/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h4 className="text-white font-medium">{template.name}</h4>
            <p className="text-gray-500 text-xs">{template.category}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">⭐ {template.popularity}%</span>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{template.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-[#2a2a2a] rounded-full text-xs text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {template.requiredIntegrations.slice(0, 3).map((id) => (
            <span
              key={id}
              className="w-6 h-6 bg-[#2a2a2a] rounded-full flex items-center justify-center text-xs"
              title={id}
            >
              {NATIVE_INTEGRATIONS[id]?.icon || '🔗'}
            </span>
          ))}
        </div>
        <button
          onClick={onUse}
          className="px-3 py-1.5 bg-[#D4FF00]/20 text-[#D4FF00] rounded-lg text-sm font-medium hover:bg-[#D4FF00]/30 transition-colors"
        >
          Use Template
        </button>
      </div>
    </div>
  );
};

// ==================== EXECUTION HISTORY ====================

const ExecutionRow: React.FC<{
  execution: WorkflowExecution;
  onClick: () => void;
}> = ({ execution, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        {execution.status === 'running' && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        )}
        {execution.status === 'completed' && (
          <CheckCircle className="w-4 h-4 text-green-400" />
        )}
        {execution.status === 'failed' && (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
        {execution.status === 'cancelled' && (
          <AlertCircle className="w-4 h-4 text-gray-400" />
        )}
        <div>
          <p className="text-white text-sm font-medium">
            {new Date(execution.triggeredAt).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs">
            {execution.metrics.nodesExecuted} nodes • {execution.duration || 0}ms
          </p>
        </div>
      </div>
      <StatusBadge status={execution.status} />
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const WorkflowBuilder: React.FC = () => {
  const store = useWorkflowStore();
  const { integrations, connected, connect, disconnect } = useIntegrations();

  // Local state
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'integrations' | 'executions'>('workflows');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  // Filtered data
  const filteredWorkflows = useMemo(() => {
    return store.workflows.filter(
      (wf) =>
        wf.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedCategory || wf.tags.includes(selectedCategory))
    );
  }, [store.workflows, searchQuery, selectedCategory]);

  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);
  const popularTemplates = useMemo(() => getPopularTemplates(5), []);

  // Handlers
  const handleCreateWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return;

    store.createWorkflow({
      name: newWorkflowName,
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'manual',
        config: {},
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Start',
          position: { x: 100, y: 100 },
          config: {},
        },
      ],
      edges: [],
      variables: [],
      settings: {
        timeout: 300000,
        maxRetries: 3,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: [],
      createdBy: 'user',
    });

    setNewWorkflowName('');
    setShowNewWorkflow(false);
  }, [newWorkflowName, store]);

  const handleUseTemplate = useCallback(
    (template: WorkflowTemplate) => {
      store.createWorkflow({
        ...template.workflow,
        name: template.name,
        createdBy: 'user',
      });
    },
    [store]
  );

  // Stats
  const stats = useMemo(() => {
    const total = store.workflows.length;
    const active = store.workflows.filter((wf) => wf.status === 'active').length;
    const executions = store.executions.length;
    const successful = store.executions.filter((e) => e.status === 'completed').length;

    return { total, active, executions, successful };
  }, [store.workflows, store.executions]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#D4FF00]" />
              <h1 className="text-xl font-bold">Workflow Automation</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm focus:outline-none focus:border-[#D4FF00]/50"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded ${view === 'grid' ? 'bg-[#2a2a2a]' : ''}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-[#2a2a2a]' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* New workflow button */}
            <button
              onClick={() => setShowNewWorkflow(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4FF00] text-black rounded-lg font-medium hover:bg-[#c4ef00] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-4">
          {[
            { id: 'workflows', label: 'Workflows', icon: Layers },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'integrations', label: 'Integrations', icon: LinkIcon },
            { id: 'executions', label: 'Executions', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#D4FF00] text-white'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats bar */}
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-sm">Total Workflows</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-sm">Total Executions</p>
            <p className="text-2xl font-bold text-white">{stats.executions}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <p className="text-gray-500 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-[#D4FF00]">
              {stats.executions > 0
                ? Math.round((stats.successful / stats.executions) * 100)
                : 100}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div>
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  No workflows yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first workflow or start from a template
                </p>
                <button
                  onClick={() => setShowNewWorkflow(true)}
                  className="px-4 py-2 bg-[#D4FF00] text-black rounded-lg font-medium"
                >
                  Create Workflow
                </button>
              </div>
            ) : (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }
              >
                {filteredWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#D4FF00]/30 transition-colors cursor-pointer"
                    onClick={() => store.setActiveWorkflow(workflow.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{workflow.name}</h3>
                        <p className="text-gray-500 text-sm">
                          {workflow.nodes.length} nodes • v{workflow.version}
                        </p>
                      </div>
                      <StatusBadge status={workflow.status} />
                    </div>

                    {workflow.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {workflow.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Last run:{' '}
                        {workflow.lastRunAt
                          ? new Date(workflow.lastRunAt).toLocaleDateString()
                          : 'Never'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.executeWorkflow(workflow.id);
                          }}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Run workflow"
                        >
                          <Play className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.duplicateWorkflow(workflow.id);
                          }}
                          className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.deleteWorkflow(workflow.id);
                          }}
                          className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            {/* Popular templates */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-4">🔥 Popular Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => handleUseTemplate(template)}
                  />
                ))}
              </div>
            </div>

            {/* Templates by category */}
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-medium text-white mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={() => handleUseTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div>
            {/* Connected */}
            {connected.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-white mb-4">
                  ✅ Connected ({connected.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {connected.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={() => connect(integration.id, {})}
                      onDisconnect={() => disconnect(integration.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4">
                🔌 Available Integrations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {integrations
                  .filter((i) => i.status !== 'connected')
                  .map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={() => connect(integration.id, {})}
                      onDisconnect={() => disconnect(integration.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div>
            {store.executions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  No executions yet
                </h3>
                <p className="text-gray-500">
                  Run a workflow to see its execution history here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.executions
                  .slice()
                  .reverse()
                  .map((execution) => (
                    <ExecutionRow
                      key={execution.id}
                      execution={execution}
                      onClick={() => {}}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Workflow</h2>
            <input
              type="text"
              placeholder="Workflow name"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white mb-4 focus:outline-none focus:border-[#D4FF00]/50"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewWorkflow(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
                className="px-4 py-2 bg-[#D4FF00] text-black rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {store.notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg ${
              notif.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : notif.type === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : notif.type === 'warning'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {notif.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notif.type === 'error' && <XCircle className="w-4 h-4" />}
            {notif.type === 'warning' && <AlertCircle className="w-4 h-4" />}
            {notif.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm">{notif.message}</span>
            <button
              onClick={() => store.removeNotification(notif.id)}
              className="ml-2 hover:opacity-70"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
