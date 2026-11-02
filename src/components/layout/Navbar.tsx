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
  Home,
  Menu,
  X
} from 'lucide-react';
import { WhatsAppLogo, SnapchatLogo } from '@/components/ui/BrandLogos';
import { useCart } from '@/lib/store/cart-context';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsOpen, storeSettings } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const whatsappNumber = storeSettings?.whatsapp_number || '233257107980';
  const snapchatHandle = storeSettings?.snapchat_username || 'yawloqman';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
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

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.slice(1, 5).map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Contact, Bag) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button / Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search jerseys"
                className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full airbnb-pill text-xs text-zinc-300 hover:text-white hover:border-white/40 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
                <span className="text-zinc-400 font-medium">Search kits...</span>
              </button>

              {/* Mobile / Tablet Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search jerseys"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full airbnb-pill text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                href="/contact"
                className="hidden xl:inline-flex text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                Contact
              </Link>

              {/* Cart Bag Link */}
              <Link
                href="/cart"
                aria-label="View Shopping Bag"
                className="h-10 px-3.5 rounded-full bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs shadow-md shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Bag</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-extrabold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  if (searchOpen) setSearchOpen(false);
                }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full airbnb-pill text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
              </button>
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl px-4 py-5 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Contact & Channels */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 block">
                Direct Channels
              </span>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20Lockman%20Jerseys,%20I'd%20like%20to%20inquire%20about%20kits`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <WhatsAppLogo className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Hotline</span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px]">+233 25 710 7980</span>
              </a>

              <a
                href={`https://snapchat.com/t/${snapchatHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-white text-xs font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <SnapchatLogo className="w-4 h-4 text-[#FFFC00]" />
                  <span>Snapchat Stories & DM</span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px]">@{snapchatHandle}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
