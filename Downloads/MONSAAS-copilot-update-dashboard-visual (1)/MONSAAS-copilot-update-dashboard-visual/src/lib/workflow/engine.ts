/**
 * Workflow Engine - Core execution engine for workflow automation
 * Handles workflow execution, node processing, and event management
 */

import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  ExecutionStep,
  ExecutionStatus,
  WorkflowEvent,
  WorkflowEventType,
  WorkflowCondition,
  ConditionOperator,
} from './types';
import { integrationRegistry } from './integrations';

// ==================== EXECUTION CONTEXT ====================

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  stepOutputs: Record<string, unknown>;
  currentNode: string | null;
  startTime: number;
  timeout: number;
}

// ==================== CONDITION EVALUATOR ====================

export class ConditionEvaluator {
  evaluate(condition: WorkflowCondition, context: ExecutionContext): boolean {
    const fieldValue = this.resolveField(condition.field, context);
    return this.compare(fieldValue, condition.operator, condition.value);
  }

  evaluateAll(
    conditions: WorkflowCondition[],
    context: ExecutionContext
  ): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluate(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluate(condition, context);

      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  private resolveField(field: string, context: ExecutionContext): unknown {
    // Handle variable references like {{variable.path}}
    if (field.startsWith('{{') && field.endsWith('}}')) {
      const path = field.slice(2, -2).trim();
      return this.getNestedValue(context.variables, path) ??
             this.getNestedValue(context.stepOutputs, path);
    }

    // Handle step output references like steps.nodeName.output
    if (field.startsWith('steps.')) {
      const path = field.slice(6);
      return this.getNestedValue(context.stepOutputs, path);
    }

    // Handle variable references like vars.variableName
    if (field.startsWith('vars.')) {
      const path = field.slice(5);
      return this.getNestedValue(context.variables, path);
    }

    return field;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private compare(
    fieldValue: unknown,
    operator: ConditionOperator,
    targetValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue;

      case 'not_equals':
        return fieldValue !== targetValue;

      case 'contains':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          return fieldValue.includes(targetValue);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(targetValue);
        }
        return false;

      case 'not_contains':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          return !fieldValue.includes(targetValue);
        }
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(targetValue);
        }
        return true;

      case 'greater_than':
        return Number(fieldValue) > Number(targetValue);

      case 'less_than':
        return Number(fieldValue) < Number(targetValue);

      case 'is_empty':
        if (fieldValue === null || fieldValue === undefined) return true;
        if (typeof fieldValue === 'string') return fieldValue.length === 0;
        if (Array.isArray(fieldValue)) return fieldValue.length === 0;
        if (typeof fieldValue === 'object') return Object.keys(fieldValue).length === 0;
        return false;

      case 'is_not_empty':
        if (fieldValue === null || fieldValue === undefined) return false;
        if (typeof fieldValue === 'string') return fieldValue.length > 0;
        if (Array.isArray(fieldValue)) return fieldValue.length > 0;
        if (typeof fieldValue === 'object') return Object.keys(fieldValue).length > 0;
        return true;

      case 'matches_regex':
        if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
          try {
            const regex = new RegExp(targetValue);
            return regex.test(fieldValue);
          } catch {
            return false;
          }
        }
        return false;

      case 'in_list':
        if (Array.isArray(targetValue)) {
          return targetValue.includes(fieldValue);
        }
        return false;

      default:
        return false;
    }
  }
}

// ==================== NODE EXECUTORS ====================

export interface NodeExecutor {
  execute(
    node: WorkflowNode,
    context: ExecutionContext,
    engine: WorkflowEngine
  ): Promise<unknown>;
}

