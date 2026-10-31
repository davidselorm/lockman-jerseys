import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { Pool, PoolClient } from 'pg';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '@/lib/store/seed-data';

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
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 15000,
      });
    } catch {
      return new Pool({
        connectionString: rawUrl.replace(/[?&]sslmode=[^&]+/g, ''),
        ssl: { rejectUnauthorized: false },
      });
    }
  }

  if (process.env.POSTGRES_HOST && process.env.POSTGRES_USER) {
    return new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE || 'postgres',
      port: 5432,
      ssl: { rejectUnauthorized: false },
    });
  }

  return null;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pool = getDatabasePool();
  if (!pool) {
    return NextResponse.json({
      connected: false,
      message: 'No PostgreSQL connection string found in environment variables (POSTGRES_URL or DATABASE_URL).',
    });
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT 
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') as has_products,
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') as has_categories,
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') as has_orders
      `);

      const tablesReady = 
        Number(res.rows[0].has_products) > 0 && 
        Number(res.rows[0].has_categories) > 0;

      let productCount = 0;
      let orderCount = 0;

      if (tablesReady) {
        const counts = await client.query(`
          SELECT 
            (SELECT count(*) FROM public.products) as products_count,
            (SELECT count(*) FROM public.orders) as orders_count
        `);
        productCount = Number(counts.rows[0].products_count);
        orderCount = Number(counts.rows[0].orders_count);
      }

      return NextResponse.json({
        connected: true,
        tablesReady,
        productCount,
        orderCount,
        database: process.env.POSTGRES_DATABASE || 'postgres',
        host: process.env.POSTGRES_HOST ? `${process.env.POSTGRES_HOST.slice(0, 15)}...` : 'connected',
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Database connection test error:', err);
    return NextResponse.json({
      connected: false,
      error: err.message,
    });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pool = getDatabasePool();
  if (!pool) {
    return NextResponse.json(
      { error: 'No PostgreSQL connection found in environment variables. Ensure Vercel Postgres / Supabase is attached.' },
      { status: 500 }
    );
  }

  const logs: string[] = [];

  try {
    const client = await pool.connect();
    try {
      logs.push('Connected to PostgreSQL database.');

      // 1. Extensions
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      logs.push('UUID extension verified.');

      // 2. Categories
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Categories table ready.');

      // 3. Products
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          club_or_national VARCHAR(150) NOT NULL,
          season VARCHAR(50) NOT NULL,
          jersey_type VARCHAR(50) NOT NULL DEFAULT 'Home',
          category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
          price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
          original_price DECIMAL(10, 2) CHECK (original_price >= price),
          description TEXT,
          is_featured BOOLEAN DEFAULT false,
          is_new_arrival BOOLEAN DEFAULT false,
          is_popular BOOLEAN DEFAULT false,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Products table ready.');

      // 4. Product Images
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.product_images (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Product Images table ready.');

      // 5. Product Sizes
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.product_sizes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
          size VARCHAR(10) NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', '2XL', '3XL')),
          stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE (product_id, size)
        );
      `);
      logs.push('Product Sizes table ready.');

      // 6. Orders
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_number VARCHAR(50) NOT NULL UNIQUE,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          customer_email VARCHAR(150),
          delivery_address TEXT NOT NULL,
          delivery_city VARCHAR(100) NOT NULL DEFAULT 'Accra',
          delivery_notes TEXT,
          total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
          payment_method VARCHAR(50) NOT NULL,
          order_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
          order_channel VARCHAR(50) NOT NULL DEFAULT 'web' CHECK (order_channel IN ('web', 'whatsapp', 'snapchat')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Orders table ready.');

      // 7. Order Items
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.order_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
          product_name VARCHAR(255) NOT NULL,
          size VARCHAR(10) NOT NULL,
          quantity INT NOT NULL CHECK (quantity > 0),
          unit_price DECIMAL(10, 2) NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Order Items table ready.');

      // 8. Payment Records
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.payment_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
          payment_method VARCHAR(50) NOT NULL,
          payment_reference VARCHAR(150) NOT NULL,
          proof_image_url TEXT,
          amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('pending', 'submitted', 'confirmed', 'rejected')),
          notes TEXT,
          verified_by VARCHAR(150),
          verified_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Payment Records table ready.');

      // 9. Store Settings
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.store_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          store_name VARCHAR(100) NOT NULL DEFAULT 'LOCKMAN JERSEYS',
          phone_display VARCHAR(50) NOT NULL DEFAULT '',
          email_contact VARCHAR(100) NOT NULL DEFAULT 'contact@lockmanjerseys.com',
          location_address VARCHAR(255) NOT NULL DEFAULT 'Accra, Ghana',
          whatsapp_number VARCHAR(50) NOT NULL DEFAULT '',
          whatsapp_message_template TEXT DEFAULT 'Hello LOCKMAN JERSEYS, I want to order the {product_name} ({size}) x {quantity}. Total: GH₵{total}.',
          snapchat_username VARCHAR(100) NOT NULL DEFAULT '',
          snapchat_instructions TEXT DEFAULT 'Add our official Snapchat profile to send your order code or screenshot for direct confirmation.',
          mtn_momo_number VARCHAR(50) NOT NULL DEFAULT '',
          mtn_momo_name VARCHAR(150) NOT NULL DEFAULT '',
          telecel_cash_number VARCHAR(50) NOT NULL DEFAULT '',
          telecel_cash_name VARCHAR(150) NOT NULL DEFAULT '',
          at_money_number VARCHAR(50) NOT NULL DEFAULT '',
          at_money_name VARCHAR(150) NOT NULL DEFAULT '',
          momo_instructions TEXT DEFAULT '1. Send total amount to the selected Mobile Money number.\n2. Enter the transaction reference below or upload screenshot proof.',
          delivery_fee_accra DECIMAL(10, 2) DEFAULT 30.00,
          delivery_fee_nationwide DECIMAL(10, 2) DEFAULT 60.00,
          free_delivery_threshold DECIMAL(10, 2) DEFAULT 1200.00,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
      logs.push('Store Settings table ready.');

      // 10. Enable RLS
      await client.query(`
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
      `);

      // Helper to safely create policies without duplicate errors
      const createPolicySafe = async (name: string, table: string, query: string) => {
        try {
          await client.query(`DROP POLICY IF EXISTS "${name}" ON public.${table};`);
          await client.query(`CREATE POLICY "${name}" ON public.${table} ${query};`);
        } catch (err: any) {
          console.warn(`Policy notice on ${table}:`, err.message);
        }
      };

      await createPolicySafe('Public categories are readable by everyone', 'categories', 'FOR SELECT USING (true)');
      await createPolicySafe('Public products are readable by everyone', 'products', 'FOR SELECT USING (is_available = true OR auth.role() = \'authenticated\')');
      await createPolicySafe('Public product images are readable by everyone', 'product_images', 'FOR SELECT USING (true)');
      await createPolicySafe('Public product sizes are readable by everyone', 'product_sizes', 'FOR SELECT USING (true)');
      await createPolicySafe('Public store settings are readable by everyone', 'store_settings', 'FOR SELECT USING (true)');
      await createPolicySafe('Anyone can create an order', 'orders', 'FOR INSERT WITH CHECK (true)');
      await createPolicySafe('Anyone can create order items', 'order_items', 'FOR INSERT WITH CHECK (true)');
      await createPolicySafe('Anyone can submit a payment record', 'payment_records', 'FOR INSERT WITH CHECK (true)');
      await createPolicySafe('Admins full access to categories', 'categories', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to products', 'products', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to product images', 'product_images', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to product sizes', 'product_sizes', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to orders', 'orders', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to order items', 'order_items', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to payment records', 'payment_records', 'FOR ALL USING (auth.role() = \'authenticated\')');
      await createPolicySafe('Admins full access to store settings', 'store_settings', 'FOR ALL USING (auth.role() = \'authenticated\')');
      logs.push('Row Level Security (RLS) policies configured.');

      // 11. Seed Categories if empty
      const catCheck = await client.query('SELECT count(*) FROM public.categories');
      const categoryMap = new Map<string, string>(); // slug -> id

      if (Number(catCheck.rows[0].count) === 0) {
        logs.push('Seeding initial categories...');
        for (const cat of INITIAL_CATEGORIES) {
          const res = await client.query(
            `INSERT INTO public.categories (name, slug, description, image_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
             RETURNING id, slug`,
            [cat.name, cat.slug, cat.description, cat.image_url]
          );
          if (res.rows[0]) {
            categoryMap.set(res.rows[0].slug, res.rows[0].id);
          }
        }
        logs.push(`Seeded ${INITIAL_CATEGORIES.length} categories.`);
      } else {
        const existingCats = await client.query('SELECT id, slug FROM public.categories');
        existingCats.rows.forEach(r => categoryMap.set(r.slug, r.id));
        logs.push(`Categories already populated (${catCheck.rows[0].count} found).`);
      }

      // 12. Seed Products if empty
      const prodCheck = await client.query('SELECT count(*) FROM public.products');
      if (Number(prodCheck.rows[0].count) === 0) {
        logs.push('Seeding initial jerseys and size inventory...');
        let seededProducts = 0;

        for (const p of INITIAL_PRODUCTS) {
          let catId: string | null = null;
          if (p.category_name) {
            const matchedCat = INITIAL_CATEGORIES.find(c => c.name === p.category_name || c.id === p.category_id);
            if (matchedCat && categoryMap.has(matchedCat.slug)) {
              catId = categoryMap.get(matchedCat.slug) || null;
            }
          }

          const prodRes = await client.query(
            `INSERT INTO public.products (
              name, slug, club_or_national, season, jersey_type, category_id, price, original_price, description, is_featured, is_new_arrival, is_popular, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (slug) DO NOTHING
            RETURNING id`,
            [
              p.name,
              p.slug,
              p.club_or_national,
              p.season,
              p.jersey_type,
              catId,
              p.price,
              p.original_price || null,
              p.description,
              p.is_featured,
              p.is_new_arrival,
              p.is_popular,
              p.is_available,
            ]
          );

          if (prodRes.rows[0]) {
            const newProdId = prodRes.rows[0].id;

            // Insert images
            for (let i = 0; i < p.images.length; i++) {
              await client.query(
                `INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
                 VALUES ($1, $2, $3, $4)`,
                [newProdId, p.images[i], i === 0, i]
              );
            }

            // Insert sizes
            for (const s of p.sizes) {
              await client.query(
                `INSERT INTO public.product_sizes (product_id, size, stock_quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (product_id, size) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity`,
                [newProdId, s.size, s.stock]
              );
            }
            seededProducts++;
          }
        }
        logs.push(`Successfully seeded ${seededProducts} matchwear items with per-size stocks.`);
      } else {
        logs.push(`Products already populated (${prodCheck.rows[0].count} jerseys found).`);
      }

      // 13. Seed Store Settings if empty
      const settingsCheck = await client.query('SELECT count(*) FROM public.store_settings');
      if (Number(settingsCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO public.store_settings (
            store_name, location_address, whatsapp_number, delivery_fee_accra, delivery_fee_nationwide
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          INITIAL_STORE_SETTINGS.store_name,
          INITIAL_STORE_SETTINGS.location_address,
          INITIAL_STORE_SETTINGS.whatsapp_number,
          INITIAL_STORE_SETTINGS.delivery_fee_accra,
          INITIAL_STORE_SETTINGS.delivery_fee_nationwide,
        ]);
        logs.push('Initial store settings inserted.');
      }

      // 14. Storage Buckets (Optional / Best Effort)
      try {
        await client.query(`
          INSERT INTO storage.buckets (id, name, public) 
          VALUES ('jerseys', 'jerseys', true), ('proofs', 'proofs', false)
          ON CONFLICT (id) DO NOTHING;
        `);
        logs.push('Supabase Storage buckets verified (jerseys, proofs).');
      } catch (bucketErr: any) {
        logs.push(`Storage notice: ${bucketErr.message}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Database initialization and seeding completed successfully!',
        logs,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Database migration error:', err);
    return NextResponse.json(
      { success: false, error: err.message, logs },
      { status: 500 }
    );
  }
}
