/**
 * useSubscription Hook
 * 
 * Provides easy access to subscription state and quota checking.
 * Use this hook in components that need to check or enforce limits.
 */

import { useMemo, useCallback } from 'react';
import { 
  useSubscriptionStore, 
  SUBSCRIPTION_PLANS,
  isToolAccessible as checkToolAccessible,
  getToolLimits as getToolLimitsHelper,
  formatLimit,
  formatStorage,
  type SubscriptionPlanId,
} from '@/lib/subscription';

export interface ToolAccessResult {
  accessible: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionPlanId;
  limits?: unknown;
  usage?: {
    current: number;
    max: number;
    percentage: number;
  };
}

export function useSubscription() {
  const store = useSubscriptionStore();
  
  const currentPlan = store.currentPlan;
  const planInfo = SUBSCRIPTION_PLANS[currentPlan];
  const limits = planInfo.limits;
  
  /**
   * Check if user can access a specific tool
   */
  const checkToolAccess = useCallback((toolId: string): ToolAccessResult => {
    const accessCheck = checkToolAccessible(toolId, currentPlan);
    const toolLimits = getToolLimitsHelper(toolId, currentPlan);
    
    return {
      ...accessCheck,
      limits: toolLimits,
    };
  }, [currentPlan]);
  
  /**
   * Check if user can perform an action (increment quota)
   * Returns false if quota would be exceeded
   */
  const canUseChat = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];
    let currentUsage = store.usage.chatMessagesToday;
    
    if (store.usage.lastDailyReset !== today) {
      currentUsage = 0;
    }
    
    return limits.aurionChat.maxMessagesPerDay === Infinity || 
           currentUsage < limits.aurionChat.maxMessagesPerDay;
  }, [store.usage, limits]);
  
  const canUseAgentAI = useCallback((): boolean => {
    if (!limits.agentAI.enabled) return false;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    let currentUsage = store.usage.agentAIRequestsThisMonth;
    
    if (store.usage.lastMonthlyReset !== currentMonth) {
      currentUsage = 0;
    }
    
    return limits.agentAI.maxRequestsPerMonth === Infinity ||
           currentUsage < limits.agentAI.maxRequestsPerMonth;
  }, [store.usage, limits]);
  
  const canCreateCanvas = useCallback((): boolean => {
    return limits.intelligentCanvas.maxBoards === Infinity ||
           store.usage.canvasBoardsCount < limits.intelligentCanvas.maxBoards;
  }, [store.usage, limits]);
  
  const canCreateWorkflow = useCallback((): boolean => {
    if (!limits.workflow.enabled) return false;
    return limits.workflow.maxWorkflows === Infinity ||
           store.usage.workflowsCount < limits.workflow.maxWorkflows;
  }, [store.usage, limits]);
  
  const canCreateProject = useCallback((): boolean => {
    return limits.maxProjects === Infinity ||
           store.usage.projectsCount < limits.maxProjects;
  }, [store.usage, limits]);
  
  const canAddStorage = useCallback((mb: number): boolean => {
    return limits.maxStorageMB === Infinity ||
           store.usage.storageUsedMB + mb <= limits.maxStorageMB;
  }, [store.usage, limits]);
  
  /**
   * Get usage info for display
   */
  const getUsageInfo = useMemo(() => ({
    chat: {
      current: store.usage.chatMessagesToday,
      max: limits.aurionChat.maxMessagesPerDay,
      formatted: `${store.usage.chatMessagesToday}/${formatLimit(limits.aurionChat.maxMessagesPerDay)}`,
      percentage: store.getUsagePercentage('chat'),
    },
    agentAI: {
      current: store.usage.agentAIRequestsThisMonth,
      max: limits.agentAI.maxRequestsPerMonth,
      formatted: `${store.usage.agentAIRequestsThisMonth}/${formatLimit(limits.agentAI.maxRequestsPerMonth)}`,
      percentage: store.getUsagePercentage('agentAI'),
      enabled: limits.agentAI.enabled,
    },
    canvas: {
      current: store.usage.canvasBoardsCount,
      max: limits.intelligentCanvas.maxBoards,
      formatted: `${store.usage.canvasBoardsCount}/${formatLimit(limits.intelligentCanvas.maxBoards)}`,
      percentage: store.getUsagePercentage('canvas'),
    },
    workflows: {
      current: store.usage.workflowsCount,
      max: limits.workflow.maxWorkflows,
      formatted: `${store.usage.workflowsCount}/${formatLimit(limits.workflow.maxWorkflows)}`,
      percentage: store.getUsagePercentage('workflows'),
      enabled: limits.workflow.enabled,
    },
    projects: {
      current: store.usage.projectsCount,
      max: limits.maxProjects,
      formatted: `${store.usage.projectsCount}/${formatLimit(limits.maxProjects)}`,
      percentage: store.getUsagePercentage('projects'),
    },
    storage: {
      current: store.usage.storageUsedMB,
      max: limits.maxStorageMB,
      formatted: `${formatStorage(store.usage.storageUsedMB)}/${formatStorage(limits.maxStorageMB)}`,
      percentage: store.getUsagePercentage('storage'),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [store.usage, limits, store.getUsagePercentage]);
  
  /**
   * Perform an action with quota check
   */
  const useChat = useCallback(() => store.incrementChatMessages(), [store]);
  const useAgentAI = useCallback(() => store.incrementAgentAIRequests(), [store]);
  const createCanvas = useCallback(() => store.incrementCanvasBoards(), [store]);
  const createWorkflow = useCallback(() => store.incrementWorkflows(), [store]);
  const createProject = useCallback(() => store.incrementProjects(), [store]);
  const addStorage = useCallback((mb: number) => store.addStorageUsed(mb), [store]);
  
  return {
    // Plan info
    currentPlan,
    planInfo,
    limits,
    
    // Access checks
    checkToolAccess,
    
    // Quota checks (read-only)
    canUseChat,
    canUseAgentAI,
    canCreateCanvas,
    canCreateWorkflow,
    canCreateProject,
    canAddStorage,
    
    // Usage info
    usage: store.usage,
    getUsageInfo,
    
    // Actions (with quota enforcement)
    useChat,
    useAgentAI,
    createCanvas,
    createWorkflow,
    createProject,
    addStorage,
    
    // Plan management
    setPlan: store.setPlan,
    
    // Reset functions
    resetDailyUsage: store.resetDailyUsage,
    resetMonthlyUsage: store.resetMonthlyUsage,
  };
}

export default useSubscription;
