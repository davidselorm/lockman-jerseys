import React from 'react';
import { getProducts, getCategories } from '@/lib/store/data-service';
import { ShopClientView } from './ShopClientView';
import { AirbnbCategoryBar } from '@/components/ui/AirbnbCategoryBar';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: 'All Football Jerseys | LOCKMAN JERSEYS Ghana',
  description: 'Shop football club jerseys, national team kits, player versions, and retro shirts in Ghana Cedis (GH₵).',
};

interface ShopPageProps {
  searchParams: {
    q?: string;
    cat?: string;
    type?: string;
    size?: string;
    sort?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const allProducts = await getProducts();
  const categories = await getCategories();

  return (
    <div className="bg-black min-h-screen">
      {/* Category Bar */}
      <AirbnbCategoryBar activeId={searchParams.cat} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-36 md:pb-16 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Official Football Matchwear
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Browse our full catalogue of authentic club kits, national team jerseys, and retro shirts. Order in 1 tap on WhatsApp or Snapchat.
          </p>
        </div>

        {/* Client View */}
        <ShopClientView 
          initialProducts={allProducts} 
          categories={categories}
          initialQuery={searchParams.q || ''}
          initialCategory={searchParams.cat || 'all'}
          initialType={searchParams.type || 'all'}
          initialSize={searchParams.size || 'all'}
          initialSort={searchParams.sort || 'featured'}
        />

      </div>
    </div>
  );
}
