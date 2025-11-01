# API FIX IMPLEMENTATIONS - CODE EXAMPLES

Complete code examples for fixing the critical issues found in the audit.

---

## 1. FILE LOCKING HELPER (Use for all JSON file operations)

**File:** `/lib/file-lock.ts`

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Atomic file lock mechanism for concurrent file operations
 * Prevents data corruption when multiple requests write simultaneously
 *
 * Usage:
 * const updatedData = await withFileLock(
 *   filePath,
 *   async (data) => { data.count++; return data; },
 *   { count: 0 }
 * );
 */
export async function withFileLock<T>(
  filePath: string,
  operation: (data: T) => Promise<T>,
  initialData: T
): Promise<T> {
  const lockFile = `${filePath}.lock`;
  const maxRetries = 10;
  const retryDelay = 100; // milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try to create lock file atomically (fails if already exists)
      await fs.writeFile(lockFile, 'locked', { flag: 'wx' });

      try {
        // Read current data
        let data: T;
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          data = JSON.parse(content);
        } catch (error) {
          // File doesn't exist or is invalid JSON, use initial data
          data = initialData;
        }

        // Perform the operation
        const updatedData = await operation(data);

        // Write back atomically
        await fs.writeFile(
          filePath,
          JSON.stringify(updatedData, null, 2),
          'utf-8'
        );

        return updatedData;
      } finally {
        // Always try to clean up lock file
        try {
          await fs.unlink(lockFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw new Error(`Failed to acquire lock for ${filePath} after ${maxRetries} attempts`);
      }
    }
  }

  throw new Error(`Failed to acquire lock for ${filePath}`);
}
```

**Update `/api/visitors/route.ts` to use it:**

```typescript
import { withFileLock } from '@/lib/file-lock';
import { NextResponse } from 'next/server';
import path from 'path';

const VISITORS_FILE = path.join(process.cwd(), 'data', 'visitors.json');

interface VisitorData {
  count: number;
  lastUpdated: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  const data = await withFileLock(VISITORS_FILE, async (current) => current, { count: 500, lastUpdated: new Date().toISOString() });
  return NextResponse.json({ count: data.count }, { headers: corsHeaders });
}

export async function POST() {
  const data = await withFileLock<VisitorData>(
    VISITORS_FILE,
    async (current) => ({
      count: current.count + 1,
      lastUpdated: new Date().toISOString(),
    }),
    { count: 500, lastUpdated: new Date().toISOString() }
  );

  return NextResponse.json(data, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}
```

---

## 2. VALIDATION HELPERS

**File:** `/lib/validation.ts`

```typescript
/**
 * Input validation helpers for all API routes
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  private errors: ValidationError[] = [];

  /**
   * Validate numeric amount (price, payment amount, etc)
   */
  validateAmount(field: string, value: any, opts: { min?: number; max?: number } = {}): boolean {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this.errors.push({ field, message: 'must be a number' });
      return false;
    }

    const min = opts.min ?? 0.01;
    const max = opts.max ?? 100000;

    if (value < min) {
      this.errors.push({ field, message: `must be at least R$${min}` });
      return false;
    }

    if (value > max) {
      this.errors.push({ field, message: `must not exceed R$${max}` });
      return false;
    }

    return true;
  }

  /**
   * Validate email address
   */
  validateEmail(field: string, value: any): boolean {
    if (typeof value !== 'string') {
      this.errors.push({ field, message: 'must be a string' });
      return false;
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(value)) {
      this.errors.push({ field, message: 'must be valid email format' });
      return false;
    }

    return true;
  }

  /**
   * Validate string with length constraints
   */
  validateString(
    field: string,
    value: any,
    opts: { required?: boolean; min?: number; max?: number } = {}
  ): boolean {
    if (typeof value !== 'string') {
      this.errors.push({ field, message: 'must be a string' });
      return false;
    }

    if (opts.required && value.trim().length === 0) {
      this.errors.push({ field, message: 'is required' });
      return false;
    }

    const length = value.trim().length;
    const min = opts.min ?? 1;
    const max = opts.max ?? 1000;

    if (length < min) {
      this.errors.push({ field, message: `must be at least ${min} characters` });
      return false;
    }

    if (length > max) {
      this.errors.push({ field, message: `must not exceed ${max} characters` });
      return false;
    }

    return true;
  }

  /**
   * Validate enum value
   */
  validateEnum(field: string, value: any, allowedValues: string[]): boolean {
    if (!allowedValues.includes(String(value))) {
      this.errors.push({
        field,
        message: `must be one of: ${allowedValues.join(', ')}`
      });
      return false;
    }

    return true;
  }

  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Check if validation passed
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Reset errors
   */
  reset(): void {
    this.errors = [];
  }
}