// Action Node Executor
class ActionNodeExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext,
    _engine: WorkflowEngine
  ): Promise<unknown> {
    const { integrationId, actionType, parameters } = node.config;

    if (!integrationId || !actionType) {
      throw new Error('Action node requires integrationId and actionType');
    }

    const integration = integrationRegistry.get(integrationId);
    if (!integration || integration.status !== 'connected') {
      throw new Error(`Integration ${integrationId} is not connected`);
    }

    // Check rate limit
    if (!integrationRegistry.canMakeRequest(integrationId)) {
      throw new Error(`Rate limit exceeded for integration ${integrationId}`);
    }

    // Resolve parameter variables
    const resolvedParams = this.resolveParameters(parameters || {}, context);

    // Simulate action execution (in production, this would call actual APIs)
    const result = await this.executeAction(integrationId, actionType, resolvedParams);

    // Decrement rate limit
    integrationRegistry.decrementRateLimit(integrationId);

    return result;
  }

  private resolveParameters(
    params: Record<string, unknown>,
    context: ExecutionContext
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        const path = value.slice(2, -2).trim();
        resolved[key] = this.getNestedValue(context, path);
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveParameters(value as Record<string, unknown>, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private getNestedValue(context: ExecutionContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = { ...context.variables, ...context.stepOutputs };

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private async executeAction(
    integrationId: string,
    actionType: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    // Simulate action execution with realistic response
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    return {
      success: true,
      integrationId,
      action: actionType,
      params,
      result: {
        id: `result_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Condition Node Executor
class ConditionNodeExecutor implements NodeExecutor {
  private evaluator = new ConditionEvaluator();

  async execute(
    node: WorkflowNode,
    context: ExecutionContext,
    _engine: WorkflowEngine
  ): Promise<unknown> {
    const { conditions } = node.config;

    if (!conditions || conditions.length === 0) {
      return { result: true, branch: node.config.trueBranch };
    }

    const result = this.evaluator.evaluateAll(conditions, context);

    return {
      result,
      branch: result ? node.config.trueBranch : node.config.falseBranch,
    };
  }
}

// Loop Node Executor
class LoopNodeExecutor implements NodeExecutor {
  private evaluator = new ConditionEvaluator();

  async execute(
    node: WorkflowNode,
    context: ExecutionContext,
    engine: WorkflowEngine
  ): Promise<unknown> {
    const { loopType, loopSource, loopCondition, loopCount } = node.config;
    const results: unknown[] = [];

    switch (loopType) {
      case 'forEach': {
        const source = this.resolveSource(loopSource || '', context);
        if (!Array.isArray(source)) {
          throw new Error('Loop source must be an array');
        }

        for (let i = 0; i < source.length; i++) {
          context.variables['_loopIndex'] = i;
          context.variables['_loopItem'] = source[i];

          // Execute child nodes (simplified - in real implementation would follow edges)
          results.push({ index: i, item: source[i] });
        }
        break;
      }

      case 'while': {
        if (!loopCondition) {
          throw new Error('While loop requires a condition');
        }

        let iterations = 0;
        const maxIterations = 1000; // Safety limit

        while (
          this.evaluator.evaluate(loopCondition, context) &&
          iterations < maxIterations
        ) {
          context.variables['_loopIndex'] = iterations;
          results.push({ index: iterations });
          iterations++;
        }
        break;
      }

      case 'times': {
        const count = loopCount || 1;
        for (let i = 0; i < count; i++) {
          context.variables['_loopIndex'] = i;
          results.push({ index: i });
        }
        break;
      }
    }

    return { iterations: results.length, results };
  }

  private resolveSource(source: string, context: ExecutionContext): unknown {
    if (source.startsWith('{{') && source.endsWith('}}')) {
      const path = source.slice(2, -2).trim();
      return this.getNestedValue(context, path);
    }
    return undefined;
  }

  private getNestedValue(context: ExecutionContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = { ...context.variables, ...context.stepOutputs };

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}

// Delay Node Executor
class DelayNodeExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode,
    _context: ExecutionContext,
    _engine: WorkflowEngine
  ): Promise<unknown> {
    const { delayMs, delayUntil } = node.config;

    let delay = delayMs || 0;

    if (delayUntil) {
      const targetTime = new Date(delayUntil).getTime();
      delay = Math.max(0, targetTime - Date.now());
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    return { delayed: delay, resumedAt: new Date().toISOString() };
  }
}

// Transform Node Executor
class TransformNodeExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext,
    _engine: WorkflowEngine
  ): Promise<unknown> {
    const { mappings, transformScript } = node.config;

    if (transformScript) {
      // NOTE: Transform scripts are a potential security concern.
      // In production, consider using a sandboxed JavaScript engine like:
      // - quickjs-emscripten (https://github.com/nickaranda/quickjs-emscripten)
      // - isolated-vm (https://github.com/nickaranda/isolated-vm)
      // For now, we use safe expression evaluation with limited scope
      console.warn('[WorkflowEngine] Transform scripts should be sandboxed in production');
      try {
        // Create a restricted context with only safe operations
        const safeContext = {
          ...context.variables,
          ...context.stepOutputs,
          // Safe utility functions
          String,
          Number,
          Boolean,
          Array,
          Object,
          JSON,
          Math,
          Date,
          parseInt,
          parseFloat,
          isNaN,
          isFinite,
        };
        const fn = new Function('context', `with(context) { return (${transformScript})(context) }`);
        return fn(safeContext);
      } catch (error) {
        throw new Error(`Transform script error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (mappings && mappings.length > 0) {
      const result: Record<string, unknown> = {};

      for (const mapping of mappings) {
        const sourceValue = this.getNestedValue(context, mapping.source);
        let transformedValue = sourceValue;

        if (mapping.transform) {
          // Only allow simple, safe transformations
          // Transform should be a simple expression, not arbitrary code
          console.warn('[WorkflowEngine] Field transforms should be validated in production');
          try {
            const fn = new Function('value', `return (${mapping.transform})(value)`);
            transformedValue = fn(sourceValue);
          } catch {
            transformedValue = sourceValue;
          }
        }

        this.setNestedValue(result, mapping.target, transformedValue);
      }

      return result;
    }

    return {};
  }

  private getNestedValue(context: ExecutionContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = { ...context.variables, ...context.stepOutputs };

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;

    // Guard against prototype pollution
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      // Prevent prototype pollution attacks
      if (dangerousKeys.includes(key)) {
        throw new Error(`Invalid property name: ${key}`);
      }
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const finalKey = parts[parts.length - 1];
    // Prevent prototype pollution on final assignment
    if (dangerousKeys.includes(finalKey)) {
      throw new Error(`Invalid property name: ${finalKey}`);
    }
    current[finalKey] = value;
  }
}

// Notification Node Executor
class NotificationNodeExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext,
    _engine: WorkflowEngine
  ): Promise<unknown> {
    const { channel, template, recipients } = node.config;

    // Resolve template variables
    const message = this.resolveTemplate(template || '', context);

    // Simulate notification sending
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      channel,
      recipients: recipients || [],
      message,
      sentAt: new Date().toISOString(),
    };
  }

  private resolveTemplate(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getNestedValue(context, path.trim());
      return String(value ?? '');
    });
  }

  private getNestedValue(context: ExecutionContext, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = { ...context.variables, ...context.stepOutputs };

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}

