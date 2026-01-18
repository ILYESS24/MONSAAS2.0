import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  cn, 
  truncate, 
  formatNumber, 
  formatBytes, 
  formatRelativeTime, 
  debounce, 
  throttle,
  ApiResponseError,
  safeJsonResponse 
} from '@/lib/utils'

describe('cn (class names utility)', () => {
  it('combines multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles object inputs', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })
})

describe('truncate', () => {
  it('returns original string if shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates string with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('uses default maxLength of 100', () => {
    const longString = 'a'.repeat(150)
    expect(truncate(longString).length).toBe(100)
    expect(truncate(longString).endsWith('...')).toBe(true)
  })

  it('handles empty string', () => {
    expect(truncate('')).toBe('')
  })

  it('handles exact maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('formatNumber', () => {
  it('formats numbers with French locale', () => {
    const result = formatNumber(1000)
    expect(result.replace(/\s/g, ' ')).toMatch(/1\s?000/)
  })

  it('handles decimals', () => {
    const result = formatNumber(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('handles negative numbers', () => {
    const result = formatNumber(-1000)
    expect(result).toContain('-')
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('respects decimal places', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 1)).toBe('1.5 KB')
  })
})

describe('formatRelativeTime', () => {
  it('formats recent time', () => {
    const result = formatRelativeTime(new Date())
    expect(result).toBe("À l'instant")
  })

  it('formats minutes', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('Il y a 5 min')
  })

  it('formats hours', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('Il y a 3h')
  })

  it('formats days', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(date)).toBe('Il y a 2j')
  })

  it('formats older dates as locale string', () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('accepts string dates', () => {
    const isoDate = new Date().toISOString()
    expect(formatRelativeTime(isoDate)).toBe("À l'instant")
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    
    expect(fn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('has cancel method', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()
  })

  it('passes arguments to original function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes immediately on first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('ignores calls within limit period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()
    
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows calls after limit period', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    vi.advanceTimersByTime(100)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('ApiResponseError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiResponseError('Test error', 404, 'text/html')
    
    expect(error.message).toBe('Test error')
    expect(error.status).toBe(404)
    expect(error.contentType).toBe('text/html')
    expect(error.name).toBe('ApiResponseError')
  })

  it('is instanceof Error', () => {
    const error = new ApiResponseError('Test', 500, null)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiResponseError)
  })
})

describe('safeJsonResponse', () => {
  it('parses JSON response', async () => {
    const response = new Response(JSON.stringify({ test: 'data' }), {
      headers: { 'content-type': 'application/json' }
    })
    
    const data = await safeJsonResponse(response)
    expect(data).toEqual({ test: 'data' })
  })

  it('throws for non-JSON response', async () => {
    const response = new Response('not json', {
      headers: { 'content-type': 'text/html' }
    })
    
    await expect(safeJsonResponse(response)).rejects.toThrow(ApiResponseError)
  })

  it('throws when content-type is missing', async () => {
    const response = new Response('data')
    
    await expect(safeJsonResponse(response)).rejects.toThrow(ApiResponseError)
  })
})
