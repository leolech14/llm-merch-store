import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware - Protect admin routes
 *
 * Routes protected:
 * - /admin/* (admin panel)
 * - /api/admin/* (admin APIs)
 */

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.isAdmin || false;
    const path = req.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }

    // Protect /api/admin routes
    if (path.startsWith('/api/admin') && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
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
        if (!path.startsWith('/admin') && !path.startsWith('/api/admin')) {
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
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
