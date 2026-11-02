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

    // Inspect token payload at Edge for expiration
    try {
      const payloadPart = sessionCookie.value.split('.')[1];
      let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const decodedJson = atob(base64);
      const payload = JSON.parse(decodedJson);
      
      if (!payload || !payload.exp || Date.now() > payload.exp) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.set('lockman_admin_session', '', { path: '/', maxAge: 0 });
        redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return redirectResponse;
      }
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.set('lockman_admin_session', '', { path: '/', maxAge: 0 });
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
