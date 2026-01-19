/**
 * React Query Configuration
 * 
 * Centralized configuration for React Query (TanStack Query).
 * Provides type-safe data fetching, caching, and synchronization.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// ============================================================================
// Query Client Configuration
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Cache time - how long inactive data stays in cache (30 minutes)
      gcTime: 30 * 60 * 1000,
      
      // Retry configuration
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// ============================================================================
// Query Keys - Centralized query key management
// ============================================================================

export const queryKeys = {
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activities: () => [...queryKeys.dashboard.all, 'activities'] as const,
    tools: () => [...queryKeys.dashboard.all, 'tools'] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.tasks.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
    dueToday: () => [...queryKeys.tasks.all, 'due-today'] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
} as const;

// ============================================================================
// Query Provider Component
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Invalidate all dashboard queries
 */
export function invalidateDashboard() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

/**
 * Invalidate all project queries
 */
export function invalidateProjects() {
  return queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}

/**
 * Prefetch dashboard data
 * Note: Replace placeholder functions with actual API calls when backend is ready
 */
export async function prefetchDashboard(fetchStats?: () => Promise<unknown>, fetchTools?: () => Promise<unknown>) {
  const prefetchPromises = [];
  
  if (fetchStats) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: fetchStats,
      })
    );
  }
  
  if (fetchTools) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.tools(),
        queryFn: fetchTools,
      })
    );
  }
  
  if (prefetchPromises.length > 0) {
    await Promise.all(prefetchPromises);
  }
}

export default {
  queryClient,
  queryKeys,
  QueryProvider,
  invalidateDashboard,
  invalidateProjects,
  prefetchDashboard,
};
