/**
 * useNotifications Hook
 * 
 * Provides notification management with support for both local and remote notifications.
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';
import type { Notification } from '@/types/supabase';

// Local notification type (for simulated/local notifications)
export interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Toast notification for temporary UI notifications
export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface UseNotificationsReturn {
  notifications: LocalNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<LocalNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

/**
 * Hook for managing notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<LocalNotification[]>(() => {
    // Initialize with some sample notifications
    return [
      {
        id: 'welcome-1',
        title: 'Welcome to Aurion Studio',
        message: 'Start by exploring the dashboard and connected tools.',
        type: 'info',
        read: false,
        createdAt: new Date(),
      },
      {
        id: 'update-1',
        title: 'New features available',
        message: 'Check out the new AI-powered tools in your toolkit.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((
    notification: Omit<LocalNotification, 'id' | 'read' | 'createdAt'>
  ) => {
    const newNotification: LocalNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    logger.debug('Notification added', { title: notification.title });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

/**
 * Hook for toast notifications (temporary UI notifications)
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}`,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, newToast.duration);

    return newToast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    info: (title: string, message: string) => addToast({ title, message, type: 'info' }),
    success: (title: string, message: string) => addToast({ title, message, type: 'success' }),
    warning: (title: string, message: string) => addToast({ title, message, type: 'warning' }),
    error: (title: string, message: string) => addToast({ title, message, type: 'error' }),
  };

  return {
    toasts,
    addToast,
    removeToast,
    toast,
  };
}

export default { useNotifications, useToast };
