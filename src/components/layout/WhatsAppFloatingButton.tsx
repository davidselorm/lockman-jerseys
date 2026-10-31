'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl } from '@/lib/utils';

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const { storeSettings } = useCart();
  const phoneNumber = storeSettings?.whatsapp_number || '';

  const defaultMsg = 'Hello LOCKMAN JERSEYS! I would like to inquire about jersey availability and custom printing.';

  const handleOpenWhatsApp = () => {
    if (!phoneNumber) {
      window.location.href = '/contact';
      return;
    }
    window.open(buildWhatsAppUrl(phoneNumber, defaultMsg), '_blank');
  };

  // If on a product page, the mobile sticky bottom bar already has a direct WhatsApp button
  const isProductPage = pathname?.startsWith('/product/');

  return (
    <button
      onClick={handleOpenWhatsApp}
      aria-label="Chat with Lockman Jerseys on WhatsApp"
      className={`fixed ${
        isProductPage ? 'hidden md:flex' : 'flex'
      } bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 items-center gap-2.5 px-3.5 py-3 rounded-full apple-glass-dock hover:border-white/40 text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all group`}
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 text-emerald-400 fill-current" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </div>
      <span className="hidden sm:inline font-mono tracking-wider uppercase font-bold text-[11px] text-white">
        WhatsApp
      </span>
    </button>
  );
}
