'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppLogo } from '@/components/ui/BrandLogos';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl } from '@/lib/utils';

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const { storeSettings } = useCart();
  const phoneNumber = storeSettings?.whatsapp_number || '233257107980';

  const defaultMsg = 'Hello LOCKMAN JERSEYS! I would like to inquire about jersey availability and custom printing.';

  const handleOpenWhatsApp = () => {
    window.open(buildWhatsAppUrl(phoneNumber, defaultMsg), '_blank');
  };

  // If on a product page, the mobile sticky bottom bar already has a direct WhatsApp button
  const isProductPage = pathname?.startsWith('/product/');

  return (
    <button
      onClick={handleOpenWhatsApp}
      aria-label="Chat with Lockman Jerseys on WhatsApp"
      className={`fixed ${
        isProductPage ? 'hidden' : 'hidden md:flex'
      } bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-full bg-[#121212] border border-white/20 hover:border-white/50 text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all group`}
    >
      <div className="relative">
        <WhatsAppLogo className="w-5 h-5 text-[#25D366]" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </div>
      <span className="font-sans font-bold text-xs tracking-wide text-white">
        WhatsApp Concierge
      </span>
    </button>
  );
}
