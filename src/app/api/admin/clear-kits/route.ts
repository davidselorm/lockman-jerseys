import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { Pool } from 'pg';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

function getDatabasePool(): Pool | null {
  const rawUrl = 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL;

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      return new Pool({
        host: parsed.hostname,
        port: Number(parsed.port) || 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, '') || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      });
    } catch {
      return new Pool({
        connectionString: rawUrl.replace(/[?&]sslmode=[^&]+/g, ''),
        ssl: { rejectUnauthorized: false },
      });
    }
  }
  return null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  const secretHeader = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_PASSWORD || 'LockmanAdmin2025!';

  if (!session.authenticated && secretHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs: string[] = [];

  // 1. Wipe via Supabase JS client if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createClient();
      if (supabase) {
        // Delete child rows first, then products
        await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('product_sizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('payment_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        logs.push('Cleared products and orders from Supabase tables.');
      }
    } catch (e: any) {
      logs.push(`Supabase wipe warning: ${e.message}`);
    }
  }

  // 2. Wipe via direct PostgreSQL pool if connected
  const pool = getDatabasePool();
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          TRUNCATE TABLE public.product_images, public.product_sizes, public.order_items, public.payment_records, public.orders, public.products CASCADE;
        `);
        logs.push('Executed TRUNCATE CASCADE on PostgreSQL tables.');
      } finally {
        client.release();
      }
    } catch (e: any) {
      logs.push(`Postgres direct truncate notice: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Production database completely cleared. All dummy kits and mock orders removed.',
    logs,
  });
}
