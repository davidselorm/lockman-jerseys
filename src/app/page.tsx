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
  Sparkles, 
  Camera, 
  Search, 
  CheckCircle2 
} from 'lucide-react';
import { getProducts, getCategories, getStoreSettings } from '@/lib/store/data-service';
import { ProductCard } from '@/components/ui/ProductCard';
import { AirbnbCategoryBar } from '@/components/ui/AirbnbCategoryBar';
import { buildWhatsAppUrl, formatCedis } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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
    <div className="space-y-10 sm:space-y-16 pb-20 sm:pb-28 overflow-hidden bg-black">
      
      {/* Signature Airbnb Category Bar */}
      <AirbnbCategoryBar activeId="all" />

      {/* 1. AIRBNB-INSPIRED HIGH-CONTRAST HERO SECTION */}
      <section className="relative pt-4 sm:pt-10 pb-8 sm:pb-16 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full airbnb-pill text-[11px] sm:text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span>Accra Showroom & Nationwide Express Dispatch</span>
              </div>

              <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                Authentic jerseys.<br />Zero hassle.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Club kits, national shirts, and retro classics. 1-Click concierge ordering directly on WhatsApp or Snapchat with same-day Accra delivery.
              </p>

              {/* Airbnb-style Interactive Search Pill Widget */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <form 
                  action="/shop" 
                  method="GET"
                  className="airbnb-search-bar rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xl"
                >
                  <div className="flex-1 px-4 py-2 text-left">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Team / Club</span>
                    <input
                      type="text"
                      name="q"
                      placeholder="e.g. Real Madrid, Ghana, Arsenal..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="hidden sm:block h-8 w-px bg-white/15" />

                  <div className="px-4 py-2 text-left hidden sm:block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Season</span>
                    <span className="block text-xs sm:text-sm font-semibold text-white">2024/25 Kits</span>
                  </div>

                  <button
                    type="submit"
                    aria-label="Search Jerseys"
                    className="h-11 sm:h-12 px-6 rounded-xl sm:rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shrink-0"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Search Kits</span>
                  </button>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Original tags & player issue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Doorstep delivery in Accra</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-200">Instant WhatsApp confirmation</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[320px] sm:max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden airbnb-card p-4 sm:p-6 bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
                  
                  {products.length > 0 && products[0]?.images?.[0] ? (
                    <>
                      <div className="aspect-square flex items-center justify-center overflow-hidden">
                        <img
                          src={products[0].images[0]}
                          alt={products[0].name}
                          className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                        />
                      </div>

                      <div className="mt-4 p-3.5 rounded-2xl airbnb-pill flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block truncate">
                            {products[0].club_or_national}
                          </span>
                          <h3 className="font-sans text-xs sm:text-sm font-extrabold text-white truncate">{products[0].name}</h3>
                          <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{formatCedis(products[0].price)} <span className="text-zinc-400 font-normal text-xs">/ jersey</span></span>
                        </div>
                        <Link
                          href={`/product/${products[0].slug}`}
                          className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-md flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <span>Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Official Matchwear</span>
                        <h3 className="text-base font-extrabold text-white">2024/25 Season Drops</h3>
                        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                          Player issues, club shirts & national kits. Prepared fresh for the upcoming drop.
                        </p>
                      </div>
                      <Link
                        href="/shop"
                        className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold hover:bg-zinc-200 transition-all shadow-md inline-block"
                      >
                        Explore Vault
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS (Airbnb High-Contrast Minimalism) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl airbnb-card flex flex-col items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white text-black shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-bold text-white">100% Authentic Matchwear</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">Player issues & official fan versions with badges and tags.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl airbnb-card flex flex-col items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white text-black shrink-0 shadow-sm">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">Same-day rider delivery in Accra; 24h delivery nationwide.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl airbnb-card flex flex-col items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white text-black shrink-0 shadow-sm">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-bold text-white">Snapchat Boutique</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">Order by code on Snap DM with instant video previews.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl airbnb-card flex flex-col items-start gap-3">
            <div className="p-2 sm:p-2.5 rounded-full bg-white text-black shrink-0 shadow-sm">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-sans text-xs sm:text-sm font-bold text-white">WhatsApp Concierge</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">1-Tap itemized checkout directly with our boutique desk.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED JERSEYS (Airbnb Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>Vault Picks</span>
            </div>
            <h2 className="font-sans text-xl sm:text-3xl font-extrabold text-white">
              Featured Matchwear
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-white hover:underline flex items-center gap-1 transition-all"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid, 4-Column Desktop Grid */}
        {featuredJerseys.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {featuredJerseys.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl airbnb-card text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-block p-3 rounded-full bg-white/10 text-white">
              <Sparkles className="w-6 h-6" />
            </span>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                New Season Drop Loading
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Official player issue and fan edition matchwear kits are being stocked in the vault. Contact us directly for custom requests.
              </p>
            </div>
            {whatsappNumber && (
              <a
                href={buildWhatsAppUrl(whatsappNumber, 'Hello LOCKMAN JERSEYS! I want to inquire about available kits.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-extrabold hover:bg-zinc-200 transition-colors shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5 text-black" />
                <span>Inquire on WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </section>

      {/* 4. CUSTOM PRINTING BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl airbnb-card p-6 sm:p-10 border border-white/15 bg-gradient-to-r from-[#0E0E0E] to-[#050505]">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            <span className="px-3 py-1 rounded-full bg-white text-black text-[11px] sm:text-xs font-extrabold uppercase tracking-wider">
              Custom Heat Press
            </span>

            <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Add Your Name & Number
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Official tournament badges, league font numbers, and customized player names. Precision heat-pressed to match regulation player standards.
            </p>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95"
              >
                <span>Ask About Printing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Latest Drops</span>
            </div>
            <h2 className="font-sans text-xl sm:text-3xl font-extrabold text-white">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold text-white hover:underline flex items-center gap-1 transition-all"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid, 4-Column Desktop Grid */}
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl airbnb-card text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-block p-3 rounded-full bg-white/10 text-white">
              <Flame className="w-6 h-6" />
            </span>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Fresh Drops Dropping Weekly
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                All kits are authenticated upon arrival in Accra. Tap below to follow our latest releases on Snapchat.
              </p>
            </div>
            {storeSettings?.snapchat_username && (
              <a
                href={`https://snapchat.com/add/${storeSettings.snapchat_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-extrabold hover:bg-zinc-200 transition-colors shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-black" />
                <span>Follow on Snapchat</span>
              </a>
            )}
          </div>
        )}
      </section>

      {/* 6. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="border-b border-white/[0.08] pb-3 sm:pb-4">
          <h2 className="font-sans text-xl sm:text-3xl font-extrabold text-white">
            Explore by League & Collection
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Handpicked collections for supporters and collectors.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop?cat=${cat.id}`}
              className="group relative rounded-3xl overflow-hidden airbnb-card min-h-[160px] sm:min-h-[190px] flex flex-col justify-between p-5 sm:p-6 active:border-white/40 transition-all bg-[#0A0A0A] hover:bg-[#111111]"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                  {idx === 0 ? <ShieldCheck className="w-5 h-5 stroke-[2.2]" /> : idx === 1 ? <Flame className="w-5 h-5 stroke-[2.2]" /> : idx === 2 ? <Sparkles className="w-5 h-5 stroke-[2.2]" /> : <Truck className="w-5 h-5 stroke-[2.2]" />}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  {cat.badge || 'Official'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-sans text-sm sm:text-base font-extrabold text-white group-hover:text-zinc-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="hidden sm:block text-xs text-zinc-400 line-clamp-2">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
