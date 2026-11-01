import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getAdminSession } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = cookies();
  
  // Clear via next/headers cookieStore
  cookieStore.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  cookieStore.delete(COOKIE_NAME);

  // Clear via response Set-Cookie header
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}

export async function GET() {
  const session = await getAdminSession();

  if (session.authenticated) {
    return NextResponse.json({ authenticated: true, email: session.email });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
