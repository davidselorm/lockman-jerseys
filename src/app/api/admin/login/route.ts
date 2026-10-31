import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken, COOKIE_NAME } from '@/lib/auth/admin-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@lockmanjerseys.com').trim().toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'LockmanAdmin2025!';

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPassword = password || '';

    if (inputEmail === expectedEmail && inputPassword === expectedPassword) {
      // Generate cryptographically signed token
      const token = createAdminToken(inputEmail);

      const cookieStore = cookies();
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Authenticated successfully',
        email: inputEmail 
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}
