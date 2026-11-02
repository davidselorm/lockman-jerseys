'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { WhatsAppLogo, SnapchatLogo } from '@/components/ui/BrandLogos';
import { Product, JerseySize } from '@/types';
import { formatCedis } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-context';
import { ProductCard } from '@/components/ui/ProductCard';
import { OrderWhatsAppModal } from '@/components/product/OrderWhatsAppModal';
import { OrderSnapchatModal } from '@/components/product/OrderSnapchatModal';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(product.images?.[0] || '/images/brand/logo.png');
  const [selectedSize, setSelectedSize] = useState<JerseySize>(() => {
    const available = product.sizes.find(s => s.stock > 0);
    return available ? available.size : product.sizes[0]?.size || 'M';
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Modals
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [snapchatModalOpen, setSnapchatModalOpen] = useState(false);

  const currentSizeObj = product.sizes.find(s => s.size === selectedSize);
  const currentStock = currentSizeObj?.stock || 0;
  const isOutOfStock = currentStock === 0 || !product.is_available;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="bg-black min-h-screen py-6 sm:py-10 pb-36 sm:pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="inline-flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-400 airbnb-pill px-3.5 py-1.5 rounded-full overflow-hidden max-w-full">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <Link href="/shop" className="hover:text-white transition-colors shrink-0">Jerseys</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-white font-bold truncate">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          
          {/* Left Column: Image Gallery (Fluid Aspect Ratio) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="relative aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden airbnb-card p-4 sm:p-6 flex items-center justify-center bg-[#080808]">
              <img
                src={activeImage || '/images/brand/logo.png'}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new_arrival && (
                  <span className="bg-white text-black font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                    New Season
                  </span>
                )}
                <span className="airbnb-pill px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider uppercase">
                  {product.jersey_type}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden shrink-0 transition-all p-2 bg-[#0C0C0C] active:scale-95 ${
                        isActive
                          ? 'border-2 border-white shadow-md'
                          : 'border border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Buying Options & Specifications */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 airbnb-card p-6 sm:p-8 rounded-3xl bg-[#0C0C0C]">
            
            {/* Heading & Team Info */}
            <div className="space-y-2 border-b border-white/[0.08] pb-4 sm:pb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-extrabold uppercase tracking-wider">
                  {product.club_or_national}
                </span>
                <span className="text-zinc-400 font-bold">{product.season}</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-2 sm:gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {formatCedis(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-sm text-zinc-400 line-through ml-1">
                    {formatCedis(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Select Size</span>
                <span className="text-xs text-zinc-400">
                  {currentStock > 0 ? (
                    currentStock <= 5 ? `Only ${currentStock} left in Accra` : `${currentStock} in stock`
                  ) : (
                    <span className="text-red-400 font-medium">Sold out</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const isOut = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={isOut}
                      onClick={() => setSelectedSize(s.size)}
                      className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? 'bg-white text-black shadow-md'
                          : isOut
                          ? 'border border-white/5 text-zinc-700 bg-black/40 cursor-not-allowed line-through'
                          : 'airbnb-pill text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span>{s.size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Quantity
              </span>
              <div className="flex items-center w-36 airbnb-pill rounded-full px-3 py-1 sm:py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 font-bold text-lg hover:text-white active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="text-white font-extrabold text-sm flex-1 text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 font-bold text-lg hover:text-white active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order Actions */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              
              {/* Primary Action: High-Contrast WhatsApp Checkout */}
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(true)}
                className="w-full h-12 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
              >
                <WhatsAppLogo className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp (GH₵ {totalPrice.toFixed(2)})</span>
              </button>

              {/* Secondary Options: Snapchat & Add to Bag */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSnapchatModalOpen(true)}
                  className="h-11 px-3 sm:px-4 rounded-full airbnb-pill hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <SnapchatLogo className="w-4 h-4 text-[#FFFC00]" />
                  <span>Snapchat DM</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`h-11 px-3 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    addedToCart
                      ? 'bg-zinc-200 text-black'
                      : isOutOfStock
                      ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                      : 'airbnb-pill hover:bg-white/10 text-white'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Description */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider text-white">
                About this Jersey
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 rounded-2xl airbnb-pill">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Material</span>
                  <span className="text-white font-semibold">100% Breathable Mesh</span>
                </div>
                <div className="p-3 rounded-2xl airbnb-pill">
                  <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Fit</span>
                  <span className="text-white font-semibold">
                    {product.jersey_type === 'Player Version' ? 'Athletic Slim Fit' : 'Standard Regular Fit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Guarantee */}
            <div className="p-4 rounded-2xl airbnb-pill space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Truck className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                <span>Doorstep delivery across Accra; 24h nationwide.</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
                <span>Authentic badge specification and verified stitching.</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Jerseys (Crisp 2-Column Mobile Grid) */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 sm:pt-10 border-t border-white/[0.08] space-y-4 sm:space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
                  You May Also Like
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Explore more authentic kits.</p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          STICKY BOTTOM PURCHASE BAR (Mobile-Only, Airbnb High-Contrast Dock)
          ======================================================== */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 ios-dock rounded-full px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="pl-1">
          <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">Total ({selectedSize})</span>
          <span className="text-sm font-extrabold text-white">{formatCedis(totalPrice)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWhatsappModalOpen(true)}
            className="h-10 px-4 rounded-full bg-white text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <WhatsAppLogo className="w-4 h-4 text-[#25D366]" />
            <span>Order</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`h-10 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform ${
              addedToCart
                ? 'bg-zinc-200 text-black'
                : 'airbnb-pill text-white'
            }`}
          >
            {addedToCart ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>{addedToCart ? 'Added' : '+ Bag'}</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsappModalOpen && (
        <OrderWhatsAppModal
          product={product}
          selectedSize={selectedSize}
          isOpen={whatsappModalOpen}
          onClose={() => setWhatsappModalOpen(false)}
        />
      )}

      {/* Snapchat Modal */}
      {snapchatModalOpen && (
        <OrderSnapchatModal
          product={product}
          selectedSize={selectedSize}
          isOpen={snapchatModalOpen}
          onClose={() => setSnapchatModalOpen(false)}
        />
      )}
    </div>
  );
}
