import crypto from 'crypto'

// Security utilities for Agent Trust

export class SecurityUtils {
  // Generate secure random tokens
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Hash passwords securely
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .slice(0, 1000) // Limit length
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate wallet address
  static isValidWalletAddress(address: string): boolean {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }

  // Rate limiting implementation
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, { count: number; resetTime: number }>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const record = requests.get(identifier)

      if (!record || now > record.resetTime) {
        requests.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
      }

      if (record.count >= maxRequests) {
        return false
      }

      record.count++
      return true
    }
  }

  // CSRF token generation
  static generateCSRFToken(): string {
    return this.generateToken()
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken
  }

  // Content Security Policy headers
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.openai.com https://basescan.org",
        "frame-src 'self' https://meet.google.com",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }

  // Input validation schemas
  static validateEventInput(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.title || data.title.length < 3 || data.title.length > 100) {
      errors.push('Title must be between 3 and 100 characters')
    }

    if (!data.description || data.description.length < 10 || data.description.length > 2000) {
      errors.push('Description must be between 10 and 2000 characters')
    }

    if (!data.date || new Date(data.date) < new Date()) {
      errors.push('Event date must be in the future')
    }

    if (!data.type || !['SOCIAL', 'CORPORATE', 'HYBRID', 'WORKSHOP', 'CONFERENCE', 'NETWORKING', 'ENTERTAINMENT'].includes(data.type)) {
      errors.push('Invalid event type')
    }

    if (data.price && (isNaN(data.price) || parseFloat(data.price) < 0)) {
      errors.push('Price must be a valid positive number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateTaskInput(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.title || data.title.length < 3 || data.title.length > 140) {
      errors.push('Task title must be between 3 and 140 characters')
    }

    if (!data.description || data.description.length < 10 || data.description.length > 3000) {
      errors.push('Task description must be between 10 and 3000 characters')
    }

    if (!Array.isArray(data.deliverables) || data.deliverables.length === 0) {
      errors.push('At least one deliverable is required')
    }

    if (Number.isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      errors.push('Amount must be a positive number')
    }

    if (data.releaseThreshold && (Number(data.releaseThreshold) < 1 || Number(data.releaseThreshold) > 100)) {
      errors.push('Release threshold must be between 1 and 100')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Encrypt sensitive data
  static async encrypt(text: string, key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const keyData = encoder.encode(key)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    )

    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...result))
  }

  // Decrypt sensitive data
  static async decrypt(encryptedText: string, key: string): Promise<string> {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const keyData = encoder.encode(key)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0))
    const iv = data.slice(0, 12)
    const encrypted = data.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    )

    return decoder.decode(decrypted)
  }
}

// Rate limiters for different endpoints
export const rateLimiters = {
  auth: SecurityUtils.createRateLimiter(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  events: SecurityUtils.createRateLimiter(10, 60 * 1000), // 10 requests per minute
  tasks: SecurityUtils.createRateLimiter(20, 60 * 1000), // 20 requests per minute
  verification: SecurityUtils.createRateLimiter(30, 60 * 1000), // 30 requests per minute
  disputes: SecurityUtils.createRateLimiter(15, 60 * 1000), // 15 requests per minute
  templates: SecurityUtils.createRateLimiter(3, 60 * 1000), // 3 requests per minute
  marketplace: SecurityUtils.createRateLimiter(20, 60 * 1000), // 20 requests per minute
}