// Usage example:
// const validator = new Validator();
// validator.validateAmount('price', 150, { min: 100, max: 50000 });
// validator.validateEmail('email', 'user@example.com');
// if (!validator.isValid()) {
//   return error('Validation failed', validator.getErrors());
// }
```

---

## 3. STANDARDIZED API RESPONSES

**File:** `/lib/api-response.ts`

```typescript
import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[] | Record<string, string>;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Send standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: string[] | Record<string, string>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Send standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Common HTTP status helpers
 */
export const ApiResponse = {
  ok: <T,>(data: T) => successResponse(data, 200),
  created: <T,>(data: T) => successResponse(data, 201),
  badRequest: (message: string, details?: any) => errorResponse(message, 400, details),
  unauthorized: (message: string = 'Unauthorized') => errorResponse(message, 401),
  forbidden: (message: string = 'Forbidden') => errorResponse(message, 403),
  notFound: (message: string = 'Not found') => errorResponse(message, 404),
  conflict: (message: string) => errorResponse(message, 409),
  rateLimit: (message: string = 'Too many requests') => errorResponse(message, 429),
  internalError: (message: string = 'Internal server error') => errorResponse(message, 500),
};

// Usage in route:
// import { ApiResponse } from '@/lib/api-response';
// return ApiResponse.badRequest('Invalid amount', { amount: 'must be positive' });
```

---

## 4. RATE LIMITING HELPER

**File:** `/lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Initialize rate limiters for different endpoints
 * Each endpoint can have different limits
 */

// General API rate limiter: 100 requests per hour per IP
export const generalLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});

// Strict limiter for payment endpoints: 30 per hour
export const paymentLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  analytics: true,
});

// Telemetry limiter: 1000 events per hour (might be from many users)
export const telemetryLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '1 h'),
  analytics: true,
});

// LLM limiter: 60 requests per hour per user (costs money!)
export const llmLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 h'),
  analytics: true,
});

/**
 * Get identifier for rate limiting (IP or user ID)
 */
export function getIdentifier(request: Request): string {
  // Try to get from headers (set by CDN/proxy)
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-client-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous';

  return ip;
}

/**
 * Check rate limit and return response headers
 */
export function getRateLimitHeaders(result: any) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}

// Usage in route:
// import { paymentLimiter, getIdentifier, getRateLimitHeaders, ApiResponse } from '@/lib/...';
//
// export async function POST(request: NextRequest) {
//   const identifier = getIdentifier(request);
//   const result = await paymentLimiter.limit(identifier);
//
//   if (!result.success) {
//     return ApiResponse.rateLimit('Too many payment requests', {
//       headers: getRateLimitHeaders(result)
//     });
//   }
//
//   // ... rest of handler
// }
```

**Add to dependencies:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Add to `.env.local`:**
```
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

---

## 5. STRUCTURED LOGGER

**File:** `/lib/logger.ts`

```typescript
/**
 * Structured logging for API routes
 * Integrates with Axiom/Logdrain automatically
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  route: string;
  method: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
}

export class ApiLogger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: 'debug',
        message,
        data,
        ...this.context,
      })
    );
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        level: 'info',
        message,
        data,
        ...this.context,
      })
    );
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        message,
        data,
        ...this.context,
      })
    );
  }

  /**
   * Error level logging
   */
  error(message: string, error: any, data?: any) {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        error: {
          message: error?.message || String(error),
          stack: error?.stack,
          code: error?.code,
        },
        data,
        ...this.context,
      })
    );
  }
}

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Usage in route:
// import { ApiLogger, generateRequestId } from '@/lib/logger';
//
// const requestId = generateRequestId();
// const logger = new ApiLogger({
//   route: '/api/pix-payment',
//   method: 'POST',
//   timestamp: new Date().toISOString(),
//   requestId,
// });
//
// logger.info('Payment requested', { productId, amount });
// logger.error('Payment failed', error, { productId });
```

---

## 6. FIX: PIX PAYMENT WITH VALIDATION

