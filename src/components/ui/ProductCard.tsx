'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, MessageCircle, Check, ArrowRight } from 'lucide-react';
import { Product, JerseySize } from '@/types';
import { formatCedis } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-context';
import { OrderWhatsAppModal } from '@/components/product/OrderWhatsAppModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<JerseySize>(() => {
    const available = product.sizes.find(s => s.stock > 0);
    return available ? available.size : product.sizes[0]?.size || 'M';
  });
  const [added, setAdded] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  const isOutOfStock = product.total_stock === 0 || !product.is_available;
  const currentSizeObj = product.sizes.find(s => s.size === selectedSize);
  const isCurrentSizeOut = (currentSizeObj?.stock || 0) === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isCurrentSizeOut) return;

    addItem(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWhatsappModalOpen(true);
  };

  // Single clean badge priority
  const badgeText = isOutOfStock
    ? 'Sold Out'
    : product.jersey_type === 'Retro'
    ? 'Retro'
    : product.jersey_type === 'Player Version'
    ? 'Player Version'
    : product.is_new_arrival
    ? 'New'
    : null;

  return (
    <>
      <div className="group relative apple-glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/25 active:border-white/30">
        
        {/* Product Image Frame */}
        <Link 
          href={`/product/${product.slug}`}
          className="relative aspect-square bg-gradient-to-b from-[#181818] to-[#0E0E0E] overflow-hidden block p-3 sm:p-5 flex items-center justify-center"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
          />

          {/* Single Clean Badge */}
          {badgeText && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-wide ${
                badgeText === 'Sold Out'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'apple-glass-pill text-white'
              }`}>
                {badgeText}
              </span>
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3.5">
          <div>
            {/* Club and Season */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 mb-0.5">
              <span className="font-medium text-zinc-300 truncate max-w-[70%]">
                {product.club_or_national}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0">{product.season}</span>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xs sm:text-base font-bold text-white font-mono">
                {formatCedis(product.price)}
              </span>
              {product.original_price && (
                <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-mono">
                  {formatCedis(product.original_price)}
                </span>
              )}
            </div>

            {/* Desktop Size Selector (Hidden on mobile to prevent overcrowding) */}
            <div className="hidden sm:block mt-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                <span>Size:</span>
                <span className="text-white font-bold">{selectedSize}</span>
              </div>
              <div className="flex items-center gap-1">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const isOut = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={isOut}
                      onClick={() => setSelectedSize(s.size)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                          : isOut
                          ? 'text-zinc-600 bg-white/[0.02] cursor-not-allowed line-through'
                          : 'border border-white/10 text-zinc-300 hover:border-white/30 bg-white/[0.04]'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons: Responsive for Mobile (44px min touch target) & Desktop */}
          <div className="pt-2 sm:pt-3 border-t border-white/[0.08]">
            
            {/* Mobile View Product Bar (Comfortable 44px touch target) */}
            <div className="sm:hidden flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                aria-label={`Order ${product.name} on WhatsApp`}
                className="w-11 h-11 rounded-xl apple-glass-pill flex items-center justify-center text-emerald-400 shrink-0 active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="flex-1 h-11 px-3 rounded-xl bg-white text-black text-xs font-bold flex items-center justify-center gap-1 hover:bg-zinc-200 active:scale-95 transition-all shadow-glass"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="apple-glass-pill py-2.5 px-3 rounded-xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:bg-white/15"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock || isCurrentSizeOut}
                onClick={handleAddToCart}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-glass ${
                  added
                    ? 'bg-zinc-200 text-black'
                    : isOutOfStock || isCurrentSizeOut
                    ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                    : 'bg-white hover:bg-zinc-200 text-black'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            </div>

          </div>
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
    </>
  );
}
