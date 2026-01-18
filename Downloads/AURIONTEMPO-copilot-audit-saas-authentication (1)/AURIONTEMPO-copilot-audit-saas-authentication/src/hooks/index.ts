/**
 * Hooks Export
 * 
 * Central export point for all custom React hooks.
 */

// Live data hooks
export {
  useLiveStats,
  useLiveActivity,
  useToolStatus,
  useCurrentTime,
  useProjects,
  useTasksDueToday,
  formatRelativeTime,
} from './useLiveData';
export type { LiveStats, LiveActivity, ToolStatus, DashboardProject } from './useLiveData';

// Notification hooks
export {
  useNotifications,
  useToast,
} from './useNotifications';
export type { LocalNotification, ToastNotification } from './useNotifications';

// Search hooks
export {
  useSearch,
  useFilter,
} from './useSearch';
export type { SearchableItem, SearchResult } from './useSearch';

// Analytics hooks
export {
  useAnalytics,
  usePerformanceMonitoring,
} from './useAnalytics';
export type { AnalyticsEvent, PerformanceMetrics } from './useAnalytics';

// Storage hooks
export {
  useLocalStorage,
  useSessionStorage,
} from './useStorage';

// Mobile hook
export { useIsMobile } from './use-mobile';
