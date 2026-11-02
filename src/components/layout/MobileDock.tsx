'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Shirt, 
  Search, 
  ShoppingBag, 
  MessageCircle 
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl } from '@/lib/utils';

export function MobileDock() {
  const pathname = usePathname();
  const { totalItems, setIsOpen, storeSettings } = useCart();
  const whatsappNumber = storeSettings?.whatsapp_number || '233257107980';

  // Don't show dock inside admin panel or on product detail page (which has its own dedicated sticky purchase bar)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/product/')) {
    return null;
  }

  const handleOpenWhatsApp = () => {
    const msg = 'Hello Lockman Jerseys! I would like to inquire about jersey availability.';
    window.open(buildWhatsAppUrl(whatsappNumber, msg), '_blank');
  };

  const navItems = [
    {
      label: 'Explore',
      href: '/',
      icon: Compass,
      isActive: pathname === '/',
      isButton: false,
    },
    {
      label: 'Jerseys',
      href: '/shop',
      icon: Shirt,
      isActive: pathname.startsWith('/shop'),
      isButton: false,
    },
    {
      label: 'Search',
      href: '/shop?focus=search',
      icon: Search,
      isActive: false,
      isButton: false,
    },
    {
      label: 'Bag',
      href: '/cart',
      icon: ShoppingBag,
      isActive: pathname === '/cart',
      isButton: false,
      badge: totalItems,
    },
    {
      label: 'Concierge',
      icon: MessageCircle,
      isActive: false,
      isButton: true,
      onClick: handleOpenWhatsApp,
      isConcierge: true,
    },
  ];

  return (
    <div className="fixed bottom-3 inset-x-3 max-w-sm mx-auto z-40 md:hidden">
      <nav 
        aria-label="Mobile Navigation Dock"
        className="ios-dock rounded-full px-2 py-1.5 flex items-center justify-around"
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="relative flex flex-col items-center justify-center py-1 px-2.5 transition-all duration-150 active:scale-90">
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    item.isActive 
                      ? 'text-white' 
                      : item.isConcierge
                      ? 'text-emerald-400'
                      : 'text-zinc-400 hover:text-white'
                  }`} 
                />

                {/* Badge for Cart Bag */}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-white text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}

                {/* Active Indicator Dot */}
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}

                {/* Concierge Online Status Pulse */}
                {item.isConcierge && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                item.isActive 
                  ? 'text-white font-bold' 
                  : item.isConcierge
                  ? 'text-emerald-400/90 font-semibold'
                  : 'text-zinc-400 font-medium'
              }`}>
                {item.label}
              </span>
            </div>
          );

          if (item.isButton) {
            return (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className="focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href!}
              className="focus:outline-none"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
