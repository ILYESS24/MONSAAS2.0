/**
 * Subscription System
 * 
 * Manages subscription plans, quotas, and usage tracking.
 * Enforces limits based on user's subscription level.
 * 
 * @module subscription
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type SubscriptionPlanId = 'free' | 'creator' | 'pro' | 'enterprise';

export interface PlanLimits {
  // Projects
  maxProjects: number;
  // Storage in MB
  maxStorageMB: number;
  
  // Tool-specific limits
  codeEditor: {
    enabled: boolean;
    readOnly: boolean;
    aiAutocomplete: boolean;
    githubSync: boolean;
    linting: boolean;
    formatting: boolean;
    multiFile: boolean;
    collaboration: boolean;
  };
  textEditor: {
    enabled: boolean;
    features: 'basic' | 'standard' | 'full';
    exportFormats: string[];
    aiWritingAssist: boolean;
    collaboration: boolean;
    versionHistory: boolean;
  };
  intelligentCanvas: {
    enabled: boolean;
    maxBoards: number;
    maxElementsPerBoard: number;
    exportFormats: string[];
    collaboration: boolean;
    templates: boolean;
  };
  aurionChat: {
    enabled: boolean;
    maxMessagesPerDay: number;
    advancedModels: boolean;
    contextMemory: boolean;
    codeExecution: boolean;
    fileAttachments: boolean;
  };
  agentAI: {
    enabled: boolean;
    maxRequestsPerMonth: number;
    advancedModels: boolean;
    codeGeneration: boolean;
    codeReview: boolean;
    fineTuning: boolean;
    customInstructions: boolean;
    batchProcessing: boolean;
  };
  appBuilder: {
    enabled: boolean;
    features: 'none' | 'prototype' | 'deploy' | 'enterprise';
    maxApps: number;
    customDomains: boolean;
    apiIntegrations: boolean;
    analytics: boolean;
    whiteLabel: boolean;
  };
  workflow: {
    enabled: boolean;
    maxWorkflows: number;
    maxStepsPerWorkflow: number;
    scheduling: boolean;
    webhooks: boolean;
    advancedConditions: boolean;
    parallelExecution: boolean;
  };
  monitoring: {
    enabled: boolean;
    maxEndpoints: number;
    alertsEnabled: boolean;
    customAlerts: boolean;
    apiAccess: boolean;
    historicalData: number; // days
  };
  
  // Additional features
  support: {
    level: 'community' | 'email' | 'priority' | 'dedicated';
    responseTime: string;
    phone: boolean;
    slack: boolean;
  };
  security: {
    sso: boolean;
    saml: boolean;
    scim: boolean;
    auditLogs: boolean;
    ipWhitelist: boolean;
    customRoles: boolean;
    mfa: boolean;
  };
  integrations: {
    maxIntegrations: number;
    premiumIntegrations: boolean;
    customWebhooks: boolean;
    apiAccess: boolean;
    rateLimitPerMinute: number;
  };
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  displayName: string;
  price: number;
  yearlyPrice: number;
  period: 'month' | 'year';
  limits: PlanLimits;
  badge?: string;
  highlighted?: boolean;
  enterprise?: boolean;
}

export interface UsageData {
  // Current period usage
  projectsCount: number;
  storageUsedMB: number;
  
  // Daily/Monthly usage
  chatMessagesToday: number;
  agentAIRequestsThisMonth: number;
  canvasBoardsCount: number;
  workflowsCount: number;
  appsCount: number;
  integrationsCount: number;
  
  // Last reset dates
  lastDailyReset: string; // ISO date
  lastMonthlyReset: string; // ISO date
}

// ============================================================================
// Plan Configurations
// ============================================================================

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Découverte',
    displayName: 'Découverte',
    price: 0,
    yearlyPrice: 0,
    period: 'month',
    limits: {
      maxProjects: 2,
      maxStorageMB: 500,
      codeEditor: {
        enabled: true,
        readOnly: true,
        aiAutocomplete: false,
        githubSync: false,
        linting: true,
        formatting: true,
        multiFile: false,
        collaboration: false,
      },
      textEditor: {
        enabled: true,
        features: 'basic',
        exportFormats: ['txt'],
        aiWritingAssist: false,
        collaboration: false,
        versionHistory: false,
      },
      intelligentCanvas: {
        enabled: true,
        maxBoards: 3,
        maxElementsPerBoard: 50,
        exportFormats: ['png'],
        collaboration: false,
        templates: false,
      },
      aurionChat: {
        enabled: true,
        maxMessagesPerDay: 10,
        advancedModels: false,
        contextMemory: false,
        codeExecution: false,
        fileAttachments: false,
      },
      agentAI: {
        enabled: false,
        maxRequestsPerMonth: 0,
        advancedModels: false,
        codeGeneration: false,
        codeReview: false,
        fineTuning: false,
        customInstructions: false,
        batchProcessing: false,
      },
      appBuilder: {
        enabled: false,
        features: 'none',
        maxApps: 0,
        customDomains: false,
        apiIntegrations: false,
        analytics: false,
        whiteLabel: false,
      },
      workflow: {
        enabled: false,
        maxWorkflows: 0,
        maxStepsPerWorkflow: 0,
        scheduling: false,
        webhooks: false,
        advancedConditions: false,
        parallelExecution: false,
      },
      monitoring: {
        enabled: false,
        maxEndpoints: 0,
        alertsEnabled: false,
        customAlerts: false,
        apiAccess: false,
        historicalData: 0,
      },
      support: {
        level: 'community',
        responseTime: '72h',
        phone: false,
        slack: false,
      },
      security: {
        sso: false,
        saml: false,
        scim: false,
        auditLogs: false,
        ipWhitelist: false,
        customRoles: false,
        mfa: false,
      },
      integrations: {
        maxIntegrations: 2,
        premiumIntegrations: false,
        customWebhooks: false,
        apiAccess: false,
        rateLimitPerMinute: 10,
      },
    },
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    displayName: 'Creator',
    price: 12,
    yearlyPrice: 120, // 2 months free
    period: 'month',
    badge: '💰 Meilleur rapport',
    limits: {
      maxProjects: 10,
      maxStorageMB: 5120, // 5 Go
      codeEditor: {
        enabled: true,
        readOnly: false,
        aiAutocomplete: true,
        githubSync: false,
        linting: true,
        formatting: true,
        multiFile: true,
        collaboration: false,
      },
      textEditor: {
        enabled: true,
        features: 'standard',
        exportFormats: ['txt', 'pdf', 'png'],
        aiWritingAssist: true,
        collaboration: false,
        versionHistory: true,
      },
      intelligentCanvas: {
        enabled: true,
        maxBoards: 10,
        maxElementsPerBoard: 200,
        exportFormats: ['png', 'svg', 'pdf'],
        collaboration: false,
        templates: true,
      },
      aurionChat: {
        enabled: true,
        maxMessagesPerDay: 100,
        advancedModels: false,
        contextMemory: true,
        codeExecution: false,
        fileAttachments: true,
      },
      agentAI: {
        enabled: true,
        maxRequestsPerMonth: 50,
        advancedModels: false,
        codeGeneration: true,
        codeReview: false,
        fineTuning: false,
        customInstructions: false,
        batchProcessing: false,
      },
      appBuilder: {
        enabled: true,
        features: 'prototype',
        maxApps: 3,
        customDomains: false,
        apiIntegrations: false,
        analytics: false,
        whiteLabel: false,
      },
      workflow: {
        enabled: false,
        maxWorkflows: 0,
        maxStepsPerWorkflow: 0,
        scheduling: false,
        webhooks: false,
        advancedConditions: false,
        parallelExecution: false,
      },
      monitoring: {
        enabled: false,
        maxEndpoints: 0,
        alertsEnabled: false,
        customAlerts: false,
        apiAccess: false,
        historicalData: 0,
      },
      support: {
        level: 'email',
        responseTime: '24h',
        phone: false,
        slack: false,
      },
      security: {
        sso: false,
        saml: false,
        scim: false,
        auditLogs: false,
        ipWhitelist: false,
        customRoles: false,
        mfa: true,
      },
      integrations: {
        maxIntegrations: 5,
        premiumIntegrations: false,
        customWebhooks: true,
        apiAccess: false,
        rateLimitPerMinute: 30,
      },
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro',
    price: 39,
    yearlyPrice: 390, // 2 months free
    period: 'month',
    badge: '⚡ 73% choisissent ce plan',
    highlighted: true,
    limits: {
      maxProjects: Infinity,
      maxStorageMB: 51200, // 50 Go
      codeEditor: {
        enabled: true,
        readOnly: false,
        aiAutocomplete: true,
        githubSync: true,
        linting: true,
        formatting: true,
        multiFile: true,
        collaboration: true,
      },
      textEditor: {
        enabled: true,
        features: 'full',
        exportFormats: ['txt', 'pdf', 'png', 'docx', 'html'],
        aiWritingAssist: true,
        collaboration: true,
        versionHistory: true,
      },
      intelligentCanvas: {
        enabled: true,
        maxBoards: Infinity,
        maxElementsPerBoard: 1000,
        exportFormats: ['png', 'svg', 'pdf', 'json'],
        collaboration: true,
        templates: true,
      },
      aurionChat: {
        enabled: true,
        maxMessagesPerDay: Infinity,
        advancedModels: true,
        contextMemory: true,
        codeExecution: true,
        fileAttachments: true,
      },
      agentAI: {
        enabled: true,
        maxRequestsPerMonth: 500,
        advancedModels: true,
        codeGeneration: true,
        codeReview: true,
        fineTuning: false,
        customInstructions: true,
        batchProcessing: false,
      },
      appBuilder: {
        enabled: true,
        features: 'deploy',
        maxApps: 10,
        customDomains: true,
        apiIntegrations: true,
        analytics: true,
        whiteLabel: false,
      },
      workflow: {
        enabled: true,
        maxWorkflows: 20,
        maxStepsPerWorkflow: 50,
        scheduling: true,
        webhooks: true,
        advancedConditions: true,
        parallelExecution: false,
      },
      monitoring: {
        enabled: true,
        maxEndpoints: 20,
        alertsEnabled: true,
        customAlerts: true,
        apiAccess: false,
        historicalData: 30,
      },
      support: {
        level: 'priority',
        responseTime: '4h',
        phone: false,
        slack: true,
      },
      security: {
        sso: true,
        saml: false,
        scim: false,
        auditLogs: true,
        ipWhitelist: false,
        customRoles: false,
        mfa: true,
      },
      integrations: {
        maxIntegrations: 20,
        premiumIntegrations: true,
        customWebhooks: true,
        apiAccess: true,
        rateLimitPerMinute: 100,
      },
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise',
    price: 149,
    yearlyPrice: 1490, // 2 months free
    period: 'month',
    badge: 'SLA 99.9%',
    enterprise: true,
    limits: {
      maxProjects: Infinity,
      maxStorageMB: Infinity,
      codeEditor: {
        enabled: true,
        readOnly: false,
        aiAutocomplete: true,
        githubSync: true,
        linting: true,
        formatting: true,
        multiFile: true,
        collaboration: true,
      },
      textEditor: {
        enabled: true,
        features: 'full',
        exportFormats: ['txt', 'pdf', 'png', 'docx', 'html', 'md', 'odt'],
        aiWritingAssist: true,
        collaboration: true,
        versionHistory: true,
      },
      intelligentCanvas: {
        enabled: true,
        maxBoards: Infinity,
        maxElementsPerBoard: Infinity,
        exportFormats: ['png', 'svg', 'pdf', 'json', 'figma'],
        collaboration: true,
        templates: true,
      },
      aurionChat: {
        enabled: true,
        maxMessagesPerDay: Infinity,
        advancedModels: true,
        contextMemory: true,
        codeExecution: true,
        fileAttachments: true,
      },
      agentAI: {
        enabled: true,
        maxRequestsPerMonth: Infinity,
        advancedModels: true,
        codeGeneration: true,
        codeReview: true,
        fineTuning: true,
        customInstructions: true,
        batchProcessing: true,
      },
      appBuilder: {
        enabled: true,
        features: 'enterprise',
        maxApps: Infinity,
        customDomains: true,
        apiIntegrations: true,
        analytics: true,
        whiteLabel: true,
      },
      workflow: {
        enabled: true,
        maxWorkflows: Infinity,
        maxStepsPerWorkflow: Infinity,
        scheduling: true,
        webhooks: true,
        advancedConditions: true,
        parallelExecution: true,
      },
      monitoring: {
        enabled: true,
        maxEndpoints: Infinity,
        alertsEnabled: true,
        customAlerts: true,
        apiAccess: true,
        historicalData: 365,
      },
      support: {
        level: 'dedicated',
        responseTime: '1h',
        phone: true,
        slack: true,
      },
      security: {
        sso: true,
        saml: true,
        scim: true,
        auditLogs: true,
        ipWhitelist: true,
        customRoles: true,
        mfa: true,
      },
      integrations: {
        maxIntegrations: Infinity,
        premiumIntegrations: true,
        customWebhooks: true,
        apiAccess: true,
        rateLimitPerMinute: 1000,
      },
    },
  },
};

// ============================================================================
// Subscription Store
// ============================================================================

interface SubscriptionState {
  // Current plan
  currentPlan: SubscriptionPlanId;
  planStartDate: string | null;
  planEndDate: string | null;
  
  // Usage tracking
  usage: UsageData;
  
  // Actions
  setPlan: (planId: SubscriptionPlanId) => void;
  incrementChatMessages: () => boolean;
  incrementAgentAIRequests: () => boolean;
  incrementCanvasBoards: () => boolean;
  incrementWorkflows: () => boolean;
  incrementProjects: () => boolean;
  addStorageUsed: (mb: number) => boolean;
  resetDailyUsage: () => void;
  resetMonthlyUsage: () => void;
  getUsagePercentage: (type: 'chat' | 'agentAI' | 'projects' | 'storage' | 'canvas' | 'workflows') => number;
}

const initialUsage: UsageData = {
  projectsCount: 0,
  storageUsedMB: 0,
  chatMessagesToday: 0,
  agentAIRequestsThisMonth: 0,
  canvasBoardsCount: 0,
  workflowsCount: 0,
  appsCount: 0,
  integrationsCount: 0,
  lastDailyReset: new Date().toISOString().split('T')[0],
  lastMonthlyReset: new Date().toISOString().slice(0, 7), // YYYY-MM
};

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools(
    persist(
      (set, get) => ({
        currentPlan: 'free',
        planStartDate: null,
        planEndDate: null,
        usage: initialUsage,

        setPlan: (planId: SubscriptionPlanId) => {
          const now = new Date();
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1);
          
          set({
            currentPlan: planId,
            planStartDate: now.toISOString(),
            planEndDate: endDate.toISOString(),
          });
        },

        incrementChatMessages: () => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          // Check daily reset
          const today = new Date().toISOString().split('T')[0];
          let currentUsage = state.usage.chatMessagesToday;
          
          if (state.usage.lastDailyReset !== today) {
            currentUsage = 0;
          }
          
          if (limits.aurionChat.maxMessagesPerDay !== Infinity && 
              currentUsage >= limits.aurionChat.maxMessagesPerDay) {
            return false; // Quota exceeded
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              chatMessagesToday: s.usage.lastDailyReset !== today ? 1 : s.usage.chatMessagesToday + 1,
              lastDailyReset: today,
            },
          }));
          
          return true;
        },

        incrementAgentAIRequests: () => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          // Check monthly reset
          const currentMonth = new Date().toISOString().slice(0, 7);
          let currentUsage = state.usage.agentAIRequestsThisMonth;
          
          if (state.usage.lastMonthlyReset !== currentMonth) {
            currentUsage = 0;
          }
          
          if (!limits.agentAI.enabled) {
            return false; // Tool not enabled for this plan
          }
          
          if (limits.agentAI.maxRequestsPerMonth !== Infinity &&
              currentUsage >= limits.agentAI.maxRequestsPerMonth) {
            return false; // Quota exceeded
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              agentAIRequestsThisMonth: s.usage.lastMonthlyReset !== currentMonth ? 1 : s.usage.agentAIRequestsThisMonth + 1,
              lastMonthlyReset: currentMonth,
            },
          }));
          
          return true;
        },

        incrementCanvasBoards: () => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          if (limits.intelligentCanvas.maxBoards !== Infinity &&
              state.usage.canvasBoardsCount >= limits.intelligentCanvas.maxBoards) {
            return false;
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              canvasBoardsCount: s.usage.canvasBoardsCount + 1,
            },
          }));
          
          return true;
        },

        incrementWorkflows: () => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          if (!limits.workflow.enabled) {
            return false;
          }
          
          if (limits.workflow.maxWorkflows !== Infinity &&
              state.usage.workflowsCount >= limits.workflow.maxWorkflows) {
            return false;
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              workflowsCount: s.usage.workflowsCount + 1,
            },
          }));
          
          return true;
        },

        incrementProjects: () => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          if (limits.maxProjects !== Infinity &&
              state.usage.projectsCount >= limits.maxProjects) {
            return false;
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              projectsCount: s.usage.projectsCount + 1,
            },
          }));
          
          return true;
        },

        addStorageUsed: (mb: number) => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          if (limits.maxStorageMB !== Infinity &&
              state.usage.storageUsedMB + mb > limits.maxStorageMB) {
            return false;
          }
          
          set((s) => ({
            usage: {
              ...s.usage,
              storageUsedMB: s.usage.storageUsedMB + mb,
            },
          }));
          
          return true;
        },

        resetDailyUsage: () => {
          const today = new Date().toISOString().split('T')[0];
          set((s) => ({
            usage: {
              ...s.usage,
              chatMessagesToday: 0,
              lastDailyReset: today,
            },
          }));
        },

        resetMonthlyUsage: () => {
          const currentMonth = new Date().toISOString().slice(0, 7);
          set((s) => ({
            usage: {
              ...s.usage,
              agentAIRequestsThisMonth: 0,
              lastMonthlyReset: currentMonth,
            },
          }));
        },

        getUsagePercentage: (type) => {
          const state = get();
          const limits = SUBSCRIPTION_PLANS[state.currentPlan].limits;
          
          switch (type) {
            case 'chat':
              if (limits.aurionChat.maxMessagesPerDay === Infinity) return 0;
              return (state.usage.chatMessagesToday / limits.aurionChat.maxMessagesPerDay) * 100;
            case 'agentAI':
              if (!limits.agentAI.enabled || limits.agentAI.maxRequestsPerMonth === Infinity) return 0;
              return (state.usage.agentAIRequestsThisMonth / limits.agentAI.maxRequestsPerMonth) * 100;
            case 'projects':
              if (limits.maxProjects === Infinity) return 0;
              return (state.usage.projectsCount / limits.maxProjects) * 100;
            case 'storage':
              if (limits.maxStorageMB === Infinity) return 0;
              return (state.usage.storageUsedMB / limits.maxStorageMB) * 100;
            case 'canvas':
              if (limits.intelligentCanvas.maxBoards === Infinity) return 0;
              return (state.usage.canvasBoardsCount / limits.intelligentCanvas.maxBoards) * 100;
            case 'workflows':
              if (!limits.workflow.enabled || limits.workflow.maxWorkflows === Infinity) return 0;
              return (state.usage.workflowsCount / limits.workflow.maxWorkflows) * 100;
            default:
              return 0;
          }
        },
      }),
      {
        name: 'aurion-subscription-storage',
      }
    ),
    { name: 'SubscriptionStore' }
  )
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a tool is accessible for the current plan
 */
