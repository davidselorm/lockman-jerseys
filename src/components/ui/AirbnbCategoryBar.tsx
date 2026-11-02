'use client';

import React, { Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Crown, 
  Flame, 
  Star, 
  Clock, 
  ShieldCheck, 
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  tag: string;
  href: string;
  icon: React.ElementType;
}

const AIRBNB_CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All Jerseys',
    tag: 'All Kits',
    href: '/shop',
    icon: Sparkles,
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    tag: 'England',
    href: '/shop?cat=premier-league',
    icon: Crown,
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    tag: 'Spain',
    href: '/shop?cat=la-liga',
    icon: Flame,
  },
  {
    id: 'national-teams',
    name: 'Black Stars & Africa',
    tag: 'Ghana',
    href: '/shop?cat=national-teams',
    icon: Star,
  },
  {
    id: 'retro',
    name: 'Retro Classics',
    tag: '90s & 00s',
    href: '/shop?type=Retro',
    icon: Clock,
  },
  {
    id: 'player-issue',
    name: 'Player Version',
    tag: 'Pro Match',
    href: '/shop?type=Player+Version',
    icon: ShieldCheck,
  },
  {
    id: 'champions-league',
    name: 'UCL Nights',
    tag: 'European',
    href: '/shop?cat=champions-league',
    icon: Trophy,
  },
];

interface AirbnbCategoryBarProps {
  activeId?: string;
  className?: string;
}

function CategoryBarContent({ activeId, className = '' }: AirbnbCategoryBarProps) {
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentCat =
    activeId ||
    searchParams?.get('cat') ||
    (searchParams?.get('type') === 'Retro'
      ? 'retro'
      : searchParams?.get('type') === 'Player Version'
      ? 'player-issue'
      : 'all');

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`w-full border-b border-white/[0.08] bg-black/95 backdrop-blur-2xl sticky top-[60px] sm:top-[64px] md:top-[80px] z-30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative flex items-center">
        
        {/* Left Arrow (Desktop Only) */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Scroll categories left"
          className="hidden md:flex absolute left-2 z-10 w-7 h-7 rounded-full bg-black/80 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Scrollable Categories Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2.5 sm:py-3 scroll-smooth w-full px-1"
        >
          {AIRBNB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCat === cat.id;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`group relative shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? 'bg-white text-black font-extrabold shadow-[0_4px_16px_rgba(255,255,255,0.2)]'
                    : 'bg-[#0A0A0A] border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 hover:bg-[#121212]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-black stroke-[2.5]' : 'text-zinc-400 group-hover:text-white'
                  }`}
                />

                <span className="text-xs tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white/10 text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  {cat.tag}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow (Desktop Only) */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Scroll categories right"
          className="hidden md:flex absolute right-2 z-10 w-7 h-7 rounded-full bg-black/80 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black transition-all shadow-md"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
}

export function AirbnbCategoryBar(props: AirbnbCategoryBarProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full border-b border-white/[0.08] bg-black/90 h-14 animate-pulse" />
      }
    >
      <CategoryBarContent {...props} />
    </Suspense>
  );
}
