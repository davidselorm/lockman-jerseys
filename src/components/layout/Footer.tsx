'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight
} from 'lucide-react';
import { WhatsAppLogo, SnapchatLogo } from '@/components/ui/BrandLogos';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl, buildSnapchatUrl } from '@/lib/utils';

export function Footer() {
  const { storeSettings } = useCart();

  const whatsappNumber = storeSettings?.whatsapp_number || '233257107980';
  const snapchatUsername = storeSettings?.snapchat_username || 'yawloqman';

  return (
    <footer className="bg-black border-t border-white/10 text-zinc-400 text-xs pt-12 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/15 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                <img
                  src="/images/brand/logo.png"
                  alt="LOCKMAN JERSEYS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-sans text-base font-extrabold tracking-wider text-white block uppercase">
                  LOCKMAN <span className="text-zinc-400 font-bold">JERSEYS</span>
                </span>
                <span className="text-[10px] tracking-wider text-zinc-400 uppercase block font-semibold">
                  Accra · Ghana
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              Your trusted store for authentic football matchwear, player version jerseys, and retro classics across Ghana.
            </p>

            <div className="pt-1 flex items-center gap-3">
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I would like to order a jersey.')}
                  target="_blank"
                  rel="noreferrer"
                  className="airbnb-pill px-3.5 py-1.5 rounded-full text-white hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <WhatsAppLogo className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Concierge</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </a>
              )}

              {snapchatUsername && (
                <a
                  href={buildSnapchatUrl(snapchatUsername)}
                  target="_blank"
                  rel="noreferrer"
                  className="airbnb-pill px-3.5 py-1.5 rounded-full text-white hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <SnapchatLogo className="w-3.5 h-3.5 text-[#FFFC00]" />
                  <span>Snapchat</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading text-white text-xs font-bold uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-zinc-400 hover:text-white transition-colors">
                  All Jerseys
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=club-jerseys" className="text-zinc-400 hover:text-white transition-colors">
                  Club Kits
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=national-teams" className="text-zinc-400 hover:text-white transition-colors">
                  National Teams
                </Link>
              </li>
              <li>
                <Link href="/shop?type=Retro" className="text-zinc-400 hover:text-white transition-colors">
                  Retro Jerseys
                </Link>
              </li>
              <li>
                <Link href="/shop?type=Player+Version" className="text-zinc-400 hover:text-white transition-colors">
                  Player Version
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading text-white text-xs font-bold uppercase tracking-wider">
              About & Help
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Name & Number Printing
                </Link>
              </li>
            </ul>
          </div>

          {/* Ordering Channels */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-white text-xs font-bold uppercase tracking-wider">
              Concierge Ordering
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Order directly via our official Ghanaian concierge channels:
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-emerald-400 flex items-center gap-1.5 border border-emerald-500/20">
                <WhatsAppLogo className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Hotline</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-yellow-400 flex items-center gap-1.5 border border-yellow-500/20">
                <SnapchatLogo className="w-3.5 h-3.5 text-[#FFFC00]" />
                <span>Snapchat Boutique</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-zinc-300">
                Accra Showroom Pickup
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} LOCKMAN JERSEYS. Accra, Ghana.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Delivery Info
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
