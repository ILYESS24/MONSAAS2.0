/**
 * Security Headers Module
 * 
 * Provides security header validation and recommendations
 * for compliance and protection against common web attacks.
 * 
 * @module security/headers
 */

// =============================================================================
// TYPES
// =============================================================================

export interface SecurityHeaderConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

export interface HeaderValidationResult {
  header: string;
  present: boolean;
  value?: string;
  recommended: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue?: string;
}

export interface SecurityHeadersReport {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  results: HeaderValidationResult[];
  recommendations: string[];
}

// =============================================================================
// RECOMMENDED HEADERS
// =============================================================================

/**
 * Recommended security headers for SaaS applications
 * 
 * Note: 'unsafe-inline' is used for script-src and style-src to support
 * Clerk's authentication UI and Tailwind's inline styles. For stricter CSP,
 * consider using nonces or hashes, but this requires server-side support.
 * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
export const RECOMMENDED_HEADERS: SecurityHeaderConfig = {
  // Content Security Policy
  // Note: 'unsafe-inline' for scripts is required by Clerk and some React patterns
  // For production with stricter requirements, implement nonce-based CSP
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://clerk.io https://*.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.clerk.io https://*.clerk.accounts.dev https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://*.pages.dev https://*.onrender.com https://*.vercel.app https://www.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),

  // HTTP Strict Transport Security
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',

  // X-Frame-Options (legacy, CSP frame-ancestors preferred)
  xFrameOptions: 'SAMEORIGIN',

  // X-Content-Type-Options
  xContentTypeOptions: 'nosniff',

  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Cross-Origin Policies
  crossOriginEmbedderPolicy: 'require-corp',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
};

// =============================================================================
// HEADER VALIDATION
// =============================================================================

/**
 * Security Headers Validator
 * 
 * Validates security headers and provides recommendations.
 */
export class SecurityHeadersValidator {
  private headers: Headers;

  constructor(headers: Headers | Record<string, string>) {
    if (headers instanceof Headers) {
      this.headers = headers;
    } else {
      this.headers = new Headers(headers);
    }
  }

  /**
   * Validate all security headers
   */
  validate(): SecurityHeadersReport {
    const results: HeaderValidationResult[] = [
      this.validateCSP(),
      this.validateHSTS(),
      this.validateXFrameOptions(),
      this.validateXContentTypeOptions(),
      this.validateReferrerPolicy(),
      this.validatePermissionsPolicy(),
    ];

    const score = this.calculateScore(results);
    const grade = this.getGrade(score);
    const recommendations = this.getRecommendations(results);

    return {
      score,
      grade,
      results,
      recommendations,
    };
  }

  /**
   * Validate Content-Security-Policy
   */
  private validateCSP(): HeaderValidationResult {
    const value = this.headers.get('Content-Security-Policy');
    const result: HeaderValidationResult = {
      header: 'Content-Security-Policy',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.contentSecurityPolicy!,
      severity: 'critical',
    };

    if (!value) {
      result.issue = 'CSP header is missing. This exposes the application to XSS attacks.';
    } else {
      // Check for unsafe directives
      if (value.includes("'unsafe-eval'")) {
        result.issue = "CSP contains 'unsafe-eval' which weakens XSS protection.";
        result.severity = 'high';
      }
      if (!value.includes('default-src')) {
        result.issue = 'CSP missing default-src directive.';
        result.severity = 'medium';
      }
    }

    return result;
  }

