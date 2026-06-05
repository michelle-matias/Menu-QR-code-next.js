import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/menu', '/orders', '/qr'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected (dashboard routes)
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Skip public menu pages /menu/[userId]
  if (pathname.startsWith('/menu/') && pathname.split('/').length >= 3) {
    return NextResponse.next();
  }

  if (isProtected) {
    // Check for Supabase auth cookie
    const authCookie = request.cookies.getAll().find(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );

    if (!authCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/qr/:path*', '/menu/:path*'],
};
