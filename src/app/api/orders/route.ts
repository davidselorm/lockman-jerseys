import { NextResponse } from 'next/server';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_city,
      delivery_notes,
      total_amount,
      payment_method,
      order_channel,
      order_status,
      items,
      initial_payment_reference,
      order_number,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one jersey item' },
        { status: 400 }
      );
    }

    const channel = (order_channel && ['web', 'whatsapp', 'snapchat'].includes(order_channel)) ? order_channel : 'web';
    const custName = customer_name && customer_name.trim() ? customer_name.trim() : (channel === 'whatsapp' ? 'WhatsApp Lead' : (channel === 'snapchat' ? 'Snapchat Lead' : 'Direct Customer'));
    const custPhone = customer_phone && customer_phone.trim() ? customer_phone.trim() : 'Pending via Contact';
    const city = delivery_city || 'Accra';
    const delivAddress = delivery_address && delivery_address.trim() ? delivery_address.trim() : `${city} Delivery`;
    const orderNumber = order_number && order_number.trim() ? order_number.trim().toUpperCase() : `LK-${Date.now().toString().slice(-6)}`;
    const status = order_status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order_status) ? order_status : 'pending';
    const paymentMethod = payment_method || (channel === 'whatsapp' ? 'whatsapp' : (channel === 'snapchat' ? 'snapchat' : 'cash_on_delivery'));
    const finalTotal = total_amount ? Number(total_amount) : items.reduce((sum: number, it: any) => sum + (Number(it.total_price) || (Number(it.unit_price) * (Number(it.quantity) || 1))), 0);

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        throw new Error('Supabase client could not be initialized');
      }

      // 1. Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: custName,
          customer_phone: custPhone,
          customer_email: customer_email?.trim() || null,
          delivery_address: delivAddress,
          delivery_city: city,
          delivery_notes: delivery_notes?.trim() || null,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          order_status: status,
          order_channel: channel,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error('Error inserting order into Supabase:', orderError);
        return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
      }

      const orderId = orderData.id;

      // 2. Insert order items
      const orderItemsToInsert = items.map((item: OrderItem) => {
        // Only use product_id if it's a valid UUID; if it's mock string (e.g. "prod-rm-..."), pass null
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id);
        return {
          order_id: orderId,
          product_id: isValidUUID ? item.product_id : null,
          product_name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          image_url: item.image_url || null,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
      }

      // 3. Decrement stock if valid product UUID
      for (const item of items) {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id);
        if (isValidUUID) {
          const { data: sizeRow } = await supabase
            .from('product_sizes')
            .select('id, stock_quantity')
            .eq('product_id', item.product_id)
            .eq('size', item.size)
            .maybeSingle();

          if (sizeRow) {
            const newStock = Math.max(0, sizeRow.stock_quantity - item.quantity);
            await supabase
              .from('product_sizes')
              .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
              .eq('id', sizeRow.id);
          }
        }
      }

      // 4. Initial payment reference if provided
      let paymentRecord = null;
      if (initial_payment_reference) {
        const { data: payData } = await supabase
          .from('payment_records')
          .insert({
            order_id: orderId,
            payment_method: payment_method || 'momo_mtn',
            payment_reference: initial_payment_reference.trim(),
            amount: Number(total_amount),
            status: 'submitted',
          })
          .select()
          .maybeSingle();

        paymentRecord = payData;
      }

      const fullOrder: Order = {
        id: orderId,
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        delivery_city: orderData.delivery_city,
        delivery_notes: orderData.delivery_notes,
        total_amount: Number(orderData.total_amount),
        payment_method: orderData.payment_method,
        order_status: orderData.order_status,
        order_channel: orderData.order_channel,
        items,
        payment: paymentRecord || undefined,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
      };

      return NextResponse.json({ success: true, order: fullOrder }, { status: 201 });
    }

    // Fallback order object if Supabase not configured
    const fallbackOrder: Order = {
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      customer_name: custName,
      customer_phone: custPhone,
      customer_email: customer_email?.trim(),
      delivery_address: delivAddress,
      delivery_city: city,
      delivery_notes: delivery_notes?.trim(),
      total_amount: finalTotal,
      payment_method: paymentMethod,
      order_status: status,
      order_channel: channel,
      items,
      created_at: new Date().toISOString(),
      payment: initial_payment_reference ? {
        id: `pay-${Date.now()}`,
        order_id: `order-${Date.now()}`,
        payment_method: paymentMethod,
        payment_reference: initial_payment_reference.trim(),
        amount: finalTotal,
        status: 'submitted',
        created_at: new Date().toISOString(),
      } : undefined,
    };

    return NextResponse.json({ success: true, order: fallbackOrder, mode: 'local' }, { status: 201 });
  } catch (err: any) {
    console.error('API create order failed:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
