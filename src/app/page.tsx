import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MessageCircle,
  ChevronRight,
  Flame,
  Sparkles
} from 'lucide-react';
import { getProducts, getCategories, getStoreSettings } from '@/lib/store/data-service';
import { ProductCard } from '@/components/ui/ProductCard';
import { buildWhatsAppUrl } from '@/lib/utils';

export default async function HomePage() {
  const [products, categories, storeSettings] = await Promise.all([
    getProducts(),
    getCategories(),
    getStoreSettings(),
  ]);

  const featuredJerseys = products.filter((p) => p.is_featured).slice(0, 4);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);

  const whatsappNumber = storeSettings?.whatsapp_number || '';

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 sm:pb-24 overflow-hidden bg-[#070707]">
      
      {/* 1. MOBILE-FIRST HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-16 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full apple-glass-pill text-[11px] sm:text-xs font-semibold text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>2024/25 Matchwear Kits In Stock</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Authentic Football Jerseys in Ghana.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Official club kits, national shirts, and retro classics. Instant checkout via Mobile Money or WhatsApp, with fast delivery anywhere in Ghana.
              </p>

              {/* Action Buttons (Full width on mobile, auto on desktop with min 44px height) */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/shop"
                  className="h-12 sm:h-12 px-7 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-glass active:scale-98"
                >
                  <span>Shop Jerseys</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {whatsappNumber ? (
                  <a
                    href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I would like to order a jersey.')}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 sm:h-12 px-7 rounded-xl apple-glass-pill hover:bg-white/10 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Order on WhatsApp</span>
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="h-12 sm:h-12 px-7 rounded-xl apple-glass-pill hover:bg-white/10 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Contact Us</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Right Hero Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[320px] sm:max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden apple-glass-card p-4 sm:p-6 bg-gradient-to-b from-[#181818] to-[#0D0D0D]">
                  
                  <div className="aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600,t_white_blk_50/global/783419/01/mod01/fnd/EEA/fmt/png/Ghana-2026-Home-Jersey-Men"
                      alt="Ghana Black Stars 2024/25 Home Jersey"
                      className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="mt-3 p-3.5 rounded-2xl apple-glass flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 font-medium block">
                        Ghana Black Stars 2024/25
                      </span>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-white">Official Home Kit</h3>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 block">GH₵ 450.00</span>
                    </div>
                    <Link
                      href="/product/ghana-black-stars-2024-25-home-jersey"
                      className="h-9 px-3.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-glass flex items-center gap-1 active:scale-95"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS (2x2 Grid on Mobile, 4 Cols on Desktop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          <div className="p-3.5 sm:p-5 rounded-2xl apple-glass flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl apple-glass-pill text-white shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-white">Top Quality</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">Player & fan versions with original tags.</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl apple-glass flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl apple-glass-pill text-white shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-white">Fast Delivery</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">Accra same day; 24h across Ghana.</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl apple-glass flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl apple-glass-pill text-white shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-200" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-white">Mobile Money</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">MTN MoMo, Telecel Cash & AT.</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl apple-glass flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5">
            <div className="p-2 sm:p-2.5 rounded-xl apple-glass-pill text-white shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-heading text-xs sm:text-sm font-bold text-white">Direct WhatsApp</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">Order easily with prefilled message.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED JERSEYS (Crisp 2-Column Grid on Mobile) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>Top Choices</span>
            </div>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white">
              Featured Jerseys
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid, 4-Column Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredJerseys.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. CUSTOM PRINTING BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl apple-glass p-5 sm:p-10 border border-white/[0.08]">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <span className="px-3 py-1 rounded-full apple-glass-pill text-[11px] sm:text-xs font-semibold text-zinc-300">
              Custom Printing
            </span>

            <h3 className="font-heading text-xl sm:text-3xl font-black text-white leading-tight">
              Add Your Name & Number
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Want your own name or favorite player on the back? We print official fonts, numbers, and tournament badges with precision heat press.
            </p>

            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors shadow-glass active:scale-95"
              >
                <span>Ask About Printing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS (Crisp 2-Column Grid on Mobile) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Just In</span>
            </div>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid, 4-Column Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. CATEGORIES (2-Column Mobile Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="border-b border-white/[0.08] pb-3 sm:pb-4">
          <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white">
            Jersey Categories
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Explore by category type.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?cat=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden apple-glass-card aspect-[4/5] flex flex-col justify-end p-4 sm:p-6 border border-white/[0.08] active:border-white/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#181818] to-[#0A0A0A] p-3 sm:p-4 flex items-center justify-center">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />

              <div className="relative z-10 space-y-1">
                <h3 className="font-heading text-sm sm:text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="hidden sm:block text-xs text-zinc-400 line-clamp-2">
                  {cat.description}
                </p>
                <div className="pt-0.5 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white">
                  <span>Browse</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
