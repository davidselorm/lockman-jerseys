import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/types';

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          payment_records (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin orders from Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const orders: Order[] = (data || []).map((row: any) => ({
        id: row.id,
        order_number: row.order_number,
        customer_name: row.customer_name,
        customer_phone: row.customer_phone,
        customer_email: row.customer_email || undefined,
        delivery_address: row.delivery_address,
        delivery_city: row.delivery_city,
        delivery_notes: row.delivery_notes || undefined,
        total_amount: Number(row.total_amount),
        payment_method: row.payment_method,
        order_status: row.order_status,
        order_channel: row.order_channel,
        items: (row.order_items || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id || '',
          product_name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          image_url: item.image_url || '',
        })),
        payment: row.payment_records && row.payment_records.length > 0 ? {
          id: row.payment_records[0].id,
          order_id: row.payment_records[0].order_id,
          payment_method: row.payment_records[0].payment_method,
          payment_reference: row.payment_records[0].payment_reference,
          proof_image_url: row.payment_records[0].proof_image_url || undefined,
          amount: Number(row.payment_records[0].amount),
          status: row.payment_records[0].status,
          notes: row.payment_records[0].notes || undefined,
          verified_by: row.payment_records[0].verified_by || undefined,
          verified_at: row.payment_records[0].verified_at || undefined,
          created_at: row.payment_records[0].created_at,
        } : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return NextResponse.json({ success: true, orders });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // If Supabase not configured, handled gracefully by client
  return NextResponse.json({ success: true, orders: [], mode: 'local' });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { order_id, status } = body as { order_id: string; status: OrderStatus };

    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          order_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status in Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
