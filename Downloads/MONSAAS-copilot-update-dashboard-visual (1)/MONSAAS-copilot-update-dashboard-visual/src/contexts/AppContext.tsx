/**
 * Application Context
 * 
 * Global application state management using React Context.
 * Provides app-wide state and utilities.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences;
  sidebarOpen: boolean;
  activeModal: string | null;
}

type AppAction =
  | { type: 'INITIALIZE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | { type: 'RESET_STATE' };

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  notificationsEnabled: true,
  soundEnabled: true,
  language: 'en',
};

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  preferences: defaultPreferences,
  sidebarOpen: true,
  activeModal: null,
};

// =============================================================================
// REDUCER
// =============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, isInitialized: true };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    
    case 'SET_ACTIVE_MODAL':
      return { ...state, activeModal: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState, isInitialized: true };
    
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

const AppContext = createContext<AppContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs) as Partial<UserPreferences>;
        dispatch({ type: 'SET_PREFERENCES', payload: parsed });
      }
      dispatch({ type: 'INITIALIZE' });
      logger.info('Application context initialized');
    } catch (error) {
      logger.warn('Failed to load user preferences', { error });
      dispatch({ type: 'INITIALIZE' });
    }
  }, []);

  // Persist preferences to localStorage
  useEffect(() => {
    if (state.isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(state.preferences));
      } catch (error) {
        logger.warn('Failed to save user preferences', { error });
      }
    }
  }, [state.preferences, state.isInitialized]);

  // Convenience methods
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: prefs });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const openModal = useCallback((modalId: string) => {
    dispatch({ type: 'SET_ACTIVE_MODAL', payload: modalId });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_MODAL', payload: null });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    setLoading,
    setError,
    updatePreferences,
    toggleSidebar,
    openModal,
    closeModal,
  }), [state, setLoading, setError, updatePreferences, toggleSidebar, openModal, closeModal]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
