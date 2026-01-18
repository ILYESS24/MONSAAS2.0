/**
 * Workflow Store - State management for workflows using Zustand
 */

import type {
  Workflow,
  WorkflowExecution,
  WorkflowNode,
  WorkflowEdge,
  WorkflowStatus,
  Integration,
} from './types';
import { integrationRegistry } from './integrations';
import { workflowEngine } from './engine';

// ==================== STORE STATE ====================

export interface WorkflowState {
  // Workflows
  workflows: Workflow[];
  activeWorkflowId: string | null;
  
  // Executions
  executions: WorkflowExecution[];
  activeExecutionId: string | null;
  
  // Integrations
  integrations: Integration[];
  
  // Editor state
  editorMode: 'view' | 'edit' | 'execute';
  selectedNodeId: string | null;
  clipboard: WorkflowNode | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
}

// ==================== STORE ACTIONS ====================

export interface WorkflowActions {
  // Workflow CRUD
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => Workflow;
  setActiveWorkflow: (id: string | null) => void;
  
  // Workflow status
  activateWorkflow: (id: string) => void;
  pauseWorkflow: (id: string) => void;
  archiveWorkflow: (id: string) => void;
  
  // Node operations
  addNode: (workflowId: string, node: Omit<WorkflowNode, 'id'>) => WorkflowNode;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (workflowId: string, nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  copyNode: (node: WorkflowNode) => void;
  pasteNode: (workflowId: string, position: { x: number; y: number }) => WorkflowNode | null;
  
  // Edge operations
  addEdge: (workflowId: string, edge: Omit<WorkflowEdge, 'id'>) => WorkflowEdge;
  updateEdge: (workflowId: string, edgeId: string, updates: Partial<WorkflowEdge>) => void;
  deleteEdge: (workflowId: string, edgeId: string) => void;
  
  // Execution
  executeWorkflow: (id: string, triggerData?: Record<string, unknown>) => Promise<WorkflowExecution>;
  cancelExecution: (executionId: string) => void;
  clearExecutions: (workflowId: string) => void;
  
  // Integrations
  refreshIntegrations: () => void;
  connectIntegration: (id: string, credentials: unknown) => Promise<void>;
  disconnectIntegration: (id: string) => void;
  
  // UI
  setEditorMode: (mode: 'view' | 'edit' | 'execute') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// ==================== INITIAL STATE ====================

const initialState: WorkflowState = {
  workflows: [],
  activeWorkflowId: null,
  executions: [],
  activeExecutionId: null,
  integrations: integrationRegistry.getAll(),
  editorMode: 'view',
  selectedNodeId: null,
  clipboard: null,
  isLoading: false,
  error: null,
  notifications: [],
};

// ==================== STORE IMPLEMENTATION ====================

// Simple store implementation (can be integrated with Zustand)
class WorkflowStore {
  private state: WorkflowState = { ...initialState };
  private listeners: Set<(state: WorkflowState) => void> = new Set();

  getState(): WorkflowState {
    return this.state;
  }

  private setState(updates: Partial<WorkflowState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (state: WorkflowState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ==================== WORKFLOW CRUD ====================

  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const now = Date.now();
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateId('wf'),
      createdAt: now,
      updatedAt: now,
    };

    this.setState({
      workflows: [...this.state.workflows, newWorkflow],
    });

    this.addNotification('success', `Workflow "${newWorkflow.name}" created`);
    return newWorkflow;
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): void {
    const workflows = this.state.workflows.map((wf) =>
      wf.id === id ? { ...wf, ...updates, updatedAt: Date.now() } : wf
    );

    this.setState({ workflows });
  }

  deleteWorkflow(id: string): void {
    const workflow = this.state.workflows.find((wf) => wf.id === id);
    if (!workflow) return;

    this.setState({
      workflows: this.state.workflows.filter((wf) => wf.id !== id),
      activeWorkflowId: this.state.activeWorkflowId === id ? null : this.state.activeWorkflowId,
      executions: this.state.executions.filter((e) => e.workflowId !== id),
    });

    this.addNotification('info', `Workflow "${workflow.name}" deleted`);
  }

  duplicateWorkflow(id: string): Workflow {
    const original = this.state.workflows.find((wf) => wf.id === id);
    if (!original) {
      throw new Error(`Workflow ${id} not found`);
    }

    const duplicate = this.createWorkflow({
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft',
    });

    return duplicate;
  }

  setActiveWorkflow(id: string | null): void {
    this.setState({
      activeWorkflowId: id,
      selectedNodeId: null,
      editorMode: 'view',
    });
  }

  // ==================== WORKFLOW STATUS ====================

  activateWorkflow(id: string): void {
    this.updateWorkflow(id, { status: 'active' });
    this.addNotification('success', 'Workflow activated');
  }

  pauseWorkflow(id: string): void {
    this.updateWorkflow(id, { status: 'paused' });
    this.addNotification('info', 'Workflow paused');
  }

  archiveWorkflow(id: string): void {
    this.updateWorkflow(id, { status: 'archived' });
    this.addNotification('info', 'Workflow archived');
  }

  // ==================== NODE OPERATIONS ====================

  addNode(workflowId: string, node: Omit<WorkflowNode, 'id'>): WorkflowNode {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const newNode: WorkflowNode = {
      ...node,
      id: this.generateId('node'),
    };

    this.updateWorkflow(workflowId, {
      nodes: [...workflow.nodes, newNode],
    });

    return newNode;
  }

  updateNode(workflowId: string, nodeId: string, updates: Partial<WorkflowNode>): void {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    this.updateWorkflow(workflowId, {
      nodes: workflow.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    });
  }

  deleteNode(workflowId: string, nodeId: string): void {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    this.updateWorkflow(workflowId, {
      nodes: workflow.nodes.filter((n) => n.id !== nodeId),
      edges: workflow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    });

    if (this.state.selectedNodeId === nodeId) {
      this.setState({ selectedNodeId: null });
    }
  }

  selectNode(nodeId: string | null): void {
    this.setState({ selectedNodeId: nodeId });
  }

  copyNode(node: WorkflowNode): void {
    this.setState({ clipboard: { ...node } });
  }

  pasteNode(workflowId: string, position: { x: number; y: number }): WorkflowNode | null {
    if (!this.state.clipboard) return null;

    return this.addNode(workflowId, {
      ...this.state.clipboard,
      name: `${this.state.clipboard.name} (Copy)`,
      position,
    });
  }

  // ==================== EDGE OPERATIONS ====================

  addEdge(workflowId: string, edge: Omit<WorkflowEdge, 'id'>): WorkflowEdge {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Check if edge already exists
    const exists = workflow.edges.some(
      (e) => e.source === edge.source && e.target === edge.target
    );
    if (exists) {
      throw new Error('Edge already exists');
    }

    const newEdge: WorkflowEdge = {
      ...edge,
      id: this.generateId('edge'),
    };

    this.updateWorkflow(workflowId, {
      edges: [...workflow.edges, newEdge],
    });

    return newEdge;
  }

  updateEdge(workflowId: string, edgeId: string, updates: Partial<WorkflowEdge>): void {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    this.updateWorkflow(workflowId, {
      edges: workflow.edges.map((e) => (e.id === edgeId ? { ...e, ...updates } : e)),
    });
  }

  deleteEdge(workflowId: string, edgeId: string): void {
    const workflow = this.state.workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    this.updateWorkflow(workflowId, {
      edges: workflow.edges.filter((e) => e.id !== edgeId),
    });
  }

  // ==================== EXECUTION ====================

  async executeWorkflow(
    id: string,
    triggerData?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const workflow = this.state.workflows.find((wf) => wf.id === id);
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }

    this.setState({ isLoading: true, error: null });
    this.addNotification('info', `Executing workflow "${workflow.name}"...`);

    try {
      const execution = await workflowEngine.execute(workflow, triggerData);

      this.setState({
        executions: [...this.state.executions, execution],
        activeExecutionId: execution.id,
        isLoading: false,
      });

      // Update workflow last run time
      this.updateWorkflow(id, { lastRunAt: execution.completedAt });

      if (execution.status === 'completed') {
        this.addNotification('success', `Workflow completed successfully`);
      } else if (execution.status === 'failed') {
        this.addNotification('error', `Workflow failed: ${execution.error?.message}`);
      }

      return execution;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.setState({ isLoading: false, error: message });
      this.addNotification('error', `Execution failed: ${message}`);
      throw error;
    }
  }

  cancelExecution(executionId: string): void {
    const cancelled = workflowEngine.cancel(executionId);
    if (cancelled) {
      this.setState({
        executions: this.state.executions.map((e) =>
          e.id === executionId
            ? { ...e, status: 'cancelled', completedAt: Date.now() }
            : e
        ),
      });
      this.addNotification('info', 'Execution cancelled');
    }
  }

  clearExecutions(workflowId: string): void {
    this.setState({
      executions: this.state.executions.filter((e) => e.workflowId !== workflowId),
    });
  }

  // ==================== INTEGRATIONS ====================

  refreshIntegrations(): void {
    this.setState({
      integrations: integrationRegistry.getAll(),
    });
  }

  async connectIntegration(id: string, credentials: unknown): Promise<void> {
    try {
      // In production, this would handle OAuth flow or API key validation
      await integrationRegistry.connect(id, credentials as any);
      this.refreshIntegrations();
      this.addNotification('success', 'Integration connected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      this.addNotification('error', message);
      throw error;
    }
  }

  disconnectIntegration(id: string): void {
    integrationRegistry.disconnect(id);
    this.refreshIntegrations();
    this.addNotification('info', 'Integration disconnected');
  }

  // ==================== UI ====================

  setEditorMode(mode: 'view' | 'edit' | 'execute'): void {
    this.setState({ editorMode: mode });
  }

  setLoading(loading: boolean): void {
    this.setState({ isLoading: loading });
  }

  setError(error: string | null): void {
    this.setState({ error });
  }

  addNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ): void {
    const notification = {
      id: this.generateId('notif'),
      type,
      message,
      timestamp: Date.now(),
    };

    this.setState({
      notifications: [...this.state.notifications, notification],
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: string): void {
    this.setState({
      notifications: this.state.notifications.filter((n) => n.id !== id),
    });
  }

  clearNotifications(): void {
    this.setState({ notifications: [] });
  }

  // ==================== SELECTORS ====================

  getActiveWorkflow(): Workflow | undefined {
    return this.state.workflows.find((wf) => wf.id === this.state.activeWorkflowId);
  }

  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return this.state.executions.filter((e) => e.workflowId === workflowId);
  }

  getConnectedIntegrations(): Integration[] {
    return this.state.integrations.filter((i) => i.status === 'connected');
  }

  getSelectedNode(): WorkflowNode | undefined {
    const workflow = this.getActiveWorkflow();
    return workflow?.nodes.find((n) => n.id === this.state.selectedNodeId);
  }
}

// Singleton instance
export const workflowStore = new WorkflowStore();

// ==================== REACT HOOKS ====================

import { useState, useEffect, useCallback } from 'react';

export function useWorkflowStore() {
  const [state, setState] = useState(workflowStore.getState());

  useEffect(() => {
    return workflowStore.subscribe(setState);
  }, []);

  return {
    ...state,
    // Actions
    createWorkflow: workflowStore.createWorkflow.bind(workflowStore),
    updateWorkflow: workflowStore.updateWorkflow.bind(workflowStore),
    deleteWorkflow: workflowStore.deleteWorkflow.bind(workflowStore),
    duplicateWorkflow: workflowStore.duplicateWorkflow.bind(workflowStore),
    setActiveWorkflow: workflowStore.setActiveWorkflow.bind(workflowStore),
    activateWorkflow: workflowStore.activateWorkflow.bind(workflowStore),
    pauseWorkflow: workflowStore.pauseWorkflow.bind(workflowStore),
    archiveWorkflow: workflowStore.archiveWorkflow.bind(workflowStore),
    addNode: workflowStore.addNode.bind(workflowStore),
    updateNode: workflowStore.updateNode.bind(workflowStore),
    deleteNode: workflowStore.deleteNode.bind(workflowStore),
    selectNode: workflowStore.selectNode.bind(workflowStore),
    copyNode: workflowStore.copyNode.bind(workflowStore),
    pasteNode: workflowStore.pasteNode.bind(workflowStore),
    addEdge: workflowStore.addEdge.bind(workflowStore),
    updateEdge: workflowStore.updateEdge.bind(workflowStore),
    deleteEdge: workflowStore.deleteEdge.bind(workflowStore),
    executeWorkflow: workflowStore.executeWorkflow.bind(workflowStore),
    cancelExecution: workflowStore.cancelExecution.bind(workflowStore),
    clearExecutions: workflowStore.clearExecutions.bind(workflowStore),
    refreshIntegrations: workflowStore.refreshIntegrations.bind(workflowStore),
    connectIntegration: workflowStore.connectIntegration.bind(workflowStore),
    disconnectIntegration: workflowStore.disconnectIntegration.bind(workflowStore),
    setEditorMode: workflowStore.setEditorMode.bind(workflowStore),
    setLoading: workflowStore.setLoading.bind(workflowStore),
    setError: workflowStore.setError.bind(workflowStore),
    addNotification: workflowStore.addNotification.bind(workflowStore),
    removeNotification: workflowStore.removeNotification.bind(workflowStore),
    clearNotifications: workflowStore.clearNotifications.bind(workflowStore),
    // Selectors
    getActiveWorkflow: workflowStore.getActiveWorkflow.bind(workflowStore),
    getWorkflowExecutions: workflowStore.getWorkflowExecutions.bind(workflowStore),
    getConnectedIntegrations: workflowStore.getConnectedIntegrations.bind(workflowStore),
    getSelectedNode: workflowStore.getSelectedNode.bind(workflowStore),
  };
}

// Hook for specific workflow
export function useWorkflow(id: string) {
  const store = useWorkflowStore();
  const workflow = store.workflows.find((wf) => wf.id === id);
  const executions = store.getWorkflowExecutions(id);

  return {
    workflow,
    executions,
    isLoading: store.isLoading,
    error: store.error,
    update: useCallback(
      (updates: Partial<Workflow>) => store.updateWorkflow(id, updates),
      [id, store]
    ),
    execute: useCallback(
      (data?: Record<string, unknown>) => store.executeWorkflow(id, data),
      [id, store]
    ),
    activate: useCallback(() => store.activateWorkflow(id), [id, store]),
    pause: useCallback(() => store.pauseWorkflow(id), [id, store]),
    archive: useCallback(() => store.archiveWorkflow(id), [id, store]),
    delete: useCallback(() => store.deleteWorkflow(id), [id, store]),
  };
}

// Hook for integrations
export function useIntegrations() {
  const store = useWorkflowStore();

  return {
    integrations: store.integrations,
    connected: store.getConnectedIntegrations(),
    refresh: store.refreshIntegrations,
    connect: store.connectIntegration,
    disconnect: store.disconnectIntegration,
  };
}