**Updated:** `/app/api/pix-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Validator } from '@/lib/validation';
import { ApiResponse } from '@/lib/api-response';
import { paymentLimiter, getIdentifier, getRateLimitHeaders } from '@/lib/rate-limit';
import { ApiLogger, generateRequestId } from '@/lib/logger';

const EBANX_API_URL = process.env.EBANX_API_URL || 'https://sandbox.ebanx.com/ws/direct';
const EBANX_TIMEOUT = 30000; // 30 seconds

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const logger = new ApiLogger({
    route: '/api/pix-payment',
    method: 'POST',
    timestamp: new Date().toISOString(),
    requestId,
  });

  try {
    // Rate limiting
    const identifier = getIdentifier(request);
    const rateLimitResult = await paymentLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', { identifier });
      return ApiResponse.rateLimit('Too many payment requests', {
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    // Parse and validate request
    const body = await request.json();
    const validator = new Validator();

    // Validate required fields
    validator.validateString('productId', body.productId, { required: true, max: 100 });
    validator.validateString('productName', body.productName, { required: true, max: 200 });
    validator.validateAmount('amount', body.amount, { min: 0.01, max: 100000 });

    // Validate optional fields
    if (body.buyerEmail) {
      validator.validateEmail('buyerEmail', body.buyerEmail);
    }
    if (body.buyerName) {
      validator.validateString('buyerName', body.buyerName, { max: 100 });
    }

    if (!validator.isValid()) {
      logger.warn('Validation failed', { errors: validator.getErrors() });
      return ApiResponse.badRequest('Validation failed', validator.getErrors());
    }

    const { amount, productId, productName, buyerEmail, buyerName } = body;

    // Check environment
    const integrationKey = process.env.EBANX_INTEGRATION_KEY;
    if (!integrationKey) {
      logger.error('EBANX_INTEGRATION_KEY not configured', new Error('Missing env var'));
      return ApiResponse.internalError('Payment service not configured');
    }

    // Prepare EBANX request
    const merchantCode = `${productId}-${Date.now()}`;
    const ebanxPayload = {
      integration_key: integrationKey,
      operation: 'request',
      payment: {
        name: buyerName || 'Customer',
        email: buyerEmail || 'noreply@llmmerch.local',
        document: '00000000000000', // TODO: Collect real CPF from user
        country: 'br',
        payment_type_code: 'pix',
        merchant_payment_code: merchantCode,
        currency_code: 'BRL',
        amount_total: amount,
        description: `Purchase of ${productName}`,
        pix: {
          time_limit: 900, // 15 minutes
        },
      },
    };

    logger.info('Creating EBANX payment', { productId, amount, merchantCode });

    // Call EBANX with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EBANX_TIMEOUT);

    let ebanxResponse;
    try {
      ebanxResponse = await fetch(EBANX_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ebanxPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!ebanxResponse.ok) {
      const errorText = await ebanxResponse.text();
      logger.error('EBANX API error', new Error(errorText), {
        status: ebanxResponse.status,
      });
      return ApiResponse.internalError('Failed to create payment with EBANX');
    }

    const ebanxData = await ebanxResponse.json();

    if (ebanxData.status !== 'SUCCESS' || !ebanxData.payment) {
      logger.error('EBANX payment creation failed', new Error(ebanxData.error_message || 'Unknown error'), {
        ebanxStatus: ebanxData.status,
      });
      return ApiResponse.badRequest(ebanxData.error_message || 'Payment creation failed');
    }

    const { payment } = ebanxData;
    const pixCode = payment.pix?.qr_code_value || payment.redirect_url;
    const paymentHash = payment.hash;

    logger.info('Payment created successfully', {
      paymentHash: paymentHash.slice(0, 8) + '...',
      merchantCode,
    });

    return ApiResponse.created({
      paymentHash,
      pixCode,
      qrCodeUrl: payment.redirect_url || '',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: payment.status,
      amount: payment.amount_total,
      currency: payment.currency_code,
    });
  } catch (error) {
    logger.error('Unexpected error in POST handler', error);
    return ApiResponse.internalError();
  }
}
```

---

## 7. FIX: OFFERS WITH AUTHORIZATION

**Updated:** `/app/api/offers/route.ts` PUT handler

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { withFileLock } from '@/lib/file-lock';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { offerId, action, ownerEmail } = body;

    // Validate input
    if (!offerId || typeof offerId !== 'string') {
      return ApiResponse.badRequest('offerId is required');
    }
    if (!action || !['accept', 'reject'].includes(action)) {
      return ApiResponse.badRequest('action must be "accept" or "reject"');
    }
    if (!ownerEmail || !ownerEmail.includes('@')) {
      return ApiResponse.badRequest('ownerEmail is required (valid email)');
    }

    // CRITICAL: Verify user is authorized to modify this offer
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized('You must be logged in');
    }

    // Verify the user owns/controls this offer
    // In a real app, check database for offer ownership
    // For now, at least verify they're using their own email
    if (session.user.email !== ownerEmail) {
      return ApiResponse.forbidden('You cannot modify offers for other users');
    }

    // Update offer with file locking
    const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');
    const updatedOffers = await withFileLock<OffersData>(
      OFFERS_FILE,
      async (offersData) => {
        const offer = offersData.offers.find((o) => o.id === offerId);

        if (!offer) {
          throw new Error('Offer not found');
        }

        if (offer.status !== 'pending') {
          throw new Error('Offer already processed');
        }

        offer.status = action === 'accept' ? 'accepted' : 'rejected';
        offer.updatedAt = new Date().toISOString();
        offersData.lastUpdated = new Date().toISOString();

        return offersData;
      },
      { offers: [], lastUpdated: new Date().toISOString() }
    );

    const updatedOffer = updatedOffers.offers.find((o) => o.id === offerId);

    return ApiResponse.ok({
      message: `Offer ${action}ed`,
      offer: updatedOffer,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Offer not found') {
      return ApiResponse.notFound('Offer not found');
    }
    if (error instanceof Error && error.message === 'Offer already processed') {
      return ApiResponse.badRequest('Offer already processed');
    }

    console.error('Error updating offer:', error);
    return ApiResponse.internalError();
  }
}
```

---

## 8. FIX: ADMIN EMAILS TO ENV

**Update:** `/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Parse admin emails from environment variable
 * Format: "email1@example.com,email2@example.com"
 */
