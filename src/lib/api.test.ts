/**
 * API Client Tests
 * 
 * Tests for the centralized API client with retry logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, apiRequest, type ApiResponse, type ApiError } from '@/lib/api';

// Type assertions for type-only imports used in test assertions below
type _ApiResponse = ApiResponse<unknown>;
type _ApiError = ApiError;

describe('API Client', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // API CLIENT METHODS
  // ===========================================================================
  describe('api methods', () => {
    it('should have get method', () => {
      expect(typeof api.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof api.post).toBe('function');
    });

    it('should have put method', () => {
      expect(typeof api.put).toBe('function');
    });

    it('should have patch method', () => {
      expect(typeof api.patch).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof api.delete).toBe('function');
    });
  });

  // ===========================================================================
  // API REQUEST FUNCTION
  // ===========================================================================
  describe('apiRequest', () => {
    it('should be a function', () => {
      expect(typeof apiRequest).toBe('function');
    });
  });

  // ===========================================================================
  // GET REQUEST
  // ===========================================================================
  describe('GET request', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      } as Response);

      const result = await api.get('/test');
      
      expect(fetchSpy).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should handle GET request failure', async () => {
      const errorResponse = { message: 'Not found' };
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(errorResponse),
      } as Response);

      const result = await api.get('/notfound');
      
      expect(result.error).not.toBeNull();
      expect(result.status).toBe(404);
    });
  });

  // ===========================================================================
  // POST REQUEST
  // ===========================================================================
  describe('POST request', () => {
    it('should make a POST request with body', async () => {
      const mockResponse = { id: 1, created: true };
      const requestBody = { name: 'Test' };
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await api.post('/create', requestBody);
      
      expect(fetchSpy).toHaveBeenCalled();
      expect(result.data).toEqual(mockResponse);
    });
  });

  // ===========================================================================
  // API RESPONSE TYPE
  // ===========================================================================
  describe('ApiResponse type', () => {
    it('should return correct response structure', async () => {
      const mockData = { value: 'test' };
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      } as Response);

      const result: ApiResponse<{ value: string }> = await api.get('/test');
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('status');
    });
  });

  // ===========================================================================
  // NETWORK ERRORS
  // ===========================================================================
  describe('Network errors', () => {
    it('should handle network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'));

      const result = await api.get('/test', { retries: 0 });
      
      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('NETWORK_ERROR');
    });
  });
});
