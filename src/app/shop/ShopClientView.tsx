'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowUpDown, SlidersHorizontal, MessageCircle, Check } from 'lucide-react';
import { Product, Category, JerseySize } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl } from '@/lib/utils';

interface ShopClientViewProps {
  initialProducts: Product[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  initialType?: string;
  initialSize?: string;
  initialSort?: string;
}

export function ShopClientView({
  initialProducts,
  categories,
  initialQuery = '',
  initialCategory = 'all',
  initialType = 'all',
  initialSize = 'all',
  initialSort = 'featured',
}: ShopClientViewProps) {
  const { storeSettings } = useCart();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [sortBy, setSortBy] = useState(initialSort);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const jerseyTypes = ['all', 'Home', 'Away', 'Third', 'Player Version', 'Retro', 'Special Edition'];
  const sizes: JerseySize[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.club_or_national.toLowerCase().includes(q) ||
          p.season.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    if (selectedType !== 'all') {
      result = result.filter(p => p.jersey_type === selectedType);
    }

    if (selectedSize !== 'all') {
      result = result.filter(p =>
        p.sizes.some(s => s.size === selectedSize && s.stock > 0)
      );
    }

    if (onlyAvailable) {
      result = result.filter(p => p.is_available && p.total_stock > 0);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [initialProducts, searchQuery, selectedCategory, selectedType, selectedSize, onlyAvailable, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedSize('all');
    setOnlyAvailable(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedSize !== 'all' ||
    onlyAvailable ||
    sortBy !== 'featured';

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const whatsappNumber = storeSettings?.whatsapp_number || '';

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Search & Actions Bar */}
      <div className="flex gap-2 sm:gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search club, team, or jersey..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 backdrop-blur-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Button (44px touch target) */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden h-10 px-3 rounded-xl apple-glass-pill flex items-center gap-1.5 text-xs font-semibold text-white shrink-0 active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-300" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Desktop Sort Dropdown */}
        <div className="hidden md:flex items-center gap-2 apple-glass-pill rounded-xl px-3 py-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
          >
            <option value="featured" className="bg-[#111111] text-white">Featured First</option>
            <option value="price-asc" className="bg-[#111111] text-white">Price: Low to High</option>
            <option value="price-desc" className="bg-[#111111] text-white">Price: High to Low</option>
            <option value="newest" className="bg-[#111111] text-white">Newest First</option>
          </select>
        </div>

      </div>

      {/* Active Filter Chips Bar (Quick Clear) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-zinc-400 mr-1">Active:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px]">
              <span>{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')} className="hover:text-zinc-300"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px]">
              <span>{selectedType}</span>
              <button onClick={() => setSelectedType('all')} className="hover:text-zinc-300"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedSize !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px]">
              <span>Size: {selectedSize}</span>
              <button onClick={() => setSelectedSize('all')} className="hover:text-zinc-300"><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px]">
              <span>&ldquo;{searchQuery}&rdquo;</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-zinc-300"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[11px] text-zinc-400 hover:text-white underline ml-1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Desktop Inline Filter Panel */}
      <div className="hidden md:block space-y-4 p-5 rounded-2xl apple-glass">
        {/* Category Row */}
        <div>
          <span className="text-xs font-semibold text-zinc-400 block mb-2">Category</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black font-black shadow-glass'
                  : 'apple-glass-pill text-zinc-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-black shadow-glass'
                    : 'apple-glass-pill text-zinc-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Jersey Type & Size Filters */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.08]">
          <div>
            <span className="text-xs font-semibold text-zinc-400 block mb-2">Jersey Type</span>
            <div className="flex flex-wrap gap-1.5">
              {jerseyTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedType === t
                      ? 'bg-white text-black font-bold'
                      : 'apple-glass-pill text-zinc-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-zinc-400 block mb-2">Available Sizes</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSize === 'all'
                    ? 'bg-white text-black font-black'
                    : 'apple-glass-pill text-zinc-400 hover:text-white'
                }`}
              >
                Any
              </button>
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-8 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                    selectedSize === s
                      ? 'bg-white text-black font-black'
                      : 'apple-glass-pill text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE FILTER BOTTOM SHEET (Slide-Up Drawer)
          ======================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Bottom Sheet Panel */}
          <div className="relative w-full max-h-[85vh] bg-[#111111] border-t border-white/15 rounded-t-3xl shadow-2xl p-5 overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
            
            {/* Sheet Handle & Header */}
            <div>
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                  <h3 className="font-heading text-base font-bold text-white">Filter & Sort</h3>
                </div>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-zinc-400 hover:text-white underline"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-full apple-glass-pill flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sort Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Sort By</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'newest', label: 'Newest Drop' },
                  { id: 'price-asc', label: 'Price: Low → High' },
                  { id: 'price-desc', label: 'Price: High → Low' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      sortBy === s.id
                        ? 'bg-white text-black font-bold shadow-glass'
                        : 'apple-glass-pill text-zinc-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Category</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-white text-black font-bold shadow-glass'
                      : 'apple-glass-pill text-zinc-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-white text-black font-bold shadow-glass'
                        : 'apple-glass-pill text-zinc-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Jersey Type */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Jersey Type</span>
              <div className="flex flex-wrap gap-1.5">
                {jerseyTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      selectedType === t
                        ? 'bg-white text-black font-bold shadow-glass'
                        : 'apple-glass-pill text-zinc-300'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Sizes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Available Size</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSize('all')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSize === 'all'
                      ? 'bg-white text-black font-bold shadow-glass'
                      : 'apple-glass-pill text-zinc-300'
                  }`}
                >
                  Any
                </button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-white text-black font-bold shadow-glass'
                        : 'apple-glass-pill text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Apply Action (Comfortable 48px touch target) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full h-12 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider shadow-glass flex items-center justify-center gap-2"
              >
                <span>Show {filteredProducts.length} Jerseys</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Product Grid: Crisp 2-Column Grid on Mobile, 4-Column on Desktop */}
      {filteredProducts.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl apple-glass text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-white">No jerseys found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Looking for a specific club kit, player version, or retro edition? Chat with our team directly.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl apple-glass-pill text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
            {whatsappNumber && (
              <a
                href={buildWhatsAppUrl(whatsappNumber, `Hi Lockman Jerseys, I am looking for: ${searchQuery || 'a jersey'}`)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold flex items-center gap-1.5 shadow-glass"
              >
                <MessageCircle className="w-4 h-4 text-black" />
                <span>Ask on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
