'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  ArrowUpRight,
  Camera
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl, buildSnapchatUrl } from '@/lib/utils';

export function Footer() {
  const { storeSettings } = useCart();

  const whatsappNumber = storeSettings?.whatsapp_number || '';
  const snapchatUsername = storeSettings?.snapchat_username || '';

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 text-zinc-400 text-xs pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/15 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                <img
                  src="/images/brand/logo.png"
                  alt="LOCKMAN JERSEYS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-heading text-base font-extrabold tracking-wider text-white block uppercase">
                  LOCKMAN <span className="text-zinc-400 font-semibold">JERSEYS</span>
                </span>
                <span className="text-[10px] tracking-wider text-zinc-400 uppercase block font-medium">
                  Football Store · Ghana
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              Your trusted store for authentic football kits, player version jerseys, and retro shirts in Ghana.
            </p>

            <div className="pt-1 flex items-center gap-3">
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I would like to order a jersey.')}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-glass-pill px-3 py-1.5 rounded-full text-white hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </a>
              )}

              {snapchatUsername && (
                <a
                  href={buildSnapchatUrl(snapchatUsername)}
                  target="_blank"
                  rel="noreferrer"
                  className="apple-glass-pill px-3 py-1.5 rounded-full text-white hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Camera className="w-3.5 h-3.5 text-yellow-300" />
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
                <Link href="/shop?cat=cat-1" className="text-zinc-400 hover:text-white transition-colors">
                  Club Kits
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=cat-2" className="text-zinc-400 hover:text-white transition-colors">
                  National Teams
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=cat-3" className="text-zinc-400 hover:text-white transition-colors">
                  Retro Jerseys
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=cat-4" className="text-zinc-400 hover:text-white transition-colors">
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
              <li>
                <Link href="/admin/login" className="text-zinc-400 hover:text-white transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading text-white text-xs font-bold uppercase tracking-wider">
              Mobile Money Payments
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              We accept instant payments via all major networks in Ghana:
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-white">
                MTN MoMo
              </span>
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-white">
                Telecel Cash
              </span>
              <span className="px-2.5 py-1 rounded-lg apple-glass-pill text-[11px] font-medium text-white">
                AT Money
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
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
