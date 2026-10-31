import React from 'react';
import { getProducts, getCategories } from '@/lib/store/data-service';
import { ShopClientView } from './ShopClientView';

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
    <div className="bg-[#070707] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            All Football Jerseys
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Browse our full catalogue of authentic club kits, national team jerseys, and retro shirts. Fast delivery anywhere in Ghana.
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