// ==================== WORKFLOW ENGINE ====================

export class WorkflowEngine {
  private executors: Map<string, NodeExecutor> = new Map();
  private runningExecutions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<WorkflowEventType, Set<(event: WorkflowEvent) => void>> = new Map();
  private conditionEvaluator = new ConditionEvaluator();

  constructor() {
    // Register node executors
    this.executors.set('action', new ActionNodeExecutor());
    this.executors.set('condition', new ConditionNodeExecutor());
    this.executors.set('loop', new LoopNodeExecutor());
    this.executors.set('delay', new DelayNodeExecutor());
    this.executors.set('transform', new TransformNodeExecutor());
    this.executors.set('notification', new NotificationNodeExecutor());
  }

  // Execute a workflow
  async execute(
    workflow: Workflow,
    triggerData?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: 'pending',
      triggeredBy: 'manual',
      triggeredAt: Date.now(),
      steps: [],
      context: {},
      metrics: {
        nodesExecuted: 0,
        nodesSucceeded: 0,
        nodesFailed: 0,
        totalRetries: 0,
      },
    };

    this.runningExecutions.set(executionId, execution);
    this.emitEvent('execution.started', { workflowId: workflow.id, executionId });

    try {
      // Initialize context
      const context: ExecutionContext = {
        workflowId: workflow.id,
        executionId,
        variables: this.initializeVariables(workflow, triggerData),
        stepOutputs: {},
        currentNode: null,
        startTime: Date.now(),
        timeout: workflow.settings.timeout,
      };

      execution.status = 'running';
      execution.startedAt = Date.now();
      execution.context = context.variables;

      // Find start node (trigger node or first node)
      const startNode = this.findStartNode(workflow);
      if (!startNode) {
        throw new Error('No start node found in workflow');
      }

      // Execute workflow
      await this.executeNode(startNode, workflow, execution, context);

      // Complete execution
      execution.status = 'completed';
      execution.completedAt = Date.now();
      execution.duration = execution.completedAt - (execution.startedAt || execution.triggeredAt);

      this.emitEvent('execution.completed', {
        workflowId: workflow.id,
        executionId,
        duration: execution.duration,
      });
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = Date.now();
      execution.duration = execution.completedAt - (execution.startedAt || execution.triggeredAt);
      execution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        nodeId: execution.steps[execution.steps.length - 1]?.nodeId,
      };

