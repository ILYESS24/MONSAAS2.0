import { describe, it, expect } from 'vitest'
import { 
  sanitizeString, 
  sanitizeHtml, 
  sanitizeEmail, 
  sanitizeUrl, 
  sanitizeObject, 
  isValidUUID, 
  sanitizeNumber,
  ClientRateLimiter,
  defaultRateLimiter 
} from '@/lib/sanitize'

describe('sanitizeString', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('removes javascript: protocol', () => {
    const result = sanitizeString('javascript:alert(1)')
    expect(result).not.toContain('javascript:')
  })

  it('removes data: protocol', () => {
    const result = sanitizeString('data:text/html,<script>alert(1)</script>')
    expect(result).not.toContain('data:')
  })

  it('removes vbscript: protocol', () => {
    const result = sanitizeString('vbscript:msgbox(1)')
    expect(result).not.toContain('vbscript:')
  })

  it('removes event handlers', () => {
    const result1 = sanitizeString('onclick=alert(1)')
    const result2 = sanitizeString('onmouseover=hack()')
    expect(result1).not.toContain('onclick')
    expect(result2).not.toContain('onmouseover')
  })

  it('removes angle brackets', () => {
    const result = sanitizeString('<script>alert(1)</script>')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('truncates long strings', () => {
    const longString = 'a'.repeat(15000)
    expect(sanitizeString(longString).length).toBe(10000)
  })

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('')
    expect(sanitizeString('   ')).toBe('')
  })

  it('removes file: protocol', () => {
    const result = sanitizeString('file:///etc/passwd')
    expect(result).not.toContain('file:')
  })

  it('removes blob: protocol', () => {
    const result = sanitizeString('blob:https://example.com/file')
    expect(result).not.toContain('blob:')
  })
})

describe('sanitizeHtml', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })

  it('escapes HTML entities', () => {
    expect(sanitizeHtml('<script>')).toBe('&lt;script&gt;')
    expect(sanitizeHtml('&')).toBe('&amp;')
    expect(sanitizeHtml('"')).toBe('&quot;')
    expect(sanitizeHtml("'")).toBe('&#039;')
    expect(sanitizeHtml('/')).toBe('&#x2F;')
    expect(sanitizeHtml('`')).toBe('&#x60;')
    expect(sanitizeHtml('=')).toBe('&#x3D;')
  })

  it('preserves safe characters', () => {
    expect(sanitizeHtml('Hello World 123')).toBe('Hello World 123')
  })

  it('truncates long strings', () => {
    const longString = 'a'.repeat(15000)
    expect(sanitizeHtml(longString).length).toBe(10000)
  })
})

describe('sanitizeEmail', () => {
  it('returns null for null/undefined', () => {
    expect(sanitizeEmail(null)).toBe(null)
    expect(sanitizeEmail(undefined)).toBe(null)
  })

  it('validates and normalizes valid emails', () => {
    expect(sanitizeEmail('Test@Example.com')).toBe('test@example.com')
    expect(sanitizeEmail('user.name@domain.org')).toBe('user.name@domain.org')
  })

  it('returns null for invalid emails', () => {
    expect(sanitizeEmail('not-an-email')).toBe(null)
    expect(sanitizeEmail('no@tld')).toBe(null)
    expect(sanitizeEmail('@domain.com')).toBe(null)
    expect(sanitizeEmail('user@')).toBe(null)
    expect(sanitizeEmail('')).toBe(null)
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('rejects emails that are too long', () => {
    const longEmail = 'a'.repeat(250) + '@b.com'
    expect(sanitizeEmail(longEmail)).toBe(null)
  })
})

describe('sanitizeUrl', () => {
  it('returns null for null/undefined', () => {
    expect(sanitizeUrl(null)).toBe(null)
    expect(sanitizeUrl(undefined)).toBe(null)
  })

  it('validates http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
  })

  it('validates https URLs', () => {
    expect(sanitizeUrl('https://example.com/path?query=1')).toBe('https://example.com/path?query=1')
  })

  it('rejects javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe(null)
  })

  it('rejects data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe(null)
  })

  it('rejects ftp: URLs', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe(null)
  })

  it('rejects file: URLs', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe(null)
  })

  it('trims whitespace', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com/')
  })

  it('rejects invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBe(null)
    expect(sanitizeUrl('')).toBe(null)
  })

  it('rejects URLs that are too long', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2050)
    expect(sanitizeUrl(longUrl)).toBe(null)
  })
})

