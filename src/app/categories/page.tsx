import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories, getProducts } from '@/lib/store/data-service';

export const metadata = {
  title: 'Categories | LOCKMAN JERSEYS Ghana',
  description: 'Browse our jersey collections: Club Kits, National Teams, Retro Classics, and Player Versions.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <div className="bg-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Jersey Collections
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Find the exact kit you want. Choose from top European clubs, national teams, historic retro finals, or player-grade matchwear.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => {
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/shop?cat=${cat.id}`}
                className="group relative rounded-3xl overflow-hidden airbnb-card min-h-[200px] sm:min-h-[240px] flex flex-col justify-between p-8 border border-white/10 hover:border-white/30 transition-all bg-[#0A0A0A] hover:bg-[#111111]"
              >
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    {idx === 0 ? (
                      <span className="text-lg font-black">01</span>
                    ) : idx === 1 ? (
                      <span className="text-lg font-black">02</span>
                    ) : idx === 2 ? (
                      <span className="text-lg font-black">03</span>
                    ) : (
                      <span className="text-lg font-black">04</span>
                    )}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {count} Available
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white group-hover:text-zinc-200 transition-colors">
                    {cat.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                    {cat.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
