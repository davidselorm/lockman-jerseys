import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: session.email });
}
