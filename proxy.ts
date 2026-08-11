import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ----- CORS handling for ALL API routes -----
  if (pathname.startsWith('/api')) {
    // Handle preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    // For other API requests, we'll add CORS headers after auth checks
    // but we need to preserve them – we'll create a helper function later.
  }

  // ----- Your existing auth logic (unchanged) -----
  // Protect all /seller/* routes (pages and API) – require authentication AND seller role
  if (pathname.startsWith('/seller') || pathname.startsWith('/api/seller')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      const redirect = NextResponse.redirect(signInUrl);
      // Add CORS headers to redirects too
      redirect.headers.set('Access-Control-Allow-Origin', '*');
      return redirect;
    }

    const isAuthorized = token.isSeller === true || token.isAdmin === true;
    if (!isAuthorized) {
      const redirect = NextResponse.redirect(new URL('/', req.url));
      redirect.headers.set('Access-Control-Allow-Origin', '*');
      return redirect;
    }

    if (
      pathname.startsWith('/seller/users') ||
      pathname.startsWith('/api/seller/admin')
    ) {
      if (!token.isAdmin) {
        const redirect = NextResponse.redirect(new URL('/seller', req.url));
        redirect.headers.set('Access-Control-Allow-Origin', '*');
        return redirect;
      }
    }

    // Authorized – allow access
    const response = NextResponse.next();
    // Add CORS headers to all API responses
    if (pathname.startsWith('/api')) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return response;
  }

  // ----- Public routes (non‑API) -----
  // If it's an API route but not /seller, still add CORS
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // For non‑API, non‑seller pages, just pass through
  return NextResponse.next();
}

// ----- Update the matcher to cover ALL API routes -----
export const config = {
  matcher: ['/seller/:path*', '/api/seller/:path*', '/api/:path*'],
};