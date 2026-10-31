'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  Camera, 
  Check, 
  Truck,
  CreditCard 
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatCedis, buildWhatsAppUrl, buildSnapchatUrl } from '@/lib/utils';
import { MoMoCheckoutModal } from '@/components/checkout/MoMoCheckoutModal';

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
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

  const [momoModalOpen, setMomoModalOpen] = useState(false);
  const [copiedSnapchat, setCopiedSnapchat] = useState(false);

  if (!isOpen) return null;

  const freeShippingThreshold = storeSettings?.free_delivery_threshold || 1200;
  const freeShippingDiff = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const phone = storeSettings?.whatsapp_number || '';
    if (!phone) {
      alert('WhatsApp ordering number is currently being configured by the administrator. Please checkout via Mobile Money or check back shortly.');
      return;
    }
    let msg = `🔥 *ORDER INQUIRY - LOCKMAN JERSEYS*\n\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}*\n   Size: ${item.selectedSize} | Qty: ${item.quantity} | GH₵ ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    msg += `\n*Subtotal:* GH₵ ${subtotal.toFixed(2)}`;
    msg += `\n*Delivery Location:* ${deliveryCity} (GH₵ ${deliveryFee.toFixed(2)})`;
    msg += `\n*Total:* GH₵ ${total.toFixed(2)}`;
    msg += `\n\nPlease confirm availability and payment details.`;

    window.open(buildWhatsAppUrl(phone, msg), '_blank');
  };

  const handleSnapchatOrder = () => {
    if (items.length === 0) return;
    const username = storeSettings?.snapchat_username || '';
    let text = `⚡ LOCKMAN JERSEYS ORDER\n\n`;
    items.forEach((item) => {
      text += `• ${item.product.name} [Size: ${item.selectedSize}, Qty: ${item.quantity}]\n`;
    });
    text += `\nDelivery: ${deliveryCity}\nTotal: GH₵ ${total.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedSnapchat(true);
    setTimeout(() => setCopiedSnapchat(false), 3000);

    if (username) {
      setTimeout(() => {
        window.open(buildSnapchatUrl(username), '_blank');
      }, 700);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Apple Blur Backdrop */}
        <div 
          className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#0D0D0D]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between apple-glass">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl apple-glass-pill text-white">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-white font-bold text-sm">Your Cart</h3>
                  <p className="text-xs text-zinc-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl apple-glass-pill text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-white/[0.02] p-3.5 border-b border-white/[0.08] text-xs">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5 font-medium text-[11px]">
                <span className="flex items-center gap-1.5 text-white">
                  <Truck className="w-3.5 h-3.5 text-zinc-300" />
                  {freeShippingDiff > 0 ? (
                    <>Add <strong className="text-white font-mono">{formatCedis(freeShippingDiff)}</strong> for Free Delivery</>
                  ) : (
                    <span className="text-white font-bold">Free Nationwide Delivery Applied</span>
                  )}
                </span>
                <span className="font-mono text-zinc-400">{freeShippingPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                  style={{ width: `${freeShippingPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl apple-glass-pill flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="w-7 h-7 opacity-40" />
                  </div>
                  <div>
                    <h4 className="font-heading text-white font-bold text-sm">Your cart is empty</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                      Check out our latest club and national football jerseys.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-glass"
                  >
                    Browse Jerseys
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-3 rounded-2xl apple-glass-card flex gap-3.5 group"
                  >
                    <div className="w-20 h-22 rounded-xl bg-gradient-to-b from-[#1C1C1C] to-[#121212] relative overflow-hidden shrink-0 border border-white/10 p-1 flex items-center justify-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-white font-bold text-xs truncate uppercase tracking-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedSize)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full apple-glass-pill text-white text-[9px] font-bold font-mono">
                            Size: {item.selectedSize}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {item.product.club_or_national}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08]">
                        <span className="text-xs font-bold text-white font-mono">
                          {formatCedis(item.product.price * item.quantity)}
                        </span>

                        <div className="flex items-center gap-2 apple-glass-pill rounded-xl p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Order Actions */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 apple-glass space-y-4">
                
                {/* Delivery City Selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Delivery Location:</span>
                    <span className="text-white font-medium">{deliveryCity === 'Accra' ? 'Accra Metro' : 'Outside Accra (Nationwide)'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryCity('Accra')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        deliveryCity === 'Accra'
                          ? 'bg-white text-black font-bold shadow-glass'
                          : 'apple-glass-pill text-zinc-400 hover:text-white'
                      }`}
                    >
                      Accra (GH₵ 30)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryCity('Nationwide')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        deliveryCity === 'Nationwide'
                          ? 'bg-white text-black font-bold shadow-glass'
                          : 'apple-glass-pill text-zinc-400 hover:text-white'
                      }`}
                    >
                      Outside Accra (GH₵ 60)
                    </button>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-1 text-xs border-t border-white/[0.08] pt-3">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white">{formatCedis(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery Fee:</span>
                    <span className="font-mono text-white">
                      {deliveryFee === 0 ? <span className="text-white font-bold">FREE</span> : formatCedis(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/[0.08]">
                    <span>Total:</span>
                    <span className="font-mono text-white">{formatCedis(total)}</span>
                  </div>
                </div>

                {/* Primary Checkout: Ghana Mobile Money */}
                <button
                  onClick={() => setMomoModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glass"
                >
                  <CreditCard className="w-4 h-4 text-black" />
                  <span>Pay with Mobile Money (MoMo)</span>
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleWhatsAppOrder}
                    className="apple-glass-pill py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-zinc-300" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleSnapchatOrder}
                    className="apple-glass-pill py-2.5 px-3 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {copiedSnapchat ? <Check className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5 text-zinc-300" />}
                    <span>{copiedSnapchat ? 'Copied' : 'Snapchat'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MoMo Checkout Modal */}
      {momoModalOpen && (
        <MoMoCheckoutModal
          isOpen={momoModalOpen}
          onClose={() => setMomoModalOpen(false)}
          onSuccess={() => {
            clearCart();
            setMomoModalOpen(false);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