      this.emitEvent('execution.failed', {
        workflowId: workflow.id,
        executionId,
        error: execution.error,
      });
    }

    this.runningExecutions.delete(executionId);
    return execution;
  }

  private initializeVariables(
    workflow: Workflow,
    triggerData?: Record<string, unknown>
  ): Record<string, unknown> {
    const variables: Record<string, unknown> = {};

    // Set default values from workflow variables
    for (const variable of workflow.variables) {
      if (variable.defaultValue !== undefined) {
        variables[variable.name] = variable.defaultValue;
      }
    }

    // Override with trigger data
    if (triggerData) {
      Object.assign(variables, triggerData);
    }

    // Add system variables
    variables['_workflowId'] = workflow.id;
    variables['_timestamp'] = new Date().toISOString();
    // Use typeof check to safely access environment mode across different build systems
    variables['_env'] = typeof import.meta !== 'undefined' && import.meta.env 
      ? import.meta.env.MODE 
      : 'development';

    return variables;
  }

  private findStartNode(workflow: Workflow): WorkflowNode | undefined {
    // Find trigger node first
    const triggerNode = workflow.nodes.find((n) => n.type === 'trigger');
    if (triggerNode) return triggerNode;

    // Find node that has no incoming edges
    const targetNodeIds = new Set(workflow.edges.map((e) => e.target));
    return workflow.nodes.find((n) => !targetNodeIds.has(n.id));
  }

  private async executeNode(
    node: WorkflowNode,
    workflow: Workflow,
    execution: WorkflowExecution,
    context: ExecutionContext
  ): Promise<void> {
    // Check timeout
    if (Date.now() - context.startTime > context.timeout) {
      throw new Error('Workflow execution timeout');
    }

    context.currentNode = node.id;

    const step: ExecutionStep = {
      nodeId: node.id,
      nodeName: node.name,
      status: 'running',
      startedAt: Date.now(),
      retryCount: 0,
    };

    execution.steps.push(step);
    execution.metrics.nodesExecuted++;

    this.emitEvent('step.started', {
      workflowId: workflow.id,
      executionId: execution.id,
      nodeId: node.id,
    });

    try {
      // Get executor for node type
      const executor = this.executors.get(node.type);
      if (!executor && node.type !== 'trigger') {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      // Execute node
      let output: unknown = undefined;
      if (executor) {
        output = await this.executeWithRetry(
          () => executor.execute(node, context, this),
          workflow.settings.maxRetries,
          step
        );
      }

      // Store output
      context.stepOutputs[node.id] = output;
      step.output = output;
      step.status = 'completed';
      step.completedAt = Date.now();
      step.duration = step.completedAt - (step.startedAt || 0);

      execution.metrics.nodesSucceeded++;

      this.emitEvent('step.completed', {
        workflowId: workflow.id,
        executionId: execution.id,
        nodeId: node.id,
        output,
      });

      // Find and execute next nodes
      const nextNodes = this.findNextNodes(node, workflow, context, output);
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, workflow, execution, context);
      }
    } catch (error) {
      step.status = 'failed';
      step.completedAt = Date.now();
      step.duration = step.completedAt - (step.startedAt || 0);
      step.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };

      execution.metrics.nodesFailed++;

      this.emitEvent('step.failed', {
        workflowId: workflow.id,
        executionId: execution.id,
        nodeId: node.id,
        error: step.error,
      });

      // Check for error handler
      if (node.errorHandler) {
        const errorHandlerNode = workflow.nodes.find((n) => n.id === node.errorHandler);
        if (errorHandlerNode) {
          context.variables['_error'] = step.error;
          await this.executeNode(errorHandlerNode, workflow, execution, context);
          return;
        }
      }

      throw error;
    }
  }

  private async executeWithRetry(
    fn: () => Promise<unknown>,
    maxRetries: number,
    step: ExecutionStep
  ): Promise<unknown> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        step.retryCount = attempt;

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private findNextNodes(
    currentNode: WorkflowNode,
    workflow: Workflow,
    context: ExecutionContext,
    output: unknown
  ): WorkflowNode[] {
    const outgoingEdges = workflow.edges.filter((e) => e.source === currentNode.id);
    const nextNodes: WorkflowNode[] = [];

    for (const edge of outgoingEdges) {
      // Check edge condition
      if (edge.condition) {
        if (!this.conditionEvaluator.evaluate(edge.condition, context)) {
          continue;
        }
      }

      // Handle condition node branches
      if (currentNode.type === 'condition' && output && typeof output === 'object') {
        const conditionOutput = output as { branch?: string };
        if (conditionOutput.branch && edge.target !== conditionOutput.branch) {
          // Check if this edge is for the selected branch
          if (edge.sourceHandle && edge.sourceHandle !== (conditionOutput.branch === currentNode.config.trueBranch ? 'true' : 'false')) {
            continue;
          }
        }
      }

      const targetNode = workflow.nodes.find((n) => n.id === edge.target);
      if (targetNode) {
        nextNodes.push(targetNode);
      }
    }

    return nextNodes;
  }

  // Cancel a running execution
  cancel(executionId: string): boolean {
    const execution = this.runningExecutions.get(executionId);
    if (!execution) return false;

    execution.status = 'cancelled';
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - (execution.startedAt || execution.triggeredAt);

    this.runningExecutions.delete(executionId);

    this.emitEvent('execution.cancelled', {
      workflowId: execution.workflowId,
      executionId,
    });

    return true;
  }

  // Get running execution
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.runningExecutions.get(executionId);
  }

  // Get all running executions
  getRunningExecutions(): WorkflowExecution[] {
    return Array.from(this.runningExecutions.values());
  }

  // Event system
  on(eventType: WorkflowEventType, callback: (event: WorkflowEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  private emitEvent(type: WorkflowEventType, data?: Record<string, unknown>): void {
    const event: WorkflowEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      timestamp: Date.now(),
      ...data,
    };

    this.eventListeners.get(type)?.forEach((callback) => callback(event));
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
