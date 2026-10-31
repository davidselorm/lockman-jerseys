'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Flame, 
  Shirt, 
  Grid, 
  Info, 
  PhoneCall, 
  Home
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsOpen, storeSettings } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const whatsappNumber = storeSettings?.whatsapp_number || '';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop Jerseys', href: '/shop', icon: Shirt },
    { name: 'Categories', href: '/categories', icon: Grid },
    { name: 'New Arrivals', href: '/shop?sort=newest', icon: Flame },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: PhoneCall },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {/* Compact Mobile-Friendly Announcement Bar */}
      <div className="bg-[#0A0A0A] border-b border-white/[0.08] text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 text-center text-zinc-300 flex items-center justify-center gap-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span className="truncate">Quality football jerseys • Delivery across Ghana</span>
        <span className="text-zinc-600 hidden md:inline">•</span>
        <span className="hidden md:inline text-white font-medium">Order via WhatsApp & Snapchat</span>
      </div>

      {/* Main Header (Compact 60px on mobile, 76px on desktop) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-2xl border-b border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-black/95 backdrop-blur-xl border-b border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 md:h-20">
            
            {/* Left: Brand Logo & Name */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] border border-white/15 overflow-hidden flex items-center justify-center group-hover:border-white/40 transition-all shrink-0">
                  <img
                    src="/images/brand/logo.png"
                    alt="LOCKMAN JERSEYS"
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div>
                  <span className="font-heading text-sm sm:text-lg md:text-xl font-extrabold tracking-wider text-white block uppercase leading-none">
                    LOCKMAN <span className="text-zinc-400 font-semibold">JERSEYS</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-wider text-zinc-400 uppercase block font-medium mt-0.5">
                    Ghana
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Airbnb-Style Iconic Search Pill (Desktop / Tablet) */}
            <div className="hidden lg:flex items-center">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="airbnb-search-bar rounded-full py-2 px-4 flex items-center gap-3 text-xs text-white hover:border-white/40 transition-all shadow-md group cursor-pointer"
              >
                <span className="font-semibold text-white px-1">Any Club</span>
                <span className="h-3 w-px bg-white/20" />
                <span className="font-semibold text-white px-1">2024/25 Season</span>
                <span className="h-3 w-px bg-white/20" />
                <span className="text-zinc-400 font-normal px-1">All Sizes</span>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 ml-1 group-hover:scale-105 transition-transform">
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links (Compact) */}
            <nav className="hidden md:flex lg:hidden items-center gap-6">
              {navLinks.slice(1, 4).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search Toggle, Admin, Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle for Tablet / Mobile */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search jerseys"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full airbnb-pill text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                href="/shop"
                className="hidden xl:inline-flex text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                All Kits
              </Link>

              {/* Admin Portal Shortcut */}
              <Link
                href="/admin/dashboard"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
                className={`airbnb-pill px-3 py-1.5 rounded-full transition-all hidden sm:flex items-center gap-1.5 text-xs font-semibold ${
                  isAdmin
                    ? 'text-black bg-white border-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>

              {/* Cart Bag Link */}
              <Link
                href="/cart"
                aria-label="View Shopping Bag"
                className="h-10 px-3.5 rounded-full bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Bag</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-extrabold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 apple-glass px-3 py-3 sm:px-6">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search clubs, teams, jerseys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-white/40"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-5 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-glass"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
