/**
 * Zustand Store - Global State Management
 * 
 * Centralized state management for the application using Zustand.
 * Provides type-safe, performant global state with minimal boilerplate.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'loading';
  lastChecked: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ============================================================================
// App Store - Global application state
// ============================================================================

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Active view/tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Theme
        theme: 'dark',
        setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
        
        // Sidebar
        sidebarOpen: true,
        toggleSidebar: () => set((state: AppState) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        
        // Loading
        isLoading: false,
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        
        // Active tab
        activeTab: 'overview',
        setActiveTab: (tab: string) => set({ activeTab: tab }),
      }),
      {
        name: 'aurion-app-storage',
        partialize: (state: AppState) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    ),
    { name: 'AppStore' }
  )
);

// ============================================================================
// User Store - User-related state
// ============================================================================

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'UserStore' }
  )
);

// ============================================================================
// Dashboard Store - Dashboard-specific state
// ============================================================================

interface DashboardStats {
  totalSales: number;
  activeCampaigns: number;
  weeklyEngagement: number;
  growth: number;
}

interface DashboardState {
  stats: DashboardStats;
  tools: Tool[];
  projects: Project[];
  isRefreshing: boolean;
  lastUpdated: Date | null;
  
  // Actions
  setStats: (stats: DashboardStats) => void;
  setTools: (tools: Tool[]) => void;
  setProjects: (projects: Project[]) => void;
  setRefreshing: (refreshing: boolean) => void;
  updateToolStatus: (toolId: string, status: Tool['status']) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      stats: {
        totalSales: 23000,
        activeCampaigns: 24,
        weeklyEngagement: 70,
        growth: 80,
      },
      tools: [],
      projects: [],
      isRefreshing: false,
      lastUpdated: null,
      
      setStats: (stats: DashboardStats) => set({ stats, lastUpdated: new Date() }),
      setTools: (tools: Tool[]) => set({ tools }),
      setProjects: (projects: Project[]) => set({ projects }),
      setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),
      updateToolStatus: (toolId: string, status: Tool['status']) =>
        set((state: DashboardState) => ({
          tools: state.tools.map((tool: Tool) =>
            tool.id === toolId ? { ...tool, status, lastChecked: new Date() } : tool
          ),
        })),
    }),
    { name: 'DashboardStore' }
  )
);

// ============================================================================
// Notification Store - Notifications state
// ============================================================================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, _get) => ({
        notifications: [],
        unreadCount: 0,
        
        addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
          const newNotification: Notification = {
            ...notification,
            id: typeof crypto !== 'undefined' && crypto.randomUUID 
              ? crypto.randomUUID() 
              : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            read: false,
            createdAt: new Date(),
          };
          set((state: NotificationState) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },
        
        markAsRead: (id: string) =>
          set((state: NotificationState) => {
            const notification = state.notifications.find((n: Notification) => n.id === id);
            if (notification && !notification.read) {
              return {
                notifications: state.notifications.map((n: Notification) =>
                  n.id === id ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
              };
            }
            return state;
          }),
        
        markAllAsRead: () =>
          set((state: NotificationState) => ({
            notifications: state.notifications.map((n: Notification) => ({ ...n, read: true })),
            unreadCount: 0,
          })),
        
        removeNotification: (id: string) =>
          set((state: NotificationState) => {
            const notification = state.notifications.find((n: Notification) => n.id === id);
            return {
              notifications: state.notifications.filter((n: Notification) => n.id !== id),
              unreadCount: notification && !notification.read
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          }),
        
        clearAll: () => set({ notifications: [], unreadCount: 0 }),
      }),
      {
        name: 'aurion-notifications-storage',
      }
    ),
    { name: 'NotificationStore' }
  )
);

// ============================================================================
// Selectors - Optimized state selectors
// ============================================================================

// App selectors
export const selectTheme = (state: AppState) => state.theme;
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen;
export const selectIsLoading = (state: AppState) => state.isLoading;

// User selectors
export const selectUser = (state: UserState) => state.user;
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;

// Dashboard selectors
export const selectStats = (state: DashboardState) => state.stats;
export const selectTools = (state: DashboardState) => state.tools;
export const selectProjects = (state: DashboardState) => state.projects;

// Notification selectors
export const selectNotifications = (state: NotificationState) => state.notifications;
export const selectUnreadCount = (state: NotificationState) => state.unreadCount;
