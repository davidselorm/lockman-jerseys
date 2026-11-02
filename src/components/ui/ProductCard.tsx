'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { WhatsAppLogo } from '@/components/ui/BrandLogos';
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
      <div className="group relative airbnb-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300">
        
        {/* Product Image Frame */}
        <Link 
          href={`/product/${product.slug}`}
          className="relative aspect-square bg-[#080808] overflow-hidden block p-4 sm:p-6 flex items-center justify-center border-b border-white/[0.06]"
        >
          <img
            src={product.images?.[0] || '/images/brand/logo.png'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
          />

          {/* Airbnb-style Badge */}
          {badgeText && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                badgeText === 'Sold Out'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-white text-black shadow-md'
              }`}>
                {badgeText}
              </span>
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Club and Season */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="font-semibold text-zinc-300 tracking-wide uppercase truncate max-w-[75%]">
                {product.club_or_national}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium shrink-0">{product.season}</span>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="font-sans text-sm sm:text-[15px] font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-extrabold text-white">
                {formatCedis(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatCedis(product.original_price)}
                </span>
              )}
            </div>

            {/* Quick Size Selector Pills */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                <span className="font-medium">Size</span>
                <span className="text-white font-bold">{selectedSize}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const isOut = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={isOut}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(s.size);
                      }}
                      className={`h-7 min-w-7 px-2 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isSelected
                          ? 'bg-white text-black shadow-sm'
                          : isOut
                          ? 'text-zinc-500 bg-white/[0.02] cursor-not-allowed line-through'
                          : 'border border-white/15 text-zinc-300 hover:border-white/40 bg-white/[0.04]'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons: Responsive for Mobile & Desktop */}
          <div className="pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                aria-label="Order on WhatsApp"
                title="Order on WhatsApp"
                className="airbnb-pill h-9 sm:h-10 px-2.5 sm:px-3 rounded-full text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-95 shrink-0"
              >
                <WhatsAppLogo className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock || isCurrentSizeOut}
                onClick={handleAddToCart}
                className={`flex-1 h-9 sm:h-10 px-2.5 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 min-w-0 ${
                  added
                    ? 'bg-zinc-200 text-black'
                    : isOutOfStock || isCurrentSizeOut
                    ? 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
                    : 'bg-white hover:bg-zinc-200 text-black shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="truncate">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="truncate hidden xs:inline sm:inline">Add to Bag</span>
                    <span className="truncate xs:hidden sm:hidden">+Bag</span>
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
