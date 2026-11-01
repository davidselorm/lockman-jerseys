import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle plural /admin/dashboards typo -> redirect to /admin/dashboard
  if (pathname === '/admin/dashboards' || pathname.startsWith('/admin/dashboards/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/admin/dashboards', '/admin/dashboard');
    return NextResponse.redirect(url);
  }

  // Allow public access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Intercept all other /admin routes (including /admin/dashboard)
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('lockman_admin_session');

    // If no session cookie exists or it's malformed, redirect immediately to login
    if (!sessionCookie || !sessionCookie.value || sessionCookie.value.split('.').length !== 3) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      
      // Prevent browser caching of protected admin routes
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      redirectResponse.headers.set('Pragma', 'no-cache');
      redirectResponse.headers.set('Expires', '0');
      return redirectResponse;
    }
  }

  const response = NextResponse.next();
  
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