describe('sanitizeObject', () => {
  it('sanitizes string values', () => {
    const input = { name: '<script>alert(1)</script>' }
    const result = sanitizeObject(input)
    expect(result.name).not.toContain('<')
    expect(result.name).not.toContain('>')
  })

  it('sanitizes nested objects', () => {
    const input = { 
      user: { 
        name: 'onclick=hack()' 
      } 
    }
    const result = sanitizeObject(input)
    expect(result.user.name).not.toContain('onclick')
  })

  it('sanitizes arrays', () => {
    const input = { tags: ['<b>test</b>', 'normal'] }
    const result = sanitizeObject(input)
    expect(result.tags[0]).not.toContain('<')
    expect(result.tags[1]).toBe('normal')
  })

  it('preserves non-string values', () => {
    const input = { count: 42, active: true, nothing: null }
    const result = sanitizeObject(input)
    expect(result.count).toBe(42)
    expect(result.active).toBe(true)
    expect(result.nothing).toBe(null)
  })
})

describe('isValidUUID', () => {
  it('returns false for null/undefined', () => {
    expect(isValidUUID(null)).toBe(false)
    expect(isValidUUID(undefined)).toBe(false)
  })

  it('validates correct UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
  })

  it('rejects invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
    expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false)
    expect(isValidUUID('')).toBe(false)
  })

  it('trims whitespace', () => {
    expect(isValidUUID('  123e4567-e89b-12d3-a456-426614174000  ')).toBe(true)
  })
})

describe('sanitizeNumber', () => {
  it('returns number for valid input', () => {
    expect(sanitizeNumber(42)).toBe(42)
    expect(sanitizeNumber('42')).toBe(42)
  })

  it('returns null for invalid input', () => {
    expect(sanitizeNumber('not a number')).toBe(null)
    expect(sanitizeNumber(NaN)).toBe(null)
    expect(sanitizeNumber(Infinity)).toBe(null)
    expect(sanitizeNumber(-Infinity)).toBe(null)
  })

  it('clamps to min value', () => {
    expect(sanitizeNumber(5, 10)).toBe(10)
    expect(sanitizeNumber(-5, 0)).toBe(0)
  })

  it('clamps to max value', () => {
    expect(sanitizeNumber(100, undefined, 50)).toBe(50)
  })

  it('clamps within range', () => {
    expect(sanitizeNumber(5, 0, 100)).toBe(5)
    expect(sanitizeNumber(-5, 0, 100)).toBe(0)
    expect(sanitizeNumber(150, 0, 100)).toBe(100)
  })
})

describe('ClientRateLimiter', () => {
  it('allows actions within limit', () => {
    const limiter = new ClientRateLimiter(3, 1000)
    
    expect(limiter.isAllowed('test')).toBe(true)
    expect(limiter.isAllowed('test')).toBe(true)
    expect(limiter.isAllowed('test')).toBe(true)
  })

  it('blocks actions over limit', () => {
    const limiter = new ClientRateLimiter(2, 1000)
    
    expect(limiter.isAllowed('test')).toBe(true)
    expect(limiter.isAllowed('test')).toBe(true)
    expect(limiter.isAllowed('test')).toBe(false)
  })

  it('separates actions by key', () => {
    const limiter = new ClientRateLimiter(2, 1000)
    
    expect(limiter.isAllowed('action1')).toBe(true)
    expect(limiter.isAllowed('action1')).toBe(true)
    expect(limiter.isAllowed('action1')).toBe(false)
    expect(limiter.isAllowed('action2')).toBe(true)
  })

  it('resets specific action', () => {
    const limiter = new ClientRateLimiter(2, 1000)
    
    limiter.isAllowed('test')
    limiter.isAllowed('test')
    expect(limiter.isAllowed('test')).toBe(false)
    
    limiter.reset('test')
    expect(limiter.isAllowed('test')).toBe(true)
  })

  it('resets all actions', () => {
    const limiter = new ClientRateLimiter(2, 1000)
    
    limiter.isAllowed('action1')
    limiter.isAllowed('action2')
    
    limiter.resetAll()
    
    expect(limiter.getRemainingAttempts('action1')).toBe(2)
    expect(limiter.getRemainingAttempts('action2')).toBe(2)
  })

  it('returns correct remaining attempts', () => {
    const limiter = new ClientRateLimiter(5, 1000)
    
    expect(limiter.getRemainingAttempts('test')).toBe(5)
    
    limiter.isAllowed('test')
    limiter.isAllowed('test')
    
    expect(limiter.getRemainingAttempts('test')).toBe(3)
  })
})

describe('defaultRateLimiter', () => {
  it('exists and is a ClientRateLimiter', () => {
    expect(defaultRateLimiter).toBeInstanceOf(ClientRateLimiter)
  })
})
