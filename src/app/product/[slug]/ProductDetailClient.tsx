'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  MessageCircle, 
  Camera, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { Product, JerseySize } from '@/types';
import { formatCedis } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-context';
import { ProductCard } from '@/components/ui/ProductCard';
import { OrderWhatsAppModal } from '@/components/product/OrderWhatsAppModal';
import { OrderSnapchatModal } from '@/components/product/OrderSnapchatModal';
import { MoMoCheckoutModal } from '@/components/checkout/MoMoCheckoutModal';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<JerseySize>(() => {
    const available = product.sizes.find(s => s.stock > 0);
    return available ? available.size : product.sizes[0]?.size || 'M';
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Modals
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [snapchatModalOpen, setSnapchatModalOpen] = useState(false);
  const [momoModalOpen, setMomoModalOpen] = useState(false);

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
    <div className="bg-[#070707] min-h-screen py-6 sm:py-10 pb-28 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="inline-flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-400 apple-glass-pill px-3 sm:px-4 py-1.5 sm:py-2 rounded-full overflow-hidden max-w-full">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link href="/shop" className="hover:text-white transition-colors shrink-0">Jerseys</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-white font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          
          {/* Left Column: Image Gallery (Fluid Aspect Ratio) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="relative aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden apple-glass-card shadow-luxury p-4 sm:p-6 flex items-center justify-center bg-gradient-to-b from-[#181818] to-[#0E0E0E]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />

              {/* Status Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                {product.is_new_arrival && (
                  <span className="apple-glass-pill px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-[11px] sm:text-xs font-semibold">
                    New Season
                  </span>
                )}
                <span className="apple-glass-pill px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-zinc-300 text-[11px] sm:text-xs font-medium">
                  {product.jersey_type}
                </span>
              </div>
            </div>

            {/* Thumbnail Row (Horizontal Touch Strip) */}
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 transition-all p-1.5 sm:p-2 bg-[#141414] active:scale-95 ${
                        isActive
                          ? 'border border-white shadow-glass'
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
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 apple-glass p-5 sm:p-8 rounded-3xl shadow-luxury border border-white/[0.08]">
            
            {/* Heading & Team Info */}
            <div className="space-y-1.5 sm:space-y-2 border-b border-white/[0.08] pb-4 sm:pb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                  {product.club_or_national}
                </span>
                <span className="text-zinc-500 font-mono">{product.season}</span>
              </div>
              <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-white leading-tight">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-baseline gap-2 sm:gap-3 pt-1 sm:pt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  {formatCedis(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-sm sm:text-base text-zinc-500 line-through font-mono">
                    {formatCedis(product.original_price)}
                  </span>
                )}
                {product.original_price && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-semibold">
                    Save {formatCedis(product.original_price - product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector (Touch-friendly 3 cols on mobile, 6 cols on tablet/desktop) */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Select Size:</span>
                <span className="text-xs text-zinc-400">
                  {currentStock > 0 ? (
                    currentStock <= 5 ? `Only ${currentStock} left` : `${currentStock} in stock`
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
                          ? 'bg-white text-black font-bold shadow-glass'
                          : isOut
                          ? 'border border-white/5 text-zinc-700 bg-black/40 cursor-not-allowed line-through'
                          : 'apple-glass-pill text-zinc-300 hover:text-white'
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
              <span className="text-xs font-bold text-white block">
                Quantity
              </span>
              <div className="flex items-center w-36 apple-glass-pill rounded-xl px-3 py-1.5 sm:py-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 font-bold text-lg hover:text-white active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="text-white font-bold text-sm flex-1 text-center font-mono">
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

            {/* Order Actions (Desktop/Tablet & In-Page) */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              
              {/* WhatsApp Checkout */}
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(true)}
                className="w-full h-12 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-glass active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Order on WhatsApp (GH₵ {totalPrice.toFixed(2)})</span>
              </button>

              {/* MoMo Checkout */}
              <button
                type="button"
                onClick={() => setMomoModalOpen(true)}
                className="w-full h-12 px-5 rounded-xl apple-glass-pill hover:bg-white/10 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <CreditCard className="w-4 h-4 text-zinc-300" />
                <span>Pay with Mobile Money (MoMo)</span>
              </button>

              {/* Secondary Options */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSnapchatModalOpen(true)}
                  className="h-11 px-3 sm:px-4 rounded-xl apple-glass-pill hover:bg-white/10 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Camera className="w-4 h-4 text-yellow-300" />
                  <span>Snapchat</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`h-11 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    addedToCart
                      ? 'bg-zinc-200 text-black font-bold'
                      : isOutOfStock
                      ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                      : 'apple-glass-pill hover:bg-white/15 text-white'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-zinc-300" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Description */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
                About this Jersey
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {product.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 rounded-xl apple-glass-pill">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Material</span>
                  <span className="text-white font-medium">100% Breathable Poly</span>
                </div>
                <div className="p-3 rounded-xl apple-glass-pill">
                  <span className="text-[10px] text-zinc-500 block font-semibold">Fit</span>
                  <span className="text-white font-medium">
                    {product.jersey_type === 'Player Version' ? 'Slim Fit' : 'Regular Fit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Guarantee */}
            <div className="p-3.5 sm:p-4 rounded-xl apple-glass-pill space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Truck className="w-4 h-4 text-white shrink-0" />
                <span>Same day in Accra; 24h across Ghana.</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                <span>Original specification with official badges & tags.</span>
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          STICKY BOTTOM PURCHASE BAR (Mobile-Only, Floating Glass Dock)
          ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_-10px_25px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-400 block font-medium">Total ({selectedSize}):</span>
          <span className="text-base font-bold text-white font-mono">{formatCedis(totalPrice)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWhatsappModalOpen(true)}
            className="h-11 px-4 rounded-xl bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-glass active:scale-95 transition-transform"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Order</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`h-11 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform ${
              addedToCart
                ? 'bg-zinc-200 text-black font-bold'
                : 'apple-glass-pill text-white'
            }`}
          >
            {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4 text-zinc-300" />}
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

      {/* Direct MoMo Modal */}
      {momoModalOpen && (
        <MoMoCheckoutModal
          isOpen={momoModalOpen}
          onClose={() => setMomoModalOpen(false)}
          onSuccess={() => setMomoModalOpen(false)}
          directProduct={{
            product,
            size: selectedSize,
            quantity,
            totalAmount: totalPrice,
          }}
        />
      )}
    </div>
  );
}