export function isToolAccessible(toolId: string, planId: SubscriptionPlanId): { 
  accessible: boolean; 
  reason?: string;
  upgradeRequired?: SubscriptionPlanId;
} {
  const limits = SUBSCRIPTION_PLANS[planId].limits;
  
  switch (toolId) {
    case 'code-editor':
      return { 
        accessible: limits.codeEditor.enabled,
        reason: limits.codeEditor.readOnly ? 'Mode lecture seule - Passez à Creator pour l\'édition' : undefined,
      };
    
    case 'text-editor':
      return { accessible: limits.textEditor.enabled };
    
    case 'intelligent-canvas':
      return { accessible: limits.intelligentCanvas.enabled };
    
    case 'aurion-chat':
      return { accessible: limits.aurionChat.enabled };
    
    case 'agent-ai':
      if (!limits.agentAI.enabled) {
        return { 
          accessible: false, 
          reason: 'Agent AI non disponible dans votre plan',
          upgradeRequired: 'creator',
        };
      }
      return { accessible: true };
    
    case 'app-builder':
      if (!limits.appBuilder.enabled || limits.appBuilder.features === 'none') {
        return { 
          accessible: false, 
          reason: 'App Builder non disponible dans votre plan',
          upgradeRequired: 'creator',
        };
      }
      return { accessible: true };
    
    case 'workflows':
      if (!limits.workflow.enabled) {
        return { 
          accessible: false, 
          reason: 'Workflows non disponibles dans votre plan',
          upgradeRequired: 'pro',
        };
      }
      return { accessible: true };
    
    case 'monitoring':
      if (!limits.monitoring.enabled) {
        return { 
          accessible: false, 
          reason: 'Monitoring Dashboard non disponible dans votre plan',
          upgradeRequired: 'pro',
        };
      }
      return { accessible: true };
    
    default:
      return { accessible: true };
  }
}

