'use client';

import React, { useState } from 'react';
import { X, Camera, Copy, Check } from 'lucide-react';
import { Product, JerseySize } from '@/types';
import { generateSnapchatOrderSummary, buildSnapchatUrl } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-context';

interface OrderSnapchatModalProps {
  product: Product;
  selectedSize: JerseySize;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSnapchatModal({
  product,
  selectedSize,
  isOpen,
  onClose,
}: OrderSnapchatModalProps) {
  const { storeSettings } = useCart();
  const [size, setSize] = useState<JerseySize>(selectedSize);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('Accra');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const total = product.price * quantity;
  const username = storeSettings?.snapchat_username || '';

  const orderSummary = generateSnapchatOrderSummary({
    productName: product.name,
    size,
    quantity,
    totalPrice: total,
    city,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(orderSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenSnapchat = () => {
    handleCopy();
    if (username) {
      window.open(buildSnapchatUrl(username), '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg apple-glass rounded-3xl shadow-luxury overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl apple-glass-pill text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Order via Snapchat</h3>
              <p className="text-[11px] text-zinc-400">
                {username ? `Profile: @${username}` : 'Direct social concierge'}
              </p>
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
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl apple-glass-pill text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              2-Step Order Summary:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-xs leading-relaxed">
              <li>Tap <strong>Copy Order Summary</strong> below.</li>
              <li>Open Snapchat and paste the order summary directly into our chat for immediate confirmation.</li>
            </ol>
          </div>

          {/* Size & Quantity configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1.5 font-mono">
                Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as JerseySize)}
                className="w-full apple-glass-pill rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
              >
                {product.sizes.map((s) => (
                  <option key={s.size} value={s.size} disabled={s.stock === 0} className="bg-[#111111] text-white">
                    {s.size} {s.stock === 0 ? '(Out of Stock)' : `(${s.stock} left)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1.5 font-mono">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full apple-glass-pill rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Copyable Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-mono">
                Order Summary:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-white hover:underline flex items-center gap-1 uppercase tracking-wider"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl apple-glass-pill text-xs font-mono text-white whitespace-pre-line leading-relaxed border border-white/10">
              {orderSummary}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleOpenSnapchat}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glass"
          >
            <Camera className="w-4 h-4 text-black" />
            <span>Copy & Open Snapchat</span>
          </button>
        </div>

      </div>
    </div>
  );
}
