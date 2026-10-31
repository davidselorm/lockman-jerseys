'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Crown, 
  Flame, 
  Star, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Trophy 
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  sub: string;
  href: string;
  icon: React.ElementType;
}

const AIRBNB_CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All Jerseys',
    sub: 'Full Vault',
    href: '/shop',
    icon: Sparkles,
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    sub: 'England',
    href: '/shop?cat=premier-league',
    icon: Crown,
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    sub: 'Spain',
    href: '/shop?cat=la-liga',
    icon: Flame,
  },
  {
    id: 'national-teams',
    name: 'Black Stars & Africa',
    sub: 'AFCON',
    href: '/shop?cat=national-teams',
    icon: Star,
  },
  {
    id: 'retro',
    name: 'Retro Classics',
    sub: '90s & 00s',
    href: '/shop?type=Retro',
    icon: Clock,
  },
  {
    id: 'player-issue',
    name: 'Player Version',
    sub: 'Pro Fit',
    href: '/shop?type=Player+Version',
    icon: ShieldCheck,
  },
  {
    id: 'champions-league',
    name: 'UCL Nights',
    sub: 'European',
    href: '/shop?cat=champions-league',
    icon: Trophy,
  },
  {
    id: 'world-national',
    name: 'World Teams',
    sub: 'Global',
    href: '/shop?cat=national-teams',
    icon: Globe,
  },
];

interface AirbnbCategoryBarProps {
  activeId?: string;
  className?: string;
}

function CategoryBarContent({ activeId, className = '' }: AirbnbCategoryBarProps) {
  const searchParams = useSearchParams();
  const currentCat = activeId || searchParams?.get('cat') || (searchParams?.get('type') === 'Retro' ? 'retro' : searchParams?.get('type') === 'Player Version' ? 'player-issue' : 'all');

  return (
    <div className={`w-full border-b border-white/[0.08] bg-black/60 backdrop-blur-md sticky top-[60px] sm:top-[76px] z-30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-3">
          {AIRBNB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCat === cat.id;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`group flex flex-col items-center gap-1.5 shrink-0 pb-1.5 border-b-2 transition-all select-none ${
                  isActive
                    ? 'border-white text-white opacity-100'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 opacity-75 hover:opacity-100'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className={`block text-xs tracking-tight ${
                    isActive ? 'font-bold text-white' : 'font-medium'
                  }`}>
                    {cat.name}
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-normal">
                    {cat.sub}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AirbnbCategoryBar(props: AirbnbCategoryBarProps) {
  return (
    <Suspense fallback={
      <div className="w-full border-b border-white/[0.08] bg-black/60 h-16 animate-pulse" />
    }>
      <CategoryBarContent {...props} />
    </Suspense>
  );
}
