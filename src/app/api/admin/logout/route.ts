import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getAdminSession } from '@/lib/auth/admin-auth';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getAdminSession();

  if (session.authenticated) {
    return NextResponse.json({ authenticated: true, email: session.email });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
