-- =====================================================================
-- LOCKMAN JERSEYS - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS TABLE
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

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCT SIZES & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.product_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', '2XL', '3XL')),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (product_id, size)
);

-- 6. ORDERS TABLE
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

-- 7. ORDER ITEMS TABLE
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

-- 8. PAYMENT RECORDS TABLE (Ghana MoMo & Manual Verification)
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

-- 9. STORE SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name VARCHAR(100) NOT NULL DEFAULT 'LOCKMAN JERSEYS',
    phone_display VARCHAR(50) NOT NULL DEFAULT '',
    email_contact VARCHAR(100) NOT NULL DEFAULT 'contact@lockmanjerseys.com',
    location_address VARCHAR(255) NOT NULL DEFAULT 'Accra, Ghana',
    
    -- WhatsApp
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '',
    whatsapp_message_template TEXT DEFAULT 'Hello LOCKMAN JERSEYS, I want to order the {product_name} ({size}) x {quantity}. Total: GH₵{total}.',
    
    -- Snapchat
    snapchat_username VARCHAR(100) NOT NULL DEFAULT '',
    snapchat_instructions TEXT DEFAULT 'Add our official Snapchat profile to send your order code or screenshot for direct confirmation.',
    
    -- Ghana Mobile Money (MTN, Telecel, AT)
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

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public categories are readable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products are readable by everyone" ON public.products FOR SELECT USING (is_available = true OR auth.role() = 'authenticated');
CREATE POLICY "Public product images are readable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public product sizes are readable by everyone" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Public store settings are readable by everyone" ON public.store_settings FOR SELECT USING (true);

-- Public insert policies for customer ordering
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a payment record" ON public.payment_records FOR INSERT WITH CHECK (true);

-- Admin CRUD policies
CREATE POLICY "Admins full access to categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to product images" ON public.product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to product sizes" ON public.product_sizes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to payment records" ON public.payment_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access to store settings" ON public.store_settings FOR ALL USING (auth.role() = 'authenticated');

-- 11. STORAGE BUCKET FOR PRODUCT & PROOF IMAGES
-- (Run in Supabase Dashboard SQL Editor or Storage tab)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('jerseys', 'jerseys', true), ('proofs', 'proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Jerseys Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'jerseys');
CREATE POLICY "Authenticated users can upload jerseys" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'jerseys' AND auth.role() = 'authenticated');
CREATE POLICY "Public upload payment proof" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proofs');
CREATE POLICY "Admins view payment proof" ON storage.objects FOR SELECT USING (bucket_id = 'proofs' AND auth.role() = 'authenticated');