  /**
   * Validate Strict-Transport-Security
   */
  private validateHSTS(): HeaderValidationResult {
    const value = this.headers.get('Strict-Transport-Security');
    const result: HeaderValidationResult = {
      header: 'Strict-Transport-Security',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.strictTransportSecurity!,
      severity: 'high',
    };

    if (!value) {
      result.issue = 'HSTS header is missing. Users may be vulnerable to downgrade attacks.';
    } else {
      const maxAgeMatch = value.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10);
        if (maxAge < 31536000) {
          result.issue = 'HSTS max-age should be at least 1 year (31536000 seconds).';
          result.severity = 'medium';
        }
      }
      if (!value.includes('includeSubDomains')) {
        result.issue = 'HSTS should include subdomains for complete protection.';
        result.severity = 'medium';
      }
    }

    return result;
  }

  /**
   * Validate X-Frame-Options
   */
  private validateXFrameOptions(): HeaderValidationResult {
    const value = this.headers.get('X-Frame-Options');
    const result: HeaderValidationResult = {
      header: 'X-Frame-Options',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.xFrameOptions!,
      severity: 'medium',
    };

    if (!value) {
      result.issue = 'X-Frame-Options is missing. Consider using CSP frame-ancestors instead.';
    } else if (value.toUpperCase() === 'ALLOW-FROM') {
      result.issue = 'ALLOW-FROM is deprecated. Use CSP frame-ancestors instead.';
    }

    return result;
  }

  /**
   * Validate X-Content-Type-Options
   */
  private validateXContentTypeOptions(): HeaderValidationResult {
    const value = this.headers.get('X-Content-Type-Options');
    const result: HeaderValidationResult = {
      header: 'X-Content-Type-Options',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.xContentTypeOptions!,
      severity: 'medium',
    };

    if (!value) {
      result.issue = 'X-Content-Type-Options is missing. Browsers may MIME-sniff content.';
    } else if (value.toLowerCase() !== 'nosniff') {
      result.issue = 'X-Content-Type-Options should be set to "nosniff".';
    }

    return result;
  }

  /**
   * Validate Referrer-Policy
   */
  private validateReferrerPolicy(): HeaderValidationResult {
    const value = this.headers.get('Referrer-Policy');
    const result: HeaderValidationResult = {
      header: 'Referrer-Policy',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.referrerPolicy!,
      severity: 'low',
    };

    if (!value) {
      result.issue = 'Referrer-Policy is missing. Sensitive URLs may be leaked.';
    } else if (value === 'unsafe-url') {
      result.issue = 'Referrer-Policy "unsafe-url" leaks full URL including query parameters.';
      result.severity = 'high';
    }

    return result;
  }

  /**
   * Validate Permissions-Policy
   */
  private validatePermissionsPolicy(): HeaderValidationResult {
    const value = this.headers.get('Permissions-Policy');
    const result: HeaderValidationResult = {
      header: 'Permissions-Policy',
      present: !!value,
      value: value || undefined,
      recommended: RECOMMENDED_HEADERS.permissionsPolicy!,
      severity: 'low',
    };

    if (!value) {
      result.issue = 'Permissions-Policy is missing. Browser features may be abused.';
    }

    return result;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateScore(results: HeaderValidationResult[]): number {
    const weights: Record<string, number> = {
      critical: 30,
      high: 25,
      medium: 15,
      low: 10,
    };

    let maxScore = 0;
    let actualScore = 0;

    for (const result of results) {
      const weight = weights[result.severity];
      maxScore += weight;

      if (result.present && !result.issue) {
        actualScore += weight;
      } else if (result.present) {
        // Partial credit for present but misconfigured
        actualScore += weight * 0.5;
      }
    }

    return Math.round((actualScore / maxScore) * 100);
  }

  /**
   * Get letter grade from score
   */
  private getGrade(score: number): SecurityHeadersReport['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Get recommendations based on validation results
   */
  private getRecommendations(results: HeaderValidationResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of results) {
      if (!result.present) {
        recommendations.push(
          `Add the ${result.header} header with value: ${result.recommended}`
        );
      } else if (result.issue) {
        recommendations.push(`${result.header}: ${result.issue}`);
      }
    }

    return recommendations;
  }
}

// =============================================================================
// CSP BUILDER
// =============================================================================

/**
 * Content Security Policy Builder
 * 
 * Fluent API for building CSP headers
 */
export class CSPBuilder {
  private directives: Map<string, Set<string>> = new Map();

