# LOCKMAN JERSEYS - Premium Football Sportswear E-Commerce

A modern, high-performance football jersey e-commerce platform built for **LOCKMAN JERSEYS** in Accra, Ghana.

## Brand Identity
- **Name:** LOCKMAN JERSEYS
- **Industry:** Football Jerseys and Sportswear
- **Location:** Osu Oxford Street, Accra, Ghana
- **Currency:** Ghana Cedis (GH₵)
- **Palette:**
  - Main Background: `#101713`
  - Secondary Background: `#1D2922`
  - Accent Volt: `#D5FF36`
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#A5ADA7`

---

## Key Features

### 1. Storefront & Customer Experience
- **Homepage:** Large hero section with 2024/25 season highlights, featured jerseys, new arrivals, popular clubs grid (Real Madrid, Arsenal, Barcelona, Ghana Black Stars, AC Milan, Nigeria), customer trust pillars, custom jersey printing banner, and footer.
- **Shop All (`/shop`):** Live full-text search, category filters, jersey specification filters (Home, Away, Third, Player Version, Retro), available size filters (S, M, L, XL, 2XL, 3XL), price sorting (Low to High, High to Low, Newest), and real-time inventory count.
- **Product Details (`/product/[slug]`):** High-definition image gallery, size selector with real-time stock hints ("Low stock: only X left", "In Stock", "Out of Stock"), fabric specs (100% recycled polyester, Dri-FIT / HEAT.RDY / dryCELL), and related jerseys.
- **Categories (`/categories`):** Curated collections for Club Jerseys, National Teams, Retro Classics, and Player Spec Editions.
- **About Us (`/about`):** The Lockman story, football culture in Ghana, and flagship boutique details.
- **Contact (`/contact`):** Physical showroom address in Osu Accra, direct phone, WhatsApp hotline, Snapchat handle, delivery rates breakdown, and contact form.

### 2. Multi-Channel Ordering System
- **Order on WhatsApp:** Prefilled message containing the item name, selected size, quantity, delivery location, and total in GH₵. Floating WhatsApp chat launcher across the entire site.
- **Order via Snapchat:** Directly directs to `@lockman_jerseys` with a 1-click copyable order summary for rapid DM ordering.
- **Ghana Mobile Money (MTN MoMo, Telecel Cash, AT Money):** Interactive payment instructions displaying network shortcodes (`*170#`, `*110#`), merchant account name, subscriber number, transaction ID reference submission, and screenshot upload.

### 3. Administrator Command Center (`/admin/dashboard`)
- **Protected Access:** Secure login at `/admin/login` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- **Overview & Statistics:** Total revenue, active products, available units in stockroom, pending MoMo verifications, and low-stock alerts (≤ 4 units).
- **Product Management:** Add new jersey, edit details, delete, manage images, set prices, and configure individual stock levels per size (S, M, L, XL, 2XL, 3XL).
- **Order Management:** View orders across channels (`web`, `whatsapp`, `snapchat`), update status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
- **Payment Verification:** Review customer submitted MoMo references and payment screenshots, with 1-click **Confirm Payment** or **Reject**, accompanied by verification notes.
- **Store Settings:** Edit WhatsApp business number, message templates, Snapchat username, MTN MoMo / Telecel Cash / AT Money numbers and account names, and Accra vs Nationwide delivery fees without touching code.
- **Supabase Integration:** Full SQL schema ready at `supabase/schema.sql` with Row Level Security (RLS) policies.

---

## Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Administrator Access
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Email:** `admin@lockmanjerseys.com`
- **Default Password:** `LockmanAdmin2025!`
*(Configurable via environment variables in `.env.local`)*

### 3. Supabase Setup (Optional)
The application works immediately out-of-the-box with its persistent internal data store. To connect live Supabase PostgreSQL:
1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL script found in `supabase/schema.sql` in the Supabase SQL Editor.
3. Add your Supabase keys to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Production Build
```bash
npm run build
npm start
```