function getAdminEmails(): Set<string> {
  const adminEmailsStr = process.env.ADMIN_EMAILS || '';
  return new Set(
    adminEmailsStr
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
  );
}

const ADMIN_EMAILS = getAdminEmails();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Optional: restrict to email domain
      if (process.env.REQUIRE_EMAIL_DOMAIN) {
        const domain = user.email?.split('@')[1];
        if (domain !== process.env.REQUIRE_EMAIL_DOMAIN) {
          console.warn(`Sign in attempted from non-whitelisted domain: ${domain}`);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user?.email && user?.id) {
        token.isAdmin = ADMIN_EMAILS.has(user.email);
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (was 30)
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Update:** `.env.example`

```bash
# Admin emails (comma-separated)
ADMIN_EMAILS=leonardo.lech@gmail.com,leo@lbldomain.com

# Optional: Restrict signups to specific email domain
# REQUIRE_EMAIL_DOMAIN=company.com
```

---

## 9. ENVIRONMENT VALIDATION AT STARTUP

**File:** `/lib/env-validation.ts`

```typescript
/**
 * Validate all required environment variables at startup
 * Call this in app initialization
 */

export function validateEnvironment() {
  const required = {
    EBANX_INTEGRATION_KEY: 'PIX payment processing',
    NEXTAUTH_SECRET: 'Session encryption',
    GOOGLE_CLIENT_ID: 'Google OAuth login',
    GOOGLE_CLIENT_SECRET: 'Google OAuth login',
  };

  const optional = {
    OPENAI_API_KEY: 'OpenAI API for /api/ask',
    ANTHROPIC_API_KEY: 'Anthropic API for /api/ask',
    UPSTASH_REDIS_REST_URL: 'Rate limiting',
    UPSTASH_REDIS_REST_TOKEN: 'Rate limiting',
  };

  // Check required
  const missing: string[] = [];
  for (const [key, description] of Object.entries(required)) {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables:\n  - ${missing.join('\n  - ')}`);
  }

  // Check optional and warn
  const notConfigured: string[] = [];
  for (const [key, description] of Object.entries(optional)) {
    if (!process.env[key]) {
      notConfigured.push(`${key} (${description})`);
    }
  }

  if (notConfigured.length > 0) {
    console.warn(
      'Optional features not configured:\n  - ' +
      notConfigured.join('\n  - ') +
      '\n\nSome features may not work correctly.'
    );
  }

  // Check LLM providers
  const hasLLMProvider =
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!hasLLMProvider) {
    console.warn(
      'No LLM API keys configured. /api/ask will use static fallback responses.'
    );
  }

  console.log('Environment validation passed');
}

// Call in: app/layout.tsx or middleware.ts
// Example:
// if (typeof window === 'undefined') {
//   validateEnvironment();
// }
```

---

## Installation Instructions

1. **Copy helper files:**
   ```bash
   cp lib/file-lock.ts /lib/
   cp lib/validation.ts /lib/
   cp lib/api-response.ts /lib/
   cp lib/rate-limit.ts /lib/
   cp lib/logger.ts /lib/
   cp lib/env-validation.ts /lib/
   ```

2. **Install dependencies:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **Update environment variables:**
   ```bash
   # Add to .env.local
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ADMIN_EMAILS=your-email@example.com
   EBANX_API_URL=https://sandbox.ebanx.com/ws/direct
   ```

4. **Update routes one by one:**
   - Start with `/api/pix-payment`
   - Then `/api/offers`
   - Then `/api/telemetry`, `/api/inventory`, `/api/visitors`
   - Test each after updating

5. **Run tests:**
   ```bash
   npm test -- --testPathPattern=api
   ```

---

**Next: Read the full audit report for detailed explanations of each issue.**
