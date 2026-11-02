import { Category, Product, StoreSettings, Order } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Club Jerseys',
    slug: 'club-jerseys',
    description: 'Official match and fan kits from elite European and international football clubs.',
    image_url: '',
    badge: 'Popular',
    item_count: 0,
  },
  {
    id: 'cat-2',
    name: 'National Teams',
    slug: 'national-teams',
    description: 'Pride, heritage, and nationhood. Authentic kits for Ghana Black Stars and international champions.',
    image_url: '',
    badge: 'Official',
    item_count: 0,
  },
  {
    id: 'cat-3',
    name: 'Retro Classics',
    slug: 'retro-classics',
    description: 'Legendary throwback grails worn during historic tournament finals and iconic seasons.',
    image_url: '',
    badge: 'Grails',
    item_count: 0,
  },
  {
    id: 'cat-4',
    name: 'Player Version & Special',
    slug: 'player-version-special',
    description: 'Athletic cut, heat-applied metallic badges, advanced ventilation kits as worn by the pros.',
    image_url: '',
    badge: 'Pro Grade',
    item_count: 0,
  },
];

// Production Clean Slate: No dummy/mock kits in the live database.
// All kits are published directly via the Admin Console.
export const INITIAL_PRODUCTS: Product[] = [];

export const OFFICIAL_WHATSAPP_NUMBER = '233257107980';
export const OFFICIAL_PHONE_DISPLAY = '+233 25 710 7980';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  id: 'settings-default',
  store_name: 'LOCKMAN JERSEYS',
  phone_display: OFFICIAL_PHONE_DISPLAY,
  email_contact: 'contact@lockmanjerseys.com',
  location_address: 'Accra, Ghana',
  
  // WhatsApp settings (configurable in Admin Settings)
  whatsapp_number: OFFICIAL_WHATSAPP_NUMBER,
  whatsapp_message_template: 'Hello LOCKMAN JERSEYS! I want to order the following:\n\n*Product:* {product_name}\n*Size:* {size}\n*Quantity:* {quantity}\n*Price:* GH₵{total}\n*Delivery City:* {city}\n\nPlease confirm availability and dispatch schedule.',
  
  // Snapchat settings (configurable in Admin Settings)
  snapchat_username: 'yawloqman',
  snapchat_instructions: '1. Tap "Order via Snapchat" to copy your order summary.\n2. Open Snapchat and find our official business profile.\n3. Paste the order summary directly into our chat for immediate confirmation and express delivery.',
  
  // Ghana Mobile Money (legacy fields kept for interface compatibility)
  mtn_momo_number: '',
  mtn_momo_name: '',
  telecel_cash_number: '',
  telecel_cash_name: '',
  at_money_number: '',
  at_money_name: '',
  momo_instructions: '',
  
  delivery_fee_accra: 30,
  delivery_fee_nationwide: 60,
  free_delivery_threshold: 1200,
};

// Production Clean Slate: No dummy/mock orders in the live database.
export const INITIAL_ORDERS: Order[] = [];
