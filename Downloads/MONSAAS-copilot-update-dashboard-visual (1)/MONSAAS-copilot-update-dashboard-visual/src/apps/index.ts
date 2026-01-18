/**
 * Micro-Frontend Apps Registry
 * 
 * This module defines the micro-frontend architecture for Aurion Studio.
 * Each app can be independently developed, tested, and deployed.
 * 
 * Architecture:
 * - apps/dashboard: Main dashboard application
 * - apps/code-editor: Code editing functionality
 * - apps/app-builder: Visual application builder
 * - apps/agent-ai: AI assistant functionality
 * - apps/chat: Real-time communication
 * - apps/text-editor: Text editing functionality
 */

export interface MicroApp {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  enabled: boolean;
  loadComponent: () => Promise<{ default: React.ComponentType }>;
}

// ============================================================================
// App Registry
// ============================================================================

export const appRegistry: Record<string, MicroApp> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with analytics and overview',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    enabled: true,
    loadComponent: () => import('@/pages/Dashboard'),
  },
  
  'code-editor': {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Full-featured code editing environment',
    path: '/code-editor',
    icon: 'Code',
    enabled: true,
    loadComponent: () => import('@/pages/CodeEditor'),
  },
  
  'app-builder': {
    id: 'app-builder',
    name: 'App Builder',
    description: 'Visual application builder',
    path: '/app-builder',
    icon: 'Layers',
    enabled: true,
    loadComponent: () => import('@/pages/AppBuilder'),
  },
  
  'agent-ai': {
    id: 'agent-ai',
    name: 'Agent AI',
    description: 'AI-powered development assistant',
    path: '/agent-ai',
    icon: 'Bot',
    enabled: true,
    loadComponent: () => import('@/pages/AgentAI'),
  },
  
  'aurion-chat': {
    id: 'aurion-chat',
    name: 'Aurion Chat',
    description: 'Real-time team communication',
    path: '/aurion-chat',
    icon: 'MessageSquare',
    enabled: true,
    loadComponent: () => import('@/pages/AurionChat'),
  },
  
  'text-editor': {
    id: 'text-editor',
    name: 'Text Editor',
    description: 'Rich text editing capabilities',
    path: '/text-editor',
    icon: 'FileText',
    enabled: true,
    loadComponent: () => import('@/pages/TextEditor'),
  },
};

// ============================================================================
// App Utilities
// ============================================================================

/**
 * Get all enabled apps
 */
export function getEnabledApps(): MicroApp[] {
  return Object.values(appRegistry).filter((app) => app.enabled);
}

/**
 * Get app by ID
 */
export function getAppById(id: string): MicroApp | undefined {
  return appRegistry[id];
}

/**
 * Get app by path
 */
export function getAppByPath(path: string): MicroApp | undefined {
  return Object.values(appRegistry).find((app) => app.path === path);
}

/**
 * Check if an app is enabled
 */
export function isAppEnabled(id: string): boolean {
  return appRegistry[id]?.enabled ?? false;
}

// ============================================================================
// Shared Module Registry (for micro-frontend communication)
// ============================================================================

export interface SharedModule {
  id: string;
  name: string;
  exports: Record<string, unknown>;
}

const sharedModules: Map<string, SharedModule> = new Map();

/**
 * Register a shared module
 */
export function registerSharedModule(module: SharedModule): void {
  sharedModules.set(module.id, module);
}

/**
 * Get a shared module
 */
export function getSharedModule(id: string): SharedModule | undefined {
  return sharedModules.get(id);
}

/**
 * Get all shared modules
 */
export function getAllSharedModules(): SharedModule[] {
  return Array.from(sharedModules.values());
}

// ============================================================================
// Event Bus for Inter-App Communication
// ============================================================================

type EventCallback = (data: unknown) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const callbacks = this.listeners.get(event);
    callbacks?.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }
}

export const eventBus = new EventBus();

// ============================================================================
// App Events
// ============================================================================

export const AppEvents = {
  // Navigation
  NAVIGATE: 'app:navigate',
  ROUTE_CHANGED: 'app:route-changed',
  
  // User
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
  
  // Dashboard
  DASHBOARD_REFRESH: 'dashboard:refresh',
  STATS_UPDATED: 'dashboard:stats-updated',
  
  // Projects
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  
  // Notifications
  NOTIFICATION_RECEIVED: 'notification:received',
  
  // Tools
  TOOL_STATUS_CHANGED: 'tool:status-changed',
} as const;

export default {
  appRegistry,
  getEnabledApps,
  getAppById,
  getAppByPath,
  isAppEnabled,
  registerSharedModule,
  getSharedModule,
  getAllSharedModules,
  eventBus,
  AppEvents,
};
