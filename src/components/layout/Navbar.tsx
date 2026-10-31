'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Shirt,
  Grid,
  Info,
  PhoneCall,
  MessageCircle,
  Home
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsOpen, storeSettings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
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
        <span className="hidden md:inline text-white font-medium">Mobile Money Accepted</span>
      </div>

      {/* Main Header (Compact 60px on mobile, 76px on desktop) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'apple-glass border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-[#070707]/95 backdrop-blur-xl border-b border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 md:h-20">
            
            {/* Left: Mobile Drawer Toggle & Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Elegant Mobile Hamburger Button (44px min touch target) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl apple-glass-pill text-white active:scale-95 transition-transform"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              {/* Brand Logo & Name */}
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.slice(1).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-all py-1 ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Admin, Cart) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Toggle (44px min touch target) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search jerseys"
                className="w-11 h-11 flex items-center justify-center rounded-xl apple-glass-pill text-zinc-300 hover:text-white active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Admin Portal Shortcut (Desktop only) */}
              <Link
                href="/admin/dashboard"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
                className={`apple-glass-pill px-3 py-2 rounded-xl transition-all hidden sm:flex items-center gap-1.5 text-xs font-medium ${
                  isAdmin
                    ? 'text-white bg-white/15 border-white/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
                <span>Admin</span>
              </Link>

              {/* Cart Button (44px min touch target) */}
              <button
                onClick={() => setIsOpen(true)}
                aria-label="Open Shopping Bag"
                className="h-11 px-3 sm:px-3.5 rounded-xl apple-glass-pill relative flex items-center gap-1.5 text-white hover:bg-white/15 active:scale-95 transition-all group"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center font-mono">
                    {totalItems}
                  </span>
                )}
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
      </header>

      {/* ========================================================
          POLISHED SLIDE-OUT MOBILE NAVIGATION DRAWER
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark Glass Backdrop with fade */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[82vw] max-w-sm bg-[#0E0E0E] border-r border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/15 overflow-hidden flex items-center justify-center p-0.5">
                    <img
                      src="/images/brand/logo.png"
                      alt="LOCKMAN JERSEYS"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-heading text-sm font-extrabold tracking-wider text-white uppercase block leading-none">
                      LOCKMAN <span className="text-zinc-400 font-semibold">JERSEYS</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest block mt-0.5">
                      Football Store · Ghana
                    </span>
                  </div>
                </div>

                {/* 44px Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation drawer"
                  className="w-10 h-10 rounded-xl apple-glass-pill flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="p-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-glass'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white active:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                        <span>{link.name}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Quick Categories Bar in Drawer */}
              <div className="px-4 pt-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
                  Popular Clubs
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/shop?q=Ghana"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 hover:text-white"
                  >
                    🇬🇭 Black Stars
                  </Link>
                  <Link
                    href="/shop?q=Real%20Madrid"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 hover:text-white"
                  >
                    ⚪ Real Madrid
                  </Link>
                  <Link
                    href="/shop?q=Arsenal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 hover:text-white"
                  >
                    🔴 Arsenal
                  </Link>
                  <Link
                    href="/shop?q=Barcelona"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 hover:text-white"
                  >
                    🔵 Barcelona
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions: Admin & WhatsApp */}
            <div className="p-4 border-t border-white/10 space-y-2.5 bg-black/40">
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I need assistance with an order.')}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl apple-glass-pill hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Chat with Concierge</span>
                </a>
              )}

              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  <span>Admin Dashboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
