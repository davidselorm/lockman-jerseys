import { 
  Product, 
  Category, 
  StoreSettings, 
  Order, 
  PaymentRecord, 
  PaymentStatus, 
  OrderStatus, 
  JerseySize 
} from '@/types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_ORDERS 
} from './seed-data';
import { createClient, createAdminClient, isSupabaseConfigured } from '@/lib/supabase/client';

const STORAGE_KEY_PRODUCTS = 'lockman_products_v4';
const STORAGE_KEY_CATEGORIES = 'lockman_categories_v4';
const STORAGE_KEY_SETTINGS = 'lockman_settings_v4';
const STORAGE_KEY_ORDERS = 'lockman_orders_v4';

// In-memory singletons for fallback or SSR initial state
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memorySettings: StoreSettings = { ...INITIAL_STORE_SETTINGS };
let memoryOrders: Order[] = [...INITIAL_ORDERS];

const isBrowser = typeof window !== 'undefined';

function getStored<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage key "${key}":`, err);
  }
}

// ==========================================
// STORE SETTINGS
// ==========================================

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          const mergedSettings: StoreSettings = {
            ...memorySettings,
            ...data,
          };
          if (isBrowser) setStored(STORAGE_KEY_SETTINGS, mergedSettings);
          return mergedSettings;
        }
      }
    } catch (e) {
      console.warn('Error reading store_settings from Supabase:', e);
    }
  }

  return getStored<StoreSettings>(STORAGE_KEY_SETTINGS, memorySettings);
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  memorySettings = updated;
  setStored(STORAGE_KEY_SETTINGS, updated);

  if (isBrowser) {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Failed to sync settings via API:', err);
    }
  }

  return updated;
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            image_url: c.image_url,
            badge: c.badge || undefined,
            item_count: c.item_count || 0,
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase categories fetch failed, using fallback:', e);
    }
  }

  return getStored<Category[]>(STORAGE_KEY_CATEGORIES, memoryCategories);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug || c.id === slug) || null;
}

// ==========================================
// PRODUCTS & INVENTORY
// ==========================================

export async function getProducts(filters?: {
  category?: string;
  jerseyType?: string;
  size?: string;
  query?: string;
  sortBy?: string;
  onlyAvailable?: boolean;
}): Promise<Product[]> {
  let products: Product[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from('products').select(`
          *,
          categories(name),
          product_images(image_url, is_primary, display_order),
          product_sizes(size, stock_quantity)
        `);

        if (filters?.onlyAvailable) {
          query = query.eq('is_available', true);
        }
        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category_id', filters.category);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          products = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            club_or_national: item.club_or_national,
            season: item.season,
            jersey_type: item.jersey_type,
            category_id: item.category_id,
            category_name: item.categories?.name,
            price: Number(item.price),
            original_price: item.original_price ? Number(item.original_price) : undefined,
            description: item.description || '',
            is_featured: item.is_featured,
            is_new_arrival: item.is_new_arrival,
            is_popular: item.is_popular,
            is_available: item.is_available,
            images: item.product_images?.length 
              ? item.product_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url)
              : ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80'],
            sizes: item.product_sizes?.map((s: any) => ({
              size: s.size as JerseySize,
              stock: s.stock_quantity,
            })) || [],
            total_stock: item.product_sizes?.reduce((sum: number, s: any) => sum + s.stock_quantity, 0) || 0,
            created_at: item.created_at,
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase products fetch failed, using stored local database:', e);
    }
  }

  if (products.length === 0) {
    products = getStored<Product[]>(STORAGE_KEY_PRODUCTS, memoryProducts);
  }

  // Filter & Search
  if (filters?.query) {
    const q = filters.query.toLowerCase().trim();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.club_or_national.toLowerCase().includes(q) ||
        p.season.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== 'all') {
    products = products.filter(
      p => p.category_id === filters.category || p.slug.includes(filters.category!)
    );
  }

  if (filters?.jerseyType && filters.jerseyType !== 'all') {
    products = products.filter(p => p.jersey_type === filters.jerseyType);
  }

  if (filters?.size) {
    products = products.filter(p => 
      p.sizes.some(s => s.size === filters.size && s.stock > 0)
    );
  }

  if (filters?.onlyAvailable) {
    products = products.filter(p => p.is_available && p.total_stock > 0);
  }

  // Sort
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.slug === slug || p.id === slug) || null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'total_stock' | 'created_at'>): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const total_stock = productData.sizes.reduce((sum, s) => sum + s.stock, 0);
  let newProduct: Product = {
    ...productData,
    id,
    total_stock,
    created_at: new Date().toISOString(),
  };

  if (isBrowser) {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.product) {
          newProduct = json.product;
        }
      }
    } catch (err) {
      console.warn('API create product failed, fallback to local storage:', err);
    }
  }

  const currentProducts = getStored<Product[]>(STORAGE_KEY_PRODUCTS, memoryProducts);
  const updated = [newProduct, ...currentProducts];
  memoryProducts = updated;
  setStored(STORAGE_KEY_PRODUCTS, updated);

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const currentProducts = getStored<Product[]>(STORAGE_KEY_PRODUCTS, memoryProducts);
  const index = currentProducts.findIndex(p => p.id === id);
  if (index === -1) return null;

  const existing = currentProducts[index];
  const updatedSizes = updates.sizes || existing.sizes;
  const total_stock = updatedSizes.reduce((sum, s) => sum + s.stock, 0);

  const updatedProduct: Product = {
    ...existing,
    ...updates,
    sizes: updatedSizes,
    total_stock,
    updated_at: new Date().toISOString(),
  };

  currentProducts[index] = updatedProduct;
  memoryProducts = [...currentProducts];
  setStored(STORAGE_KEY_PRODUCTS, memoryProducts);

  if (isBrowser) {
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.warn('API update product failed:', err);
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const currentProducts = getStored<Product[]>(STORAGE_KEY_PRODUCTS, memoryProducts);
  const updated = currentProducts.filter(p => p.id !== id);
  memoryProducts = updated;
  setStored(STORAGE_KEY_PRODUCTS, updated);

  if (isBrowser) {
    try {
      await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API delete product failed:', err);
    }
  }

  return true;
}

// ==========================================
// ORDERS & MOBILE MONEY
// ==========================================

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient() || createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            payment_records (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const parsedOrders: Order[] = data.map((row: any) => ({
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

          if (isBrowser) setStored(STORAGE_KEY_ORDERS, parsedOrders);
          return parsedOrders;
        }
      }
    } catch (e) {
      console.warn('Supabase orders fetch failed, falling back to local storage:', e);
    }
  }

  return getStored<Order[]>(STORAGE_KEY_ORDERS, memoryOrders);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(o => o.id === orderId || o.order_number === orderId) || null;
}

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_notes?: string;
  payment_method: any;
  order_channel: 'web' | 'whatsapp' | 'snapchat';
  items: Array<{
    product_id: string;
    product_name: string;
    size: JerseySize;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url: string;
  }>;
  total_amount: number;
  initial_payment_reference?: string;
}): Promise<Order> {
  let createdOrder: Order | null = null;

  if (isBrowser) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.order) {
          createdOrder = json.order;
        }
      }
    } catch (err) {
      console.warn('API create order failed, falling back to local store:', err);
    }
  }

  if (!createdOrder) {
    const orderNumber = `LK-${Date.now().toString().slice(-6)}`;
    const orderId = `ord-${Date.now()}`;
    createdOrder = {
      id: orderId,
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      delivery_address: data.delivery_address,
      delivery_city: data.delivery_city,
      delivery_notes: data.delivery_notes,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      order_status: 'pending',
      order_channel: data.order_channel,
      items: data.items,
      created_at: new Date().toISOString(),
      payment: data.initial_payment_reference ? {
        id: `pay-${Date.now()}`,
        order_id: orderId,
        payment_method: data.payment_method,
        payment_reference: data.initial_payment_reference,
        amount: data.total_amount,
        status: 'submitted',
        created_at: new Date().toISOString(),
      } : undefined,
    };
  }

  // Decrement inventory in local store
  const allProducts = getStored<Product[]>(STORAGE_KEY_PRODUCTS, memoryProducts);
  data.items.forEach(item => {
    const p = allProducts.find(prod => prod.id === item.product_id);
    if (p) {
      const s = p.sizes.find(sz => sz.size === item.size);
      if (s) {
        s.stock = Math.max(0, s.stock - item.quantity);
      }
      p.total_stock = p.sizes.reduce((sum, sz) => sum + sz.stock, 0);
    }
  });
  memoryProducts = [...allProducts];
  setStored(STORAGE_KEY_PRODUCTS, memoryProducts);

  const currentOrders = getStored<Order[]>(STORAGE_KEY_ORDERS, memoryOrders);
  const updatedOrders = [createdOrder, ...currentOrders];
  memoryOrders = updatedOrders;
  setStored(STORAGE_KEY_ORDERS, updatedOrders);

  return createdOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const currentOrders = getStored<Order[]>(STORAGE_KEY_ORDERS, memoryOrders);
  const order = currentOrders.find(o => o.id === orderId);
  if (order) {
    order.order_status = status;
    order.updated_at = new Date().toISOString();
    memoryOrders = [...currentOrders];
    setStored(STORAGE_KEY_ORDERS, memoryOrders);
  }

  if (isBrowser) {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status }),
      });
    } catch (err) {
      console.warn('API update order status failed:', err);
    }
  }

  return true;
}

export async function submitPaymentProof(
  orderId: string,
  paymentReference: string,
  proofImageUrl?: string
): Promise<PaymentRecord | null> {
  let uploadedImageUrl = proofImageUrl;

  if (isBrowser && proofImageUrl && proofImageUrl.startsWith('data:')) {
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: proofImageUrl,
          bucket: 'proofs',
          filename: `payment-${orderId}`,
        }),
      });
      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        if (uploadJson.url) {
          uploadedImageUrl = uploadJson.url;
        }
      }
    } catch (uploadErr) {
      console.warn('Image upload endpoint error, preserving data URL:', uploadErr);
    }
  }

  let paymentRecord: PaymentRecord | null = null;

  if (isBrowser) {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_reference: paymentReference,
          proof_image_url: uploadedImageUrl,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.payment) {
          paymentRecord = json.payment;
        }
      }
    } catch (err) {
      console.warn('API submit payment failed, falling back to local store:', err);
    }
  }

  const currentOrders = getStored<Order[]>(STORAGE_KEY_ORDERS, memoryOrders);
  const order = currentOrders.find(o => o.id === orderId);
  if (order) {
    if (!paymentRecord) {
      paymentRecord = {
        id: `pay-${Date.now()}`,
        order_id: orderId,
        payment_method: order.payment_method,
        payment_reference: paymentReference,
        proof_image_url: uploadedImageUrl,
        amount: order.total_amount,
        status: 'submitted',
        created_at: new Date().toISOString(),
      };
    }
    order.payment = paymentRecord;
    memoryOrders = [...currentOrders];
    setStored(STORAGE_KEY_ORDERS, memoryOrders);
  }

  return paymentRecord;
}

export async function verifyPayment(
  orderId: string,
  status: PaymentStatus,
  notes?: string,
  verifiedBy?: string
): Promise<boolean> {
  const currentOrders = getStored<Order[]>(STORAGE_KEY_ORDERS, memoryOrders);
  const order = currentOrders.find(o => o.id === orderId);
  if (order && order.payment) {
    order.payment.status = status;
    order.payment.notes = notes;
    order.payment.verified_by = verifiedBy || 'Admin';
    order.payment.verified_at = new Date().toISOString();

    if (status === 'confirmed') {
      order.order_status = 'processing';
    } else if (status === 'rejected') {
      order.order_status = 'cancelled';
    }

    memoryOrders = [...currentOrders];
    setStored(STORAGE_KEY_ORDERS, memoryOrders);
  }

  if (isBrowser) {
    try {
      await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status,
          notes,
          verified_by: verifiedBy,
        }),
      });
    } catch (err) {
      console.warn('API verify payment failed:', err);
    }
  }

  return true;
}

// ==========================================
// DASHBOARD METRICS & ALERTS
// ==========================================

export async function getDashboardStats() {
  const products = await getProducts();
  const orders = await getOrders();

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.total_stock, 0);
  
  const lowStockAlerts = products
    .filter(p => p.sizes.some(s => s.stock <= 4))
    .map(p => ({
      product: p,
      criticalSizes: p.sizes.filter(s => s.stock <= 4),
    }));

  const totalRevenue = orders
    .filter(o => o.payment?.status === 'confirmed')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const pendingPayments = orders.filter(
    o => o.payment?.status === 'submitted' || o.payment?.status === 'pending'
  );

  return {
    totalProducts,
    totalStock,
    lowStockCount: lowStockAlerts.length,
    lowStockAlerts,
    totalRevenue,
    totalOrders: orders.length,
    pendingPaymentsCount: pendingPayments.length,
  };
}
