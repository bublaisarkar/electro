import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Protect all /seller/* routes (pages and API) – require authentication AND seller role
  if (pathname.startsWith('/seller') || pathname.startsWith('/api/seller')) {
    // Not authenticated → redirect to sign-in
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is seller OR admin
    const isAuthorized = token.isSeller === true || token.isAdmin === true;
    if (!isAuthorized) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin-only sections (users management)
    if (
      pathname.startsWith('/seller/users') ||
      pathname.startsWith('/api/seller/admin')
    ) {
      if (!token.isAdmin) {
        return NextResponse.redirect(new URL('/seller', req.url));
      }
    }

    // Authorized – allow access
    return NextResponse.next();
  }

  // Allow access to public routes
  return NextResponse.next();
}

// Config: apply proxy only to these paths
export const config = {
  matcher: ['/seller/:path*', '/api/seller/:path*'],
};