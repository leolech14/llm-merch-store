import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

/**
 * Rate Limiting - Simple in-memory implementation
 * Tracks requests per IP address
 *
 * Configuration:
 * - Limit: 60 requests per minute per IP
 * - Applied to: /api/* routes only
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;

/**
 * Get client IP from request
 */
function getClientIP(req: any): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore[ip];

  // Initialize or reset if window expired
  if (!record || now > record.resetTime) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return true;
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

/**
 * Middleware with rate limiting and auth
 */
export default withAuth(
  function middleware(req: any) {
    const token = req.nextauth?.token as JWT | undefined;
    const isAdmin = (token as any)?.isAdmin || false;
    const path = req.nextUrl.pathname;

    // Apply rate limiting to API routes
    if (path.startsWith("/api")) {
      const clientIP = getClientIP(req);
      if (!checkRateLimit(clientIP)) {
        return NextResponse.json(
          { error: "Too many requests. Rate limit: 60 requests per minute" },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
              "X-RateLimit-Window": "60s",
            },
          }
        );
      }
    }

    // Protect /admin routes
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
    }

    // Protect /api/admin routes
    if (path.startsWith("/api/admin") && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes (no auth needed)
        if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
          return true;
        }

        // Admin routes require login
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    // Match all API routes except webhooks
    "/((?!api/webhook)(?:api)/:path*)",
  ],
};
