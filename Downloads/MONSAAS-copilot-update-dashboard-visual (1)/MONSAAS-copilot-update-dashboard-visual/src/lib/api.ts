/**
 * API Client
 * 
 * Centralized API client for making HTTP requests with proper error handling,
 * retry logic, and type safety.
 */

import { logger } from './logger';

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Request configuration
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Default configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Base API URL (can be configured via environment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a timeout promise
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
}

/**
 * Parse API response
 */
async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const contentType = response.headers.get('content-type');
    let data: T | null = null;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text() as unknown as T;
    }

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: (data as Record<string, string>)?.message || response.statusText,
          code: `HTTP_${response.status}`,
          details: data as Record<string, unknown>,
        },
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to parse response',
        code: 'PARSE_ERROR',
      },
      status: response.status,
    };
  }
}

/**
 * Main API client function
 */
export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchConfig
  } = config;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = new Headers(fetchConfig.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let lastError: ApiError | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logger.debug(`API request attempt ${attempt + 1}`, { url, method: fetchConfig.method || 'GET' });
      
      const response = await Promise.race([
        fetch(url, { ...fetchConfig, headers }),
        createTimeout(timeout),
      ]);

      const result = await parseResponse<T>(response);
      
      // Don't retry on client errors (4xx)
      if (result.error && result.status >= 400 && result.status < 500) {
        return result;
      }

      // Retry on server errors (5xx) with exponential backoff
      if (result.error && result.status >= 500) {
        lastError = result.error;
        if (attempt < retries) {
          const backoffDelay = Math.pow(2, attempt) * retryDelay; // True exponential backoff
          logger.warn(`API request failed, retrying in ${backoffDelay}ms...`, { attempt: attempt + 1, error: result.error.message });
          await sleep(backoffDelay);
          continue;
        }
      }

      return result;
    } catch (error) {
      lastError = {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      };
      
      if (attempt < retries) {
        const backoffDelay = Math.pow(2, attempt) * retryDelay;
        logger.warn(`API request failed, retrying in ${backoffDelay}ms...`, { attempt: attempt + 1, error: lastError.message });
        await sleep(backoffDelay);
        continue;
      }
    }
  }

  return {
    data: null,
    error: lastError || { message: 'Unknown error', code: 'UNKNOWN' },
    status: 0,
  };
}

/**
 * Convenience methods
 */
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { 
      ...config, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { 
      ...config, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { 
      ...config, 
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
};

export default api;