  /**
   * Add a source to a directive
   */
  private addSource(directive: string, source: string): this {
    if (!this.directives.has(directive)) {
      this.directives.set(directive, new Set());
    }
    this.directives.get(directive)!.add(source);
    return this;
  }

  // Directive methods
  defaultSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('default-src', s));
    return this;
  }

  scriptSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('script-src', s));
    return this;
  }

  styleSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('style-src', s));
    return this;
  }

  imgSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('img-src', s));
    return this;
  }

  fontSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('font-src', s));
    return this;
  }

  connectSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('connect-src', s));
    return this;
  }

  frameSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('frame-src', s));
    return this;
  }

  frameAncestors(...sources: string[]): this {
    sources.forEach((s) => this.addSource('frame-ancestors', s));
    return this;
  }

  formAction(...sources: string[]): this {
    sources.forEach((s) => this.addSource('form-action', s));
    return this;
  }

  baseUri(...sources: string[]): this {
    sources.forEach((s) => this.addSource('base-uri', s));
    return this;
  }

  objectSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('object-src', s));
    return this;
  }

  mediaSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('media-src', s));
    return this;
  }

  workerSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('worker-src', s));
    return this;
  }

  manifestSrc(...sources: string[]): this {
    sources.forEach((s) => this.addSource('manifest-src', s));
    return this;
  }

  /**
   * Add upgrade-insecure-requests directive
   */
  upgradeInsecureRequests(): this {
    this.directives.set('upgrade-insecure-requests', new Set());
    return this;
  }

  /**
   * Add block-all-mixed-content directive
   */
  blockAllMixedContent(): this {
    this.directives.set('block-all-mixed-content', new Set());
    return this;
  }

  /**
   * Build the CSP header string
   */
  build(): string {
    const parts: string[] = [];

    this.directives.forEach((sources, directive) => {
      if (sources.size === 0) {
        parts.push(directive);
      } else {
        parts.push(`${directive} ${Array.from(sources).join(' ')}`);
      }
    });

    return parts.join('; ');
  }

  /**
   * Build as meta tag
   */
  buildMetaTag(): string {
    return `<meta http-equiv="Content-Security-Policy" content="${this.build()}">`;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a secure headers configuration for the application
 */
export function createSecureHeaders(): SecurityHeaderConfig {
  return { ...RECOMMENDED_HEADERS };
}

/**
 * Generate meta tags for security headers (for SPA without server control)
 */
export function generateSecurityMetaTags(): string {
  const tags: string[] = [];

  // CSP
  tags.push(
    `<meta http-equiv="Content-Security-Policy" content="${RECOMMENDED_HEADERS.contentSecurityPolicy}">`
  );

  // X-Frame-Options (limited browser support via meta)
  tags.push(
    `<meta http-equiv="X-Frame-Options" content="${RECOMMENDED_HEADERS.xFrameOptions}">`
  );

  // X-Content-Type-Options (limited browser support via meta)
  tags.push(
    `<meta http-equiv="X-Content-Type-Options" content="${RECOMMENDED_HEADERS.xContentTypeOptions}">`
  );

  // Referrer Policy
  tags.push(`<meta name="referrer" content="${RECOMMENDED_HEADERS.referrerPolicy}">`);

  return tags.join('\n');
}

/**
 * Validate current page's security headers
 */
export async function validateCurrentPageHeaders(): Promise<SecurityHeadersReport> {
  // Fetch the current page to get headers
  try {
    const response = await fetch(window.location.href, { method: 'HEAD' });
    const validator = new SecurityHeadersValidator(response.headers);
    return validator.validate();
  } catch {
    // Return a report indicating we couldn't validate
    return {
      score: 0,
      grade: 'F',
      results: [],
      recommendations: ['Unable to validate headers. Ensure CORS allows the request.'],
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  RECOMMENDED_HEADERS,
  SecurityHeadersValidator,
  CSPBuilder,
  createSecureHeaders,
  generateSecurityMetaTags,
  validateCurrentPageHeaders,
};
