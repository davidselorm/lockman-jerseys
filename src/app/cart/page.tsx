'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  Camera, 
  Check, 
  ChevronRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { WhatsAppLogo, SnapchatLogo } from '@/components/ui/BrandLogos';
import { useCart } from '@/lib/store/cart-context';
import { formatCedis, buildWhatsAppUrl, buildSnapchatUrl, resolveAbsoluteImageUrl } from '@/lib/utils';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    subtotal, 
    deliveryCity, 
    setDeliveryCity, 
    deliveryFee, 
    total,
    storeSettings 
  } = useCart();

  const [copiedSnapchat, setCopiedSnapchat] = useState(false);

  const whatsappNumber = storeSettings?.whatsapp_number || '233257107980';
  const snapchatUsername = storeSettings?.snapchat_username || 'lockman_jerseys';
  const freeShippingThreshold = storeSettings?.free_delivery_threshold || 1200;
  const freeShippingDiff = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const activeNumber = whatsappNumber || '233257107980';

    let msg = `*NEW ORDER - LOCKMAN JERSEYS*\n\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}*\n`;
      msg += `   • Size: ${item.selectedSize}\n`;
      msg += `   • Qty: ${item.quantity}\n`;
      msg += `   • Price: GH₵ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      const absImg = resolveAbsoluteImageUrl(item.product.images?.[0]);
      if (absImg) {
        msg += `   • Kit Photo: ${absImg}\n`;
      }
      msg += `\n`;
    });
    msg += `*Subtotal:* GH₵ ${subtotal.toFixed(2)}\n`;
    msg += `*Delivery Location:* ${deliveryCity === 'Accra' ? 'Accra Metro' : 'Outside Accra (Nationwide)'} (${deliveryFee === 0 ? 'FREE' : `GH₵ ${deliveryFee.toFixed(2)}`})\n`;
    msg += `*Total Amount:* GH₵ ${total.toFixed(2)}\n\n`;
    msg += `Please confirm kit availability and courier dispatch schedule.`;

    window.open(buildWhatsAppUrl(activeNumber, msg), '_blank');
  };

  const handleSnapchatOrder = () => {
    if (items.length === 0) return;

    let text = `*LOCKMAN JERSEYS BAG ORDER*\n\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.product.name} [Size: ${item.selectedSize}, Qty: ${item.quantity}] - GH₵ ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    text += `\nDelivery: ${deliveryCity === 'Accra' ? 'Accra Metro' : 'Nationwide'}\n`;
    text += `Total: GH₵ ${total.toFixed(2)}\n\n`;
    text += `Please confirm my order!`;

    navigator.clipboard.writeText(text);
    setCopiedSnapchat(true);
    setTimeout(() => setCopiedSnapchat(false), 3000);

    if (snapchatUsername) {
      setTimeout(() => {
        window.open(buildSnapchatUrl(snapchatUsername), '_blank');
      }, 700);
    }
  };

  return (
    <div className="bg-black min-h-screen py-8 sm:py-12 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="inline-flex items-center gap-2 text-xs text-zinc-400 airbnb-pill px-3.5 py-1.5 rounded-full">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/shop" className="hover:text-white transition-colors">Jerseys</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-white font-bold">Shopping Bag</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Your Shopping Bag
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              {items.length === 0
                ? 'Your bag is currently empty.'
                : `You have ${items.length} jersey ${items.length === 1 ? 'edition' : 'editions'} selected.`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors self-start sm:self-auto font-bold underline"
            >
              Clear Entire Bag
            </button>
          )}
        </div>

        {/* Main Content */}
        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="p-12 sm:p-20 rounded-3xl airbnb-card text-center space-y-5 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-md">
              <ShoppingBag className="w-8 h-8 stroke-[2.5]" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-sans text-2xl font-extrabold text-white">
                Your Bag is Empty
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Explore our catalog of 2024/25 authentic club matchwear, national team kits, and retro grails.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95"
              >
                <span>Explore Jerseys</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Bag Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Free Shipping Progress Indicator */}
              <div className="airbnb-card p-4 sm:p-5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-white stroke-[2.5]" />
                    <span className="font-bold text-white">
                      {freeShippingDiff > 0 ? (
                        <>Add <strong className="text-emerald-400 font-extrabold">{formatCedis(freeShippingDiff)}</strong> more for FREE nationwide delivery</>
                      ) : (
                        <span className="text-emerald-400 font-extrabold inline-flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Free Nationwide Express Delivery Unlocked!</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-zinc-400 text-xs font-bold">{freeShippingPercent}%</span>
                </div>
                
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl airbnb-card flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-center justify-between transition-all"
                  >
                    {/* Image & Main Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#080808] border border-white/10 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                        />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                            {item.product.club_or_national}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium font-mono">
                            {item.product.season}
                          </span>
                        </div>

                        <Link href={`/product/${item.product.slug}`} className="block">
                          <h3 className="font-sans text-sm sm:text-base font-bold text-white hover:text-zinc-200 transition-colors line-clamp-1">
                            {item.product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-extrabold uppercase">
                            Size {item.selectedSize}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {formatCedis(item.product.price)} each
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stepper, Subtotal & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.08]">
                      
                      {/* Stepper */}
                      <div className="flex items-center gap-2 airbnb-pill rounded-full p-1 px-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        
                        <span className="text-xs font-extrabold text-white px-1.5 font-mono">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-sans text-sm sm:text-base font-extrabold text-white block">
                          {formatCedis(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id, item.selectedSize)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg active:scale-95"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              {/* Back to Shop Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors py-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Browsing Jerseys</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Checkout Summary (Sticky on Desktop) */}
            <div className="lg:col-span-5 space-y-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
              
              <div className="p-6 sm:p-7 rounded-3xl airbnb-card space-y-6">
                <h2 className="font-sans text-lg font-extrabold text-white border-b border-white/[0.08] pb-3">
                  Order Summary
                </h2>

                {/* Delivery City Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Delivery Region</span>
                    <span className="text-white font-bold">{deliveryCity === 'Accra' ? 'Accra Metro' : 'Outside Accra'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryCity('Accra')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                        deliveryCity === 'Accra'
                          ? 'bg-white text-black shadow-md'
                          : 'airbnb-pill text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Accra (GH₵ 30)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryCity('Nationwide')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                        deliveryCity === 'Nationwide'
                          ? 'bg-white text-black shadow-md'
                          : 'airbnb-pill text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Outside Accra (GH₵ 60)</span>
                    </button>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-white/[0.08] pt-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-white font-mono">{formatCedis(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery Dispatch:</span>
                    <span className="font-bold text-white font-mono">
                      {deliveryFee === 0 ? <span className="text-emerald-400 font-extrabold">FREE</span> : formatCedis(deliveryFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-base sm:text-lg font-extrabold text-white pt-3 border-t border-white/[0.08]">
                    <span>Total Amount:</span>
                    <span className="font-sans text-white">{formatCedis(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  
                  {/* Primary WhatsApp Checkout CTA */}
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full py-4 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <WhatsAppLogo className="w-4 h-4 text-[#25D366]" />
                    <span>Order Entire Bag on WhatsApp</span>
                  </button>

                  {/* Secondary Snapchat CTA */}
                  <button
                    type="button"
                    onClick={handleSnapchatOrder}
                    className="w-full py-3.5 px-5 rounded-full airbnb-pill hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    {copiedSnapchat ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5] text-white" />
                        <span>Bag Copied! Opening Snapchat...</span>
                      </>
                    ) : (
                      <>
                        <SnapchatLogo className="w-4 h-4 text-[#FFFC00]" />
                        <span>Order Bag via Snapchat</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Guarantees */}
                <div className="pt-2 border-t border-white/[0.08] space-y-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
                    <span>100% Authentic quality with badges & tags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
                    <span>Same-day doorstep delivery across Accra</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
