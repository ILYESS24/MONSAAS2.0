/**
 * Notification Context
 * 
 * Centralized notification and toast management.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };

interface NotificationContextValue {
  state: NotificationState;
  // Notification methods
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  // Toast methods
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  // Convenience toast methods
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// =============================================================================
// REDUCER
// =============================================================================

const initialState: NotificationState = {
  notifications: [],
  toasts: [],
  unreadCount: 0,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    }

    case 'MARK_AS_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
    }

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };

    case 'ADD_TOAST': {
      const newToast: Toast = {
        ...action.payload,
        id: generateId(),
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Track toast timeouts for cleanup
  const toastTimeouts = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Notification methods
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = generateId();
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    logger.debug('Notification added', { type: notification.type, title: notification.title });
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  // Toast methods with proper timeout cleanup
  const hideToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeoutId = toastTimeouts.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      toastTimeouts.current.delete(id);
    }
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    dispatch({ type: 'ADD_TOAST', payload: toast });
    
    // Auto-remove toast after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        toastTimeouts.current.delete(id);
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, duration);
      toastTimeouts.current.set(id, timeoutId);
    }
    
    return id;
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 8000 });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const value = useMemo(() => ({
    state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [
    state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
