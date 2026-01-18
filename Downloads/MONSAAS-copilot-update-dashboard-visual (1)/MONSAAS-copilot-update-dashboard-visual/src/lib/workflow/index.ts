/**
 * Workflow Orchestration System - Main Export
 * Enterprise-grade workflow automation for SaaS applications
 */

// Types
export * from './types';

// Integration Registry
export {
  IntegrationRegistry,
  integrationRegistry,
  NATIVE_INTEGRATIONS,
  type IntegrationDefinition,
} from './integrations';

// Workflow Engine
export {
  WorkflowEngine,
  workflowEngine,
  ConditionEvaluator,
  type ExecutionContext,
  type NodeExecutor,
} from './engine';

// Templates
export {
  WORKFLOW_TEMPLATES,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
  getTemplateById,
  getTemplatesByIntegration,
} from './templates';

// Store
export {
  workflowStore,
  useWorkflowStore,
  useWorkflow,
  useIntegrations,
  type WorkflowState,
  type WorkflowActions,
} from './store';
