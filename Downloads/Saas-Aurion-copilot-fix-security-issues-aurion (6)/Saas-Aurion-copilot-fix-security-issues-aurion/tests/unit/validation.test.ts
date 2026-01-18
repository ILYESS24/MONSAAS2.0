import { describe, it, expect } from 'vitest'
import { 
  isString, 
  isNumber, 
  isBoolean,
  string, 
  number, 
  boolean,
  array,
  object,
  optional,
  nullable,
  literal,
  union,
  enumValidator,
  email,
  uuid,
  url,
  date,
  validate,
  tryValidate,
  ValidationError,
  schemas
} from '@/lib/validation'

describe('Type guards', () => {
  describe('isString', () => {
    it('returns true for strings', () => {
      expect(isString('')).toBe(true)
      expect(isString('hello')).toBe(true)
    })

    it('returns false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('returns true for valid numbers', () => {
      expect(isNumber(0)).toBe(true)
      expect(isNumber(42)).toBe(true)
    })

    it('returns false for invalid numbers', () => {
      expect(isNumber(NaN)).toBe(false)
      expect(isNumber(Infinity)).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('returns true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })

    it('returns false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean('')).toBe(false)
    })
  })
})

describe('String validator', () => {
  it('validates strings', () => {
    const validator = string()
    expect(validator('hello').success).toBe(true)
  })

  it('rejects non-strings', () => {
    const validator = string()
    expect(validator(123).success).toBe(false)
  })

  it('validates minLength', () => {
    const validator = string({ minLength: 3 })
    expect(validator('ab').success).toBe(false)
    expect(validator('abc').success).toBe(true)
  })

  it('validates maxLength', () => {
    const validator = string({ maxLength: 5 })
    expect(validator('abcdef').success).toBe(false)
    expect(validator('abcde').success).toBe(true)
  })

  it('validates pattern', () => {
    const validator = string({ pattern: /^\d+$/ })
    expect(validator('123').success).toBe(true)
    expect(validator('abc').success).toBe(false)
  })
})

describe('Number validator', () => {
  it('validates numbers', () => {
    const validator = number()
    expect(validator(42).success).toBe(true)
  })

  it('validates min', () => {
    const validator = number({ min: 0 })
    expect(validator(-1).success).toBe(false)
    expect(validator(0).success).toBe(true)
  })

  it('validates max', () => {
    const validator = number({ max: 100 })
    expect(validator(101).success).toBe(false)
    expect(validator(100).success).toBe(true)
  })

  it('validates integer', () => {
    const validator = number({ integer: true })
    expect(validator(3.14).success).toBe(false)
    expect(validator(42).success).toBe(true)
  })
})

describe('Boolean validator', () => {
  it('validates booleans', () => {
    const validator = boolean()
    expect(validator(true).success).toBe(true)
    expect(validator(false).success).toBe(true)
    expect(validator(0).success).toBe(false)
  })
})

describe('Array validator', () => {
  it('validates arrays', () => {
    const validator = array(string())
    expect(validator(['a', 'b']).success).toBe(true)
  })

  it('validates item types', () => {
    const validator = array(number())
    expect(validator([1, 2, 3]).success).toBe(true)
    expect(validator([1, 'two', 3]).success).toBe(false)
  })

  it('validates minLength', () => {
    const validator = array(string(), { minLength: 2 })
    expect(validator(['a']).success).toBe(false)
    expect(validator(['a', 'b']).success).toBe(true)
  })
})

describe('Object validator', () => {
  it('validates objects', () => {
    const validator = object({
      name: string(),
      age: number()
    })
    expect(validator({ name: 'John', age: 30 }).success).toBe(true)
  })

  it('validates field types', () => {
    const validator = object({ count: number() })
    expect(validator({ count: '42' }).success).toBe(false)
    expect(validator({ count: 42 }).success).toBe(true)
  })
})

describe('Optional validator', () => {
  it('accepts undefined', () => {
    const validator = optional(string())
    expect(validator(undefined).success).toBe(true)
  })

  it('validates present values', () => {
    const validator = optional(string())
    expect(validator('hello').success).toBe(true)
    expect(validator(123).success).toBe(false)
  })
})

describe('Nullable validator', () => {
  it('accepts null', () => {
    const validator = nullable(string())
    const result = validator(null)
    expect(result.success).toBe(true)
  })
})

describe('Literal validator', () => {
  it('validates exact string', () => {
    const validator = literal('hello')
    expect(validator('hello').success).toBe(true)
    expect(validator('world').success).toBe(false)
  })
})

describe('Union validator', () => {
  it('validates any matching type', () => {
    const validator = union(string(), number())
    expect(validator('hello').success).toBe(true)
    expect(validator(42).success).toBe(true)
    expect(validator(true).success).toBe(false)
  })
})

describe('Enum validator', () => {
  it('validates enum values', () => {
    const validator = enumValidator(['active', 'inactive'] as const)
    expect(validator('active').success).toBe(true)
    expect(validator('pending').success).toBe(false)
  })
})

describe('Email validator', () => {
  it('validates correct emails', () => {
    const validator = email()
    expect(validator('test@example.com').success).toBe(true)
  })

  it('rejects invalid emails', () => {
    const validator = email()
    expect(validator('notanemail').success).toBe(false)
  })
})

describe('UUID validator', () => {
  it('validates correct UUIDs', () => {
    const validator = uuid()
    expect(validator('123e4567-e89b-12d3-a456-426614174000').success).toBe(true)
  })

  it('rejects invalid UUIDs', () => {
    const validator = uuid()
    expect(validator('not-a-uuid').success).toBe(false)
  })
})

describe('URL validator', () => {
  it('validates http/https URLs', () => {
    const validator = url()
    expect(validator('https://example.com').success).toBe(true)
  })

  it('rejects invalid URLs', () => {
    const validator = url()
    expect(validator('not a url').success).toBe(false)
  })
})

describe('Date validator', () => {
  it('validates Date objects', () => {
    const validator = date()
    expect(validator(new Date()).success).toBe(true)
  })

  it('parses date strings', () => {
    const validator = date()
    expect(validator('2024-01-01').success).toBe(true)
  })
})

describe('validate helper', () => {
  it('returns data on success', () => {
    const result = validate(string(), 'hello')
    expect(result).toBe('hello')
  })

  it('throws ValidationError on failure', () => {
    expect(() => validate(string(), 123)).toThrow(ValidationError)
  })
})

describe('tryValidate helper', () => {
  it('returns data on success', () => {
    const result = tryValidate(string(), 'hello')
    expect(result).toBe('hello')
  })

  it('returns null on failure', () => {
    const result = tryValidate(string(), 123)
    expect(result).toBe(null)
  })
})

describe('ValidationError', () => {
  it('creates error with message', () => {
    const error = new ValidationError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('ValidationError')
  })
})

describe('Common schemas', () => {
  it('has pagination schema', () => {
    const validData = { page: 1, limit: 10 }
    expect(schemas.pagination(validData).success).toBe(true)
    
    const invalidData = { page: 0, limit: 10 }
    expect(schemas.pagination(invalidData).success).toBe(false)
  })
})