/**
 * Get limits for a specific tool
 */
export function getToolLimits(toolId: string, planId: SubscriptionPlanId) {
  const limits = SUBSCRIPTION_PLANS[planId].limits;
  
  switch (toolId) {
    case 'code-editor':
      return limits.codeEditor;
    case 'text-editor':
      return limits.textEditor;
    case 'intelligent-canvas':
      return limits.intelligentCanvas;
    case 'aurion-chat':
      return limits.aurionChat;
    case 'agent-ai':
      return limits.agentAI;
    case 'app-builder':
      return limits.appBuilder;
    case 'workflows':
      return limits.workflow;
    case 'monitoring':
      return limits.monitoring;
    default:
      return null;
  }
}

/**
 * Format limit value for display
 * @param value - The numeric limit value
 * @param isStorage - Whether this is a storage value (in MB)
 */
export function formatLimit(value: number, isStorage: boolean = false): string {
  if (value === Infinity) return 'Illimité';
  if (isStorage && value >= 1024) return `${(value / 1024).toFixed(1)} Go`;
  if (isStorage) return `${value} Mo`;
  return value.toString();
}

/**
 * Format storage value for display
 */
export function formatStorage(mb: number): string {
  if (mb === Infinity) return 'Illimité';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} Go`;
  return `${mb} Mo`;
}

export default {
  SUBSCRIPTION_PLANS,
  useSubscriptionStore,
  isToolAccessible,
  getToolLimits,
  formatLimit,
  formatStorage,
};
