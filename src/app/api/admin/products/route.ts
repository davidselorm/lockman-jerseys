import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Product, JerseySize } from '@/types';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productData = await request.json();

    if (!productData.name || !productData.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      // 1. Insert product row
      const { data: createdProduct, error: prodErr } = await supabase
        .from('products')
        .insert({
          name: productData.name.trim(),
          slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          club_or_national: productData.club_or_national || 'Other',
          season: productData.season || '2024/25',
          jersey_type: productData.jersey_type || 'Home',
          category_id: productData.category_id || null,
          price: Number(productData.price),
          original_price: productData.original_price ? Number(productData.original_price) : null,
          description: productData.description || '',
          is_featured: Boolean(productData.is_featured),
          is_new_arrival: Boolean(productData.is_new_arrival),
          is_popular: Boolean(productData.is_popular),
          is_available: productData.is_available !== false,
        })
        .select()
        .single();

      if (prodErr || !createdProduct) {
        console.error('Error inserting product into Supabase:', prodErr);
        return NextResponse.json({ error: prodErr?.message || 'Failed to create product' }, { status: 500 });
      }

      const productId = createdProduct.id;

      // 2. Insert product images
      if (Array.isArray(productData.images) && productData.images.length > 0) {
        const imageInserts = productData.images.map((url: string, index: number) => ({
          product_id: productId,
          image_url: url.trim(),
          is_primary: index === 0,
          display_order: index,
        }));

        await supabase.from('product_images').insert(imageInserts);
      }

      // 3. Insert product sizes
      if (Array.isArray(productData.sizes) && productData.sizes.length > 0) {
        const sizeInserts = productData.sizes.map((s: { size: JerseySize; stock: number }) => ({
          product_id: productId,
          size: s.size,
          stock_quantity: Number(s.stock) || 0,
        }));

        await supabase.from('product_sizes').insert(sizeInserts);
      }

      const total_stock = (productData.sizes || []).reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);

      const returnedProduct: Product = {
        ...createdProduct,
        images: productData.images || [],
        sizes: productData.sizes || [],
        total_stock,
      };

      return NextResponse.json({ success: true, product: returnedProduct }, { status: 201 });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      // 1. Update product main row
      const updateFields: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updateFields.name = updates.name.trim();
      if (updates.slug !== undefined) updateFields.slug = updates.slug.trim();
      if (updates.club_or_national !== undefined) updateFields.club_or_national = updates.club_or_national;
      if (updates.season !== undefined) updateFields.season = updates.season;
      if (updates.jersey_type !== undefined) updateFields.jersey_type = updates.jersey_type;
      if (updates.category_id !== undefined) updateFields.category_id = updates.category_id;
      if (updates.price !== undefined) updateFields.price = Number(updates.price);
      if (updates.original_price !== undefined) updateFields.original_price = updates.original_price ? Number(updates.original_price) : null;
      if (updates.description !== undefined) updateFields.description = updates.description;
      if (updates.is_featured !== undefined) updateFields.is_featured = updates.is_featured;
      if (updates.is_new_arrival !== undefined) updateFields.is_new_arrival = updates.is_new_arrival;
      if (updates.is_popular !== undefined) updateFields.is_popular = updates.is_popular;
      if (updates.is_available !== undefined) updateFields.is_available = updates.is_available;

      const { data: updatedProduct, error: prodErr } = await supabase
        .from('products')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (prodErr) {
        console.error('Error updating product in Supabase:', prodErr);
        return NextResponse.json({ error: prodErr.message }, { status: 500 });
      }

      // 2. Update sizes if provided
      if (Array.isArray(updates.sizes)) {
        for (const s of updates.sizes) {
          await supabase
            .from('product_sizes')
            .upsert({
              product_id: id,
              size: s.size,
              stock_quantity: Number(s.stock) || 0,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'product_id,size' });
        }
      }

      // 3. Update images if provided
      if (Array.isArray(updates.images)) {
        // Delete old images and reinsert
        await supabase.from('product_images').delete().eq('product_id', id);
        const imageInserts = updates.images.map((url: string, index: number) => ({
          product_id: id,
          image_url: url.trim(),
          is_primary: index === 0,
          display_order: index,
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      return NextResponse.json({ success: true, product: updatedProduct });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
