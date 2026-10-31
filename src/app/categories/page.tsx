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
    <div className="bg-[#070707] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Jersey Categories
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Find the exact kit you want. Choose from top European clubs, national teams, historic retro finals, or player-grade kits.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/shop?cat=${cat.id}`}
                className="group relative rounded-3xl overflow-hidden apple-glass-card min-h-[320px] sm:min-h-[360px] flex flex-col justify-end p-8 shadow-luxury border border-white/[0.08] hover:border-white/20 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#181818] to-[#0A0A0A] p-6 flex items-center justify-center">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">
                      {count} Available Jerseys
                    </span>
                  </div>

                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white group-hover:text-zinc-200 transition-colors">
                    {cat.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
                    {cat.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-white">
                    <span>View Jerseys</span>
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
