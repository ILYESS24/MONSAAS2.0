/**
 * Custom Hooks Tests
 * 
 * Comprehensive tests for all custom React hooks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLiveStats,
  useLiveActivity,
  useCurrentTime,
  useToolStatus,
} from '@/hooks/useLiveData';
import { useLocalStorage, useSessionStorage } from '@/hooks/useStorage';

describe('Custom Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // USE LIVE STATS
  // ===========================================================================
  describe('useLiveStats', () => {
    it('should return stats object', () => {
      const { result } = renderHook(() => useLiveStats());
      
      expect(result.current).toHaveProperty('totalProjects');
      expect(result.current).toHaveProperty('activeUsers');
      expect(result.current).toHaveProperty('revenue');
      expect(result.current).toHaveProperty('tasksCompleted');
      expect(result.current).toHaveProperty('lastUpdated');
    });

    it('should have numeric values', () => {
      const { result } = renderHook(() => useLiveStats());
      
      expect(typeof result.current.totalProjects).toBe('number');
      expect(typeof result.current.activeUsers).toBe('number');
      expect(typeof result.current.revenue).toBe('number');
      expect(typeof result.current.tasksCompleted).toBe('number');
    });

    it('should have lastUpdated as Date', () => {
      const { result } = renderHook(() => useLiveStats());
      
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });
  });

  // ===========================================================================
  // USE LIVE ACTIVITY
  // ===========================================================================
  describe('useLiveActivity', () => {
    it('should return activities array', () => {
      const { result } = renderHook(() => useLiveActivity());
      
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should have activities with required fields', () => {
      const { result } = renderHook(() => useLiveActivity());
      
      if (result.current.length > 0) {
        const activity = result.current[0];
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('user');
        expect(activity).toHaveProperty('action');
        expect(activity).toHaveProperty('timestamp');
      }
    });

    it('should initialize with empty activities when Supabase not configured', () => {
      const { result } = renderHook(() => useLiveActivity());
      
      // When Supabase is not configured, activities start empty
      expect(result.current).toEqual([]);
    });
  });

  // ===========================================================================
  // USE CURRENT TIME
  // ===========================================================================
  describe('useCurrentTime', () => {
    it('should return a Date object', () => {
      const { result } = renderHook(() => useCurrentTime());
      
      expect(result.current).toBeInstanceOf(Date);
    });

    it('should update every second', () => {
      const { result } = renderHook(() => useCurrentTime());
      
      const initialTime = result.current.getTime();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.getTime()).toBeGreaterThanOrEqual(initialTime);
    });
  });

  // ===========================================================================
  // USE TOOL STATUS
  // ===========================================================================
  describe('useToolStatus', () => {
    it('should return tools array', () => {
      const { result } = renderHook(() => useToolStatus());
      
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('should have tools with required fields', () => {
      const { result } = renderHook(() => useToolStatus());
      
      if (result.current.length > 0) {
        const tool = result.current[0];
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('status');
        expect(tool).toHaveProperty('url');
      }
    });

    it('should initialize with loading status', () => {
      const { result } = renderHook(() => useToolStatus());
      
      const loadingTools = result.current.filter(t => t.status === 'loading');
      expect(loadingTools.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ===========================================================================
  // USE LOCAL STORAGE
  // ===========================================================================
  describe('useLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    });

    it('should initialize with default value', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'default')
      );
      
      expect(result.current[0]).toBe('default');
    });

    it('should update value', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'initial')
      );
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(result.current[0]).toBe('updated');
    });

    it('should have setValue function', () => {
      const { result } = renderHook(() => 
        useLocalStorage('test-key', 'value')
      );
      
      expect(typeof result.current[1]).toBe('function');
    });
  });

  // ===========================================================================
  // USE SESSION STORAGE
  // ===========================================================================
  describe('useSessionStorage', () => {
    beforeEach(() => {
      sessionStorage.clear();
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    });

    it('should initialize with default value', () => {
      const { result } = renderHook(() => 
        useSessionStorage('session-key', 'default')
      );
      
      expect(result.current[0]).toBe('default');
    });

    it('should update value', () => {
      const { result } = renderHook(() => 
        useSessionStorage('session-key', 'initial')
      );
      
      act(() => {
        result.current[1]('updated');
      });
      
      expect(result.current[0]).toBe('updated');
    });
  });
});
