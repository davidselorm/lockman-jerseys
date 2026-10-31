import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { PaymentStatus } from '@/types';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { order_id, status, notes, verified_by } = body as {
      order_id: string;
      status: PaymentStatus;
      notes?: string;
      verified_by?: string;
    };

    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      const now = new Date().toISOString();

      // 1. Update payment record for this order
      const { data: payData, error: payError } = await supabase
        .from('payment_records')
        .update({
          status,
          notes: notes || null,
          verified_by: verified_by || session.email || 'Admin',
          verified_at: now,
        })
        .eq('order_id', order_id)
        .select()
        .single();

      if (payError) {
        console.error('Error verifying payment in Supabase:', payError);
        return NextResponse.json({ error: payError.message }, { status: 500 });
      }

      // 2. If payment is confirmed, also update order status to processing
      if (status === 'confirmed') {
        await supabase
          .from('orders')
          .update({
            order_status: 'processing',
            updated_at: now,
          })
          .eq('id', order_id);
      }

      return NextResponse.json({ success: true, payment: payData });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
