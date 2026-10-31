import { NextResponse } from 'next/server';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { PaymentRecord } from '@/types';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const orderId = context.params.id;
    const body = await request.json();
    const { payment_reference, proof_image_url } = body;

    if (!orderId || !payment_reference) {
      return NextResponse.json(
        { error: 'Order ID and payment reference are required' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        throw new Error('Supabase client could not be initialized');
      }

      // 1. Get the order to read amount and method
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('id, total_amount, payment_method')
        .eq('id', orderId)
        .maybeSingle();

      if (orderFetchError || !orderData) {
        return NextResponse.json(
          { error: 'Order not found in database' },
          { status: 404 }
        );
      }

      // 2. Check if a payment record already exists for this order
      const { data: existingPayment } = await supabase
        .from('payment_records')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      let paymentRecord: PaymentRecord;

      if (existingPayment) {
        // Update existing payment record
        const { data: updated, error: updateErr } = await supabase
          .from('payment_records')
          .update({
            payment_reference: payment_reference.trim(),
            proof_image_url: proof_image_url || null,
            status: 'submitted',
            amount: Number(orderData.total_amount),
          })
          .eq('id', existingPayment.id)
          .select()
          .single();

        if (updateErr) {
          throw updateErr;
        }
        paymentRecord = updated;
      } else {
        // Insert new payment record
        const { data: inserted, error: insertErr } = await supabase
          .from('payment_records')
          .insert({
            order_id: orderId,
            payment_method: orderData.payment_method,
            payment_reference: payment_reference.trim(),
            proof_image_url: proof_image_url || null,
            amount: Number(orderData.total_amount),
            status: 'submitted',
          })
          .select()
          .single();

        if (insertErr) {
          throw insertErr;
        }
        paymentRecord = inserted;
      }

      return NextResponse.json({ success: true, payment: paymentRecord });
    }

    // Fallback if Supabase not configured
    const fallbackPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      order_id: orderId,
      payment_method: 'momo_mtn',
      payment_reference: payment_reference.trim(),
      proof_image_url: proof_image_url || undefined,
      amount: 0,
      status: 'submitted',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, payment: fallbackPayment, mode: 'local' });
  } catch (err: any) {
    console.error('API submit payment failed:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
