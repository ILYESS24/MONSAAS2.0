/**
 * Workflow Orchestration System - Type Definitions
 * Enterprise-grade workflow automation with full type safety
 */

// ==================== INTEGRATION TYPES ====================

export type IntegrationCategory = 
  | 'crm' 
  | 'payment' 
  | 'email' 
  | 'storage' 
  | 'analytics' 
  | 'communication'
  | 'productivity'
  | 'development';

export type AuthType = 'oauth2' | 'apikey' | 'jwt' | 'webhook' | 'basic';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'configuring';

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface EncryptedCredentials {
  encrypted: string;
  iv: string;
  algorithm: string;
  keyId: string;
}

export interface RateLimitInfo {
  requests: number;
  perSeconds: number;
  remaining: number;
  resetAt: number;
}

export interface HealthCheckInfo {
  lastCheck: number;
  status: HealthStatus;
  latency: number;
  errorMessage?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: number;
}

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  icon?: string;
  status: ConnectionStatus;
  auth: {
    type: AuthType;
    credentials?: EncryptedCredentials;
    refreshToken?: string;
    expiresAt?: number;
    scopes?: string[];
  };
  capabilities: ('read' | 'write' | 'webhook' | 'realtime')[];
  rateLimit: RateLimitInfo;
  healthCheck: HealthCheckInfo;
  webhooks?: WebhookConfig[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

// ==================== WORKFLOW TYPES ====================

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error' | 'archived';

export type TriggerType = 
  | 'manual' 
  | 'schedule' 
  | 'webhook' 
  | 'event' 
  | 'condition' 
  | 'integration';

export type NodeType = 
  | 'trigger' 
  | 'action' 
  | 'condition' 
  | 'loop' 
  | 'delay' 
  | 'transform' 
  | 'notification'
  | 'subworkflow'
  | 'error_handler';

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains' 
  | 'greater_than' 
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'matches_regex'
  | 'in_list';

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: {
    // Schedule trigger
    cron?: string;
    timezone?: string;
    // Webhook trigger
    webhookPath?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    // Event trigger
    eventSource?: string;
    eventType?: string;
    // Integration trigger
    integrationId?: string;
    integrationEvent?: string;
  };
  filters?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  position: Position;
  config: {
    // Action config
    integrationId?: string;
    actionType?: string;
    parameters?: Record<string, unknown>;
    // Condition config
    conditions?: WorkflowCondition[];
    trueBranch?: string;
    falseBranch?: string;
    // Loop config
    loopType?: 'forEach' | 'while' | 'times';
    loopSource?: string;
    loopCondition?: WorkflowCondition;
    loopCount?: number;
    // Delay config
    delayMs?: number;
    delayUntil?: string;
    // Transform config
    transformScript?: string;
    mappings?: Array<{ source: string; target: string; transform?: string }>;
    // Notification config
    channel?: 'email' | 'slack' | 'webhook' | 'sms';
    template?: string;
    recipients?: string[];
    // Subworkflow config
    subworkflowId?: string;
    // Error handler config
    retryCount?: number;
    retryDelay?: number;
    fallbackAction?: string;
  };
  inputs?: string[];
  outputs?: string[];
  errorHandler?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: WorkflowCondition;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  required: boolean;
  sensitive: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  settings: {
    timeout: number;
    maxRetries: number;
    notifyOnError: boolean;
    notifyOnComplete: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  tags: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  lastRunAt?: number;
  nextRunAt?: number;
}

// ==================== EXECUTION TYPES ====================

export type ExecutionStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'timeout';

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  input?: unknown;
  output?: unknown;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  retryCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  status: ExecutionStatus;
  triggeredBy: 'manual' | 'schedule' | 'webhook' | 'event' | 'api';
  triggeredAt: number;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  steps: ExecutionStep[];
  context: Record<string, unknown>;
  error?: {
    message: string;
    nodeId?: string;
    code?: string;
  };
  metrics: {
    nodesExecuted: number;
    nodesSucceeded: number;
    nodesFailed: number;
    totalRetries: number;
  };
}

// ==================== TEMPLATE TYPES ====================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  popularity: number;
  workflow: Omit<Workflow, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
  requiredIntegrations: string[];
  tags: string[];
}

// ==================== EVENT TYPES ====================

export type WorkflowEventType = 
  | 'workflow.created'
  | 'workflow.updated'
  | 'workflow.deleted'
  | 'workflow.activated'
  | 'workflow.paused'
  | 'execution.started'
  | 'execution.completed'
  | 'execution.failed'
  | 'execution.cancelled'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.error';

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventType;
  timestamp: number;
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
  integrationId?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
