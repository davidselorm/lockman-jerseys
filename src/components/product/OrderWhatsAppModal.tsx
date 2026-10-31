'use client';

import React, { useState } from 'react';
import { X, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { Product, JerseySize } from '@/types';
import { formatCedis, generateWhatsAppMessage, buildWhatsAppUrl } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-context';

interface OrderWhatsAppModalProps {
  product: Product;
  selectedSize: JerseySize;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderWhatsAppModal({
  product,
  selectedSize,
  isOpen,
  onClose,
}: OrderWhatsAppModalProps) {
  const { storeSettings } = useCart();
  const [size, setSize] = useState<JerseySize>(selectedSize);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('Accra');

  if (!isOpen) return null;

  const total = product.price * quantity;
  const phoneNumber = storeSettings?.whatsapp_number || '';

  const previewMessage = generateWhatsAppMessage({
    productName: product.name,
    size,
    quantity,
    totalPrice: total,
    city,
  });

  const handleSend = () => {
    if (!phoneNumber) {
      alert('The WhatsApp ordering hotline is being configured by the administrator in the Admin Dashboard. Please checkout using Mobile Money.');
      return;
    }
    const url = buildWhatsAppUrl(phoneNumber, previewMessage);
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg apple-glass rounded-3xl shadow-luxury overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl apple-glass-pill text-white">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-white font-bold text-sm">Order on WhatsApp</h3>
              <p className="text-xs text-zinc-400">Chat with us to place your order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl apple-glass-pill text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Product brief */}
          <div className="flex gap-3.5 p-3 rounded-2xl apple-glass-pill">
            <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-xs truncate uppercase tracking-tight">{product.name}</h4>
              <p className="text-[11px] text-zinc-400">{product.club_or_national} · {product.season}</p>
              <p className="text-xs font-bold text-white font-mono mt-1">
                {formatCedis(product.price)} each
              </p>
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="text-[11px] font-bold text-white uppercase tracking-wider block mb-2 font-mono">
              Select Jersey Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => {
                const isSelected = size === s.size;
                const isOut = s.stock === 0;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={isOut}
                    onClick={() => setSize(s.size)}
                    className={`min-w-10 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? 'bg-white text-black font-black shadow-glass'
                        : isOut
                        ? 'border border-white/5 text-zinc-700 bg-black/40 cursor-not-allowed'
                        : 'apple-glass-pill text-zinc-300 hover:text-white'
                    }`}
                  >
                    {s.size} {isOut ? '(Out)' : `(${s.stock})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1.5 font-mono">
                Quantity
              </label>
              <div className="flex items-center gap-3 apple-glass-pill rounded-xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-zinc-400 font-bold text-base px-1 hover:text-white"
                >
                  -
                </button>
                <span className="text-white font-bold text-sm flex-1 text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-zinc-400 font-bold text-base px-1 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1.5 font-mono">
                Destination
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full apple-glass-pill rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
              >
                <option value="Accra Metro" className="bg-[#111111] text-white">Accra Metro</option>
                <option value="Kumasi" className="bg-[#111111] text-white">Kumasi</option>
                <option value="Takoradi" className="bg-[#111111] text-white">Takoradi</option>
                <option value="Tema" className="bg-[#111111] text-white">Tema</option>
                <option value="Cape Coast" className="bg-[#111111] text-white">Cape Coast</option>
                <option value="Tamale" className="bg-[#111111] text-white">Tamale</option>
                <option value="Nationwide Region" className="bg-[#111111] text-white">Other Region in Ghana</option>
              </select>
            </div>
          </div>

          {/* Live Message Preview */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] block mb-1.5 font-mono">
              Live WhatsApp Prefilled Message Preview:
            </label>
            <div className="p-3.5 rounded-2xl apple-glass-pill text-xs font-mono text-zinc-200 whitespace-pre-line leading-relaxed border border-white/10">
              {previewMessage}
            </div>
          </div>

          {!phoneNumber && (
            <div className="p-3 rounded-2xl apple-glass-pill flex items-center gap-2 text-xs text-zinc-400">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span>WhatsApp hotline is currently being configured in the Admin Dashboard.</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSend}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glass"
          >
            <Send className="w-4 h-4 text-black" />
            <span>Open WhatsApp & Send Order (GH₵ {total.toFixed(2)})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
