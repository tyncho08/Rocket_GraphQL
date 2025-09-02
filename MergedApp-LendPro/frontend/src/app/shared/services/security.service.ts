import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SecurityConfig {
  maxInputLength: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  rateLimitWindow: number; // in milliseconds
  maxRequestsPerWindow: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface SecurityEvent {
  type: 'suspicious_input' | 'rate_limit_exceeded' | 'invalid_file' | 'xss_attempt' | 'sql_injection_attempt';
  timestamp: Date;
  details: any;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly defaultConfig: SecurityConfig = {
    maxInputLength: 1000,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'gif'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 100
  };

  private requestHistory: Map<string, number[]> = new Map();
  private securityEvents: SecurityEvent[] = [];

  // XSS protection patterns
  private readonly xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi
  ];

  // SQL injection patterns
  private readonly sqlPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi,
    /((\b(AND|OR)\b.{1,6}?(\b(ASCII|BIN|BINARY|CAST|CONCAT|CURRENT_USER|DATABASE|IF|MID|NOW|ORD|RAND|SUBSTRING|USER|VERSION)\b))|(\b(AND|OR)\b\s*\d+['"]?\s*?[=><]))/gi,
    /HAVING\s+(\d+|[\w"']+)\s*[=><]/gi,
    /\bUNION\b.{1,100}?\bSELECT\b/gi,
    /\b(GRANT|REVOKE)\b.{1,100}?\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|EXEC|EXECUTE|ALL)\b/gi
  ];

  // Path traversal patterns
  private readonly pathTraversalPatterns = [
    /\.\.[\/\\]/gi,
    /[\/\\]\.\.[\/\\]/gi,
    /%2e%2e[\/\\]/gi,
    /\.\.[%2f%5c]/gi
  ];

  constructor(private http: HttpClient) {}

  /**
   * Sanitize user input to prevent XSS and other injection attacks
   */
  sanitizeInput(input: string, options?: Partial<SecurityConfig>): ValidationResult {
    const config = { ...this.defaultConfig, ...options };
    const errors: string[] = [];
    
    if (!input) {
      return { isValid: true, sanitizedValue: '', errors: [] };
    }

    // Check input length
    if (input.length > config.maxInputLength) {
      errors.push(`Input exceeds maximum length of ${config.maxInputLength} characters`);
    }

    // Check for XSS patterns
    const xssDetected = this.xssPatterns.some(pattern => pattern.test(input));
    if (xssDetected) {
      errors.push('Potentially malicious script detected');
      this.logSecurityEvent('xss_attempt', { input: input.substring(0, 100) });
    }

    // Check for SQL injection patterns
    const sqlInjectionDetected = this.sqlPatterns.some(pattern => pattern.test(input));
    if (sqlInjectionDetected) {
      errors.push('Potentially malicious SQL detected');
      this.logSecurityEvent('sql_injection_attempt', { input: input.substring(0, 100) });
    }

    // Check for path traversal
    const pathTraversalDetected = this.pathTraversalPatterns.some(pattern => pattern.test(input));
    if (pathTraversalDetected) {
      errors.push('Path traversal attempt detected');
      this.logSecurityEvent('suspicious_input', { type: 'path_traversal', input: input.substring(0, 100) });
    }

    // Sanitize the input
    let sanitized = input;
    
    // Remove HTML tags and encode special characters
    sanitized = this.stripHtml(sanitized);
    sanitized = this.encodeSpecialCharacters(sanitized);
    
    // Trim whitespace
    sanitized = sanitized.trim();

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate file upload security
   */
  validateFile(file: File, options?: Partial<SecurityConfig>): ValidationResult {
    const config = { ...this.defaultConfig, ...options };
    const errors: string[] = [];

    // Check file size
    if (file.size > config.maxFileSize) {
      errors.push(`File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!config.allowedFileTypes.includes(fileExtension)) {
      errors.push(`File type '${fileExtension}' is not allowed`);
      this.logSecurityEvent('invalid_file', { 
        fileName: file.name, 
        fileType: fileExtension, 
        fileSize: file.size 
      });
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(php|asp|aspx|jsp|js|vbs|bat|cmd|exe|scr)$/i,
      /\.(htaccess|htpasswd)$/i,
      /^\.+/,  // Hidden files starting with dots
      /%00/,   // Null bytes
      /[<>:"|?*]/  // Invalid characters
    ];

    const suspiciousName = suspiciousPatterns.some(pattern => pattern.test(file.name));
    if (suspiciousName) {
      errors.push('Suspicious file name detected');
      this.logSecurityEvent('invalid_file', { 
        fileName: file.name, 
        reason: 'suspicious_name' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting to prevent abuse
   */
  checkRateLimit(identifier: string, options?: Partial<SecurityConfig>): boolean {
    const config = { ...this.defaultConfig, ...options };
    const now = Date.now();
    const windowStart = now - config.rateLimitWindow;
    
    // Get or create request history for this identifier
    let requests = this.requestHistory.get(identifier) || [];
    
    // Remove old requests outside the current window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit is exceeded
    if (requests.length >= config.maxRequestsPerWindow) {
      this.logSecurityEvent('rate_limit_exceeded', {
        identifier,
        requestCount: requests.length,
        timeWindow: config.rateLimitWindow
      });
      return false;
    }
    
    // Add current request
    requests.push(now);
    this.requestHistory.set(identifier, requests);
    
    return true;
  }

  /**
   * Validate email addresses
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>'"]/,  // HTML characters
      /javascript:/i,
      /data:/i,
      /vbscript:/i
    ];
    
    const suspicious = suspiciousPatterns.some(pattern => pattern.test(email));
    if (suspicious) {
      errors.push('Suspicious email format detected');
      this.logSecurityEvent('suspicious_input', { type: 'email', value: email });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: email.toLowerCase().trim()
    };
  }

  /**
   * Validate phone numbers
   */
  validatePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];
    
    // Remove common formatting
    const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
    
    // Check if it contains only digits (and optionally starts with + for international)
    const phoneRegex = /^(\+?1?)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    
    if (!phoneRegex.test(cleaned)) {
      errors.push('Invalid phone number format');
    }
    
    // Check for suspicious patterns
    if (cleaned.length < 10 || cleaned.length > 15) {
      errors.push('Phone number length is invalid');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: cleaned
    };
  }

  /**
   * Validate SSN (Social Security Number)
   */
  validateSSN(ssn: string): ValidationResult {
    const errors: string[] = [];
    
    // Remove formatting
    const cleaned = ssn.replace(/[\s\-]/g, '');
    
    // Check format
    const ssnRegex = /^\d{9}$/;
    
    if (!ssnRegex.test(cleaned)) {
      errors.push('Invalid SSN format');
    }
    
    // Check for invalid patterns
    const invalidPatterns = [
      /^000/,        // Cannot start with 000
      /^666/,        // Cannot start with 666
      /^9\d{2}/,     // Cannot start with 9xx
      /^\d{3}00/,    // Middle digits cannot be 00
      /^\d{5}0000$/  // Last 4 digits cannot be 0000
    ];
    
    const invalid = invalidPatterns.some(pattern => pattern.test(cleaned));
    if (invalid) {
      errors.push('Invalid SSN number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: this.maskSSN(cleaned)
    };
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (client-side hashing for additional security)
   */
  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get security events for monitoring
   */
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  /**
   * Clear security events (for admin use)
   */
  clearSecurityEvents(): void {
    this.securityEvents = [];
  }

  /**
   * Check if user agent looks suspicious
   */
  checkUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|postman/i,
      /python|java|ruby|perl/i,
      /nikto|sqlmap|nessus/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  private encodeSpecialCharacters(input: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'\/]/g, (char) => map[char]);
  }

  private maskSSN(ssn: string): string {
    if (ssn.length !== 9) return ssn;
    return `***-**-${ssn.substring(5)}`;
  }

  private logSecurityEvent(type: SecurityEvent['type'], details: any): void {
    const event: SecurityEvent = {
      type,
      timestamp: new Date(),
      details,
      userAgent: navigator.userAgent,
      // Note: IP address would need to be provided by backend
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
    
    // Log to console in development
    if (!environment.production) {
      console.warn('Security Event:', event);
    }
    
    // In production, you might want to send this to a security monitoring service
  }
}

// Environment check (you'd import this from your environment file)
const environment = {
  production: false  // This should come from your actual environment configuration
};