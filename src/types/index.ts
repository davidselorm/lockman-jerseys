export type JerseySize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export type JerseyType = 'Home' | 'Away' | 'Third' | 'Goalkeeper' | 'Retro' | 'Special Edition' | 'Player Version';

export type PaymentStatus = 'pending' | 'submitted' | 'confirmed' | 'rejected';

export type PaymentMethod = 'momo_mtn' | 'momo_telecel' | 'momo_at' | 'whatsapp' | 'snapchat' | 'cash_on_delivery';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  badge?: string;
  item_count?: number;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: JerseySize;
  stock_quantity: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  club_or_national: string;
  season: string;
  jersey_type: JerseyType;
  category_id: string;
  category_name?: string;
  price: number; // In GH₵
  original_price?: number; // In GH₵ for discount badge
  description: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_popular: boolean;
  is_available: boolean;
  images: string[];
  sizes: {
    size: JerseySize;
    stock: number;
  }[];
  total_stock: number;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: JerseySize;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  size: JerseySize;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_notes?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  order_status: OrderStatus;
  order_channel: 'web' | 'whatsapp' | 'snapchat';
  items: OrderItem[];
  payment?: PaymentRecord;
  created_at: string;
  updated_at?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_reference: string;
  proof_image_url?: string;
  amount: number;
  status: PaymentStatus;
  notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  phone_display: string;
  email_contact: string;
  location_address: string;
  
  // WhatsApp settings
  whatsapp_number: string; // E.g. "+233241234567"
  whatsapp_message_template: string;
  
  // Snapchat settings
  snapchat_username: string;
  snapchat_instructions: string;
  
  // Ghana Mobile Money settings
  mtn_momo_number: string;
  mtn_momo_name: string;
  telecel_cash_number: string;
  telecel_cash_name: string;
  at_money_number: string;
  at_money_name: string;
  momo_instructions: string;
  
  // Logistics
  delivery_fee_accra: number;
  delivery_fee_nationwide: number;
  free_delivery_threshold: number;
  
  updated_at?: string;
}
