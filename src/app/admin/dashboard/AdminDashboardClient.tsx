'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  Settings, 
  Database,
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Save,
  MessageCircle,
  Camera,
  RefreshCw,
  Server,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Product, Category, Order, StoreSettings, JerseySize, JerseyType } from '@/types';
import { formatCedis } from '@/lib/utils';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateOrderStatus, 
  verifyPayment, 
  updateStoreSettings 
} from '@/lib/store/data-service';

interface AdminDashboardClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialOrders: Order[];
  initialSettings: StoreSettings;
  initialStats?: any;
}

export function AdminDashboardClient({
  initialProducts,
  categories,
  initialOrders,
  initialSettings,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Active Tab defaults to 'products' (Inventory) - Overview & Alerts tab is completely removed
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'database'>('products');
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals & form state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Form inputs for Product Create/Edit
  const [formName, setFormName] = useState('');
  const [formClub, setFormClub] = useState('');
  const [formSeason, setFormSeason] = useState('2024/25');
  const [formType, setFormType] = useState<JerseyType>('Home');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formPrice, setFormPrice] = useState(450);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | undefined>(500);
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formSizes, setFormSizes] = useState<{ size: JerseySize; stock: number }[]>([
    { size: 'S', stock: 10 },
    { size: 'M', stock: 15 },
    { size: 'L', stock: 20 },
    { size: 'XL', stock: 10 },
    { size: '2XL', stock: 5 },
    { size: '3XL', stock: 2 },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);

  // Database Tab State
  const [dbStatus, setDbStatus] = useState<{
    connected?: boolean;
    tablesReady?: boolean;
    productCount?: number;
    orderCount?: number;
    database?: string;
    host?: string;
    error?: string;
    message?: string;
  } | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbMigrating, setDbMigrating] = useState(false);
  const [dbMigrationLogs, setDbMigrationLogs] = useState<string[]>([]);

  const fetchDatabaseStatus = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/admin/setup-db');
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        setDbStatus({ connected: false, error: `HTTP ${res.status}: ${text.slice(0, 80)}` });
        return;
      }
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({ connected: false, error: err.message });
    } finally {
      setDbLoading(false);
    }
  };

  const handleRunMigration = async () => {
    if (!confirm('This will execute the PostgreSQL schema, create all missing tables, and seed initial jerseys if empty. Continue?')) {
      return;
    }

    setDbMigrating(true);
    setDbMigrationLogs(['Initiating database migration...']);
    try {
      const res = await fetch('/api/admin/setup-db', { method: 'POST' });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        setDbMigrationLogs(prev => [...prev, `❌ Server response error (HTTP ${res.status}): ${text.slice(0, 100)}`]);
        return;
      }

      if (data.logs && Array.isArray(data.logs)) {
        setDbMigrationLogs(data.logs);
      }
      if (data.success) {
        setDbMigrationLogs(prev => [...prev, '✓ Database schema and seed completed successfully!']);
        await fetchDatabaseStatus();
        router.refresh();
      } else {
        setDbMigrationLogs(prev => [...prev, `❌ Error: ${data.error || 'Migration failed'}`]);
      }
    } catch (err: any) {
      setDbMigrationLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setDbMigrating(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'database' && !dbStatus && !dbLoading) {
      fetchDatabaseStatus();
    }
  }, [activeTab]);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'jerseys');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormImages(prev => prev ? `${prev.trim()}\n${data.url}` : data.url);
        }
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    localStorage.removeItem('lockman_admin_authed');
    router.push('/admin/login');
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormClub(product.club_or_national);
      setFormSeason(product.season);
      setFormType(product.jersey_type);
      setFormCategory(product.category_id);
      setFormPrice(product.price);
      setFormOriginalPrice(product.original_price);
      setFormDescription(product.description);
      setFormImages(product.images.join('\n'));
      setFormSizes([...product.sizes]);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormClub('');
      setFormSeason('2024/25');
      setFormType('Home');
      setFormCategory(categories[0]?.id || '');
      setFormPrice(450);
      setFormOriginalPrice(500);
      setFormDescription('');
      setFormImages('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80');
      setFormSizes([
        { size: 'S', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 20 },
        { size: 'XL', stock: 10 },
        { size: '2XL', stock: 5 },
        { size: '3XL', stock: 2 },
      ]);
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = formImages
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const catObj = categories.find(c => c.id === formCategory);

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, {
        name: formName,
        slug,
        club_or_national: formClub,
        season: formSeason,
        jersey_type: formType,
        category_id: formCategory,
        category_name: catObj?.name,
        price: Number(formPrice),
        original_price: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        description: formDescription,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80'],
        sizes: formSizes,
      });

      if (updated) {
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      }
    } else {
      const created = await createProduct({
        name: formName,
        slug,
        club_or_national: formClub,
        season: formSeason,
        jersey_type: formType,
        category_id: formCategory,
        category_name: catObj?.name,
        price: Number(formPrice),
        original_price: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        description: formDescription,
        is_featured: false,
        is_new_arrival: true,
        is_popular: false,
        is_available: true,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80'],
        sizes: formSizes,
      });

      setProducts(prev => [created, ...prev]);
    }

    setProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this jersey from the catalogue?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleStockChange = async (productId: string, size: JerseySize, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedSizes = product.sizes.map(s => (s.size === size ? { ...s, stock: Math.max(0, newStock) } : s));
    const updated = await updateProduct(productId, { sizes: updatedSizes });
    if (updated) {
      setProducts(prev => prev.map(p => (p.id === productId ? updated : p)));
    }
  };

  const handleOrderStatus = async (orderId: string, status: any) => {
    await updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, order_status: status } : o)));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateStoreSettings(settings);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.club_or_national.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.order_status === orderStatusFilter;
  });

  const totalStockCount = products.reduce((acc, p) => acc + p.total_stock, 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* Sleek Top Header (High-contrast Minimalist) */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Identity & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/15 overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img
                src="/images/brand/logo.png"
                alt="LOCKMAN JERSEYS"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase text-white tracking-wider">
                  LOCKMAN JERSEYS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Direct Management Console
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="airbnb-pill flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 text-xs font-bold text-zinc-400 hover:text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Modern High-Contrast Airbnb Tab Navigation Bar */}
      <nav className="border-b border-white/10 bg-black/60 backdrop-blur-md px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-3">
          {[
            { id: 'products', label: 'Inventory & Kits', count: products.length, icon: Package },
            { id: 'orders', label: 'Orders', count: orders.length, icon: ShoppingBag },
            { id: 'settings', label: 'Store Settings', count: null, icon: Settings },
            { id: 'database', label: 'Database & Cloud', count: null, icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: INVENTORY & KITS */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Top Bar: Search, Stats & Add Product */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                {/* Airbnb Rounded-Full Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by club, player, country or jersey name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0C0C0C] border border-white/15 rounded-full text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Stock Summary Badge */}
                <div className="px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 flex items-center justify-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span><strong>{products.length}</strong> styles · <strong>{totalStockCount}</strong> total units</span>
                </div>
              </div>

              {/* Add Kit Primary Button */}
              <button
                onClick={() => openProductModal()}
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Matchwear Kit</span>
              </button>

            </div>

            {/* Desktop Table View (Airbnb Minimalist Card) */}
            <div className="hidden md:block bg-[#0C0C0C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/80 border-b border-white/10 text-zinc-400 uppercase font-mono tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Jersey Style</th>
                      <th className="py-4 px-4">Club / Team</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4">Sizes & Live Stock (Tap to Edit)</th>
                      <th className="py-4 px-4 text-center">Total</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400 font-mono">
                          No jerseys match &ldquo;{productSearch}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                          
                          <td className="py-3.5 px-6 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div>
                              <span className="font-extrabold text-white block uppercase tracking-tight text-xs">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {p.jersey_type} · {p.season}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-zinc-300 font-medium">
                            {p.club_or_national}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-black text-white text-xs">
                            {formatCedis(p.price)}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {p.sizes.map((s) => (
                                <button
                                  key={s.size}
                                  onClick={() => {
                                    const newVal = prompt(`Update stock count for ${p.name} (Size ${s.size}):`, s.stock.toString());
                                    if (newVal !== null) {
                                      handleStockChange(p.id, s.size, parseInt(newVal) || 0);
                                    }
                                  }}
                                  title="Click to edit quantity"
                                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black border transition-all active:scale-95 ${
                                    s.stock === 0
                                      ? 'bg-red-950/40 text-red-300 border-red-500/40 hover:bg-red-900/60'
                                      : s.stock <= 4
                                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                                      : 'bg-black text-white border-white/15 hover:border-white'
                                  }`}
                                >
                                  {s.size}: {s.stock}
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-mono font-black ${
                                p.total_stock === 0
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : p.total_stock <= 5
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-white/10 text-white border border-white/20'
                              }`}
                            >
                              {p.total_stock}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 text-right space-x-2">
                            <button
                              onClick={() => openProductModal(p)}
                              className="p-2 rounded-full bg-white/5 hover:bg-white text-zinc-300 hover:text-black border border-white/15 transition-all"
                              title="Edit Jersey"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-full bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all"
                              title="Delete Jersey"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Responsive Inventory Cards (Touch-friendly 44px targets) */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="p-4 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-3">
                  
                  <div className="flex gap-3.5 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-xs text-white truncate uppercase tracking-tight">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {p.club_or_national} • {p.jersey_type}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-black text-xs text-white">
                          {formatCedis(p.price)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          p.total_stock === 0
                            ? 'bg-red-500/20 text-red-300'
                            : p.total_stock <= 5
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/10 text-white'
                        }`}>
                          {p.total_stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Size Stock Chips */}
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block mb-1">
                      Tap size to edit stock:
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {p.sizes.map((s) => (
                        <button
                          key={s.size}
                          onClick={() => {
                            const newVal = prompt(`Update stock for ${p.name} (${s.size}):`, s.stock.toString());
                            if (newVal !== null) {
                              handleStockChange(p.id, s.size, parseInt(newVal) || 0);
                            }
                          }}
                          className={`h-10 rounded-xl text-xs font-mono font-bold border flex flex-col items-center justify-center transition-all ${
                            s.stock === 0
                              ? 'bg-red-950/60 text-red-300 border-red-500/40'
                              : s.stock <= 4
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : 'bg-black text-white border-white/15'
                          }`}
                        >
                          <span className="text-[9px] text-zinc-400">{s.size}</span>
                          <span className="leading-tight font-black">{s.stock}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openProductModal(p)}
                      className="h-11 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Kit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="h-11 rounded-2xl bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDER MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Status Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase font-mono transition-all whitespace-nowrap active:scale-95 ${
                    orderStatusFilter === status
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#0C0C0C] text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  {status} ({orders.filter(o => status === 'all' || o.order_status === status).length})
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#0C0C0C] rounded-3xl border border-white/10 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-zinc-500 mx-auto" />
                  <p className="text-sm font-bold text-white">No orders found</p>
                  <p className="text-xs text-zinc-400">There are currently no orders in this status category.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, '');
                  const waChatLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${order.customer_name}, this is Lockman Jerseys regarding your order #${order.order_number} (${formatCedis(order.total_amount)}).`
                  )}`;

                  return (
                    <div key={order.id} className="p-6 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-5 hover:border-white/20 transition-all">
                      
                      {/* Order Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-black font-mono text-white">
                              {order.order_number}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/10 text-white border border-white/20">
                              via {order.order_channel}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 mt-1 block">
                            Placed on {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Status Select & Quick WhatsApp Contact */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={waChatLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-black flex items-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-black" />
                            <span>WhatsApp Customer</span>
                          </a>

                          <select
                            value={order.order_status}
                            onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1.5 rounded-full bg-black border border-white/20 text-xs font-mono font-bold text-white focus:outline-none focus:border-white transition-all"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Customer Contact</span>
                          <p className="text-white font-extrabold">{order.customer_name}</p>
                          <p className="text-zinc-400 font-mono flex items-center gap-1.5">
                            <PhoneCall className="w-3 h-3 text-zinc-400" />
                            <span>{order.customer_phone}</span>
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Delivery Address</span>
                          <p className="text-white font-medium">{order.delivery_address}</p>
                          <p className="text-zinc-400">{order.delivery_city} {order.delivery_notes ? `(${order.delivery_notes})` : ''}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-1">
                          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Order Value</span>
                          <p className="text-white font-mono font-black text-sm">{formatCedis(order.total_amount)}</p>
                          <p className="text-zinc-400 uppercase text-[10px] font-mono">
                            Method: {order.payment_method}
                          </p>
                        </div>
                      </div>

                      {/* Ordered Kits Chips */}
                      <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black border border-white/10 text-xs">
                            <span className="text-white font-bold">{item.product_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white text-black font-mono text-[10px] font-black">
                              Size {item.size} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STORE SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
            
            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-white text-black text-xs font-bold flex items-center gap-2 shadow-lg">
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Store configurations and hotline numbers updated successfully!</span>
              </div>
            )}

            {/* WhatsApp Ordering Configuration */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-white">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Customer WhatsApp Ordering Line
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                All 1-tap WhatsApp checkout buttons on the storefront forward orders directly to this number.
              </p>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono uppercase">
                  WhatsApp Business Number (Country code with no + or spaces, e.g. 233...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 233240000000"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            {/* Snapchat Handle Configuration */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-white">
                <Camera className="w-5 h-5 text-white" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Snapchat Ordering Username
                </h3>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono uppercase">
                  Snapchat Handle (Without the @ symbol)
                </label>
                <input
                  type="text"
                  placeholder="e.g. lockman_jerseys"
                  value={settings.snapchat_username}
                  onChange={(e) => setSettings({ ...settings, snapchat_username: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            {/* Logistics & Delivery Rates */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-white">
                <Truck className="w-5 h-5 text-white" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Logistics & Delivery Rates (GH₵)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Greater Accra Delivery Fee</label>
                  <input
                    type="number"
                    value={settings.delivery_fee_accra}
                    onChange={(e) => setSettings({ ...settings, delivery_fee_accra: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Nationwide Delivery Fee</label>
                  <input
                    type="number"
                    value={settings.delivery_fee_nationwide}
                    onChange={(e) => setSettings({ ...settings, delivery_fee_nationwide: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Free Delivery Threshold</label>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* General Location & Support */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Store Location & Public Inquiries
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">City / Showroom Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Accra, Ghana"
                    value={settings.location_address}
                    onChange={(e) => setSettings({ ...settings, location_address: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Customer Inquiry Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +233 24 000 0000"
                    value={settings.phone_display}
                    onChange={(e) => setSettings({ ...settings, phone_display: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Save Configurations</span>
            </button>

          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DATABASE & CLOUD SQL */}
        {/* ========================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-6 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-white">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Supabase PostgreSQL Status
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Production database connected via Vercel integration
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchDatabaseStatus}
                    disabled={dbLoading}
                    className="airbnb-pill px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleRunMigration}
                    disabled={dbMigrating}
                    className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs font-mono transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Server className={`w-3.5 h-3.5 ${dbMigrating ? 'animate-spin' : ''}`} />
                    <span>{dbMigrating ? 'Running Migration...' : 'Initialize / Migrate Schema'}</span>
                  </button>
                </div>
              </div>

              {/* Status details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black border border-white/10">
                  <span className="text-[11px] text-zinc-400 font-mono block">Connection</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.connected ? 'bg-white shadow-[0_0_8px_white]' : 'bg-amber-400'}`} />
                    <span className="text-xs font-mono font-bold text-white">
                      {dbLoading ? 'Checking...' : dbStatus?.connected ? 'Online (Connected)' : 'Pending Migration'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-white/10">
                  <span className="text-[11px] text-zinc-400 font-mono block">Database Schema</span>
                  <span className="mt-1 block text-xs font-mono font-bold text-white">
                    {dbLoading ? '...' : dbStatus?.tablesReady ? 'All 8 Tables Ready' : 'Ready for Initial Setup'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-white/10">
                  <span className="text-[11px] text-zinc-400 font-mono block">Catalogue Count</span>
                  <span className="mt-1 block text-xs font-mono font-bold text-white">
                    {dbLoading ? '...' : dbStatus?.productCount !== undefined ? `${dbStatus.productCount} items` : `${products.length} items`}
                  </span>
                </div>
              </div>

              {/* Migration logs panel */}
              {dbMigrationLogs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-zinc-400 block">Migration Output:</span>
                  <div className="p-4 rounded-2xl bg-black border border-white/15 font-mono text-xs text-zinc-300 space-y-1 max-h-48 overflow-y-auto">
                    {dbMigrationLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-white">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-black border border-white/10 text-xs text-zinc-400 space-y-2">
                <span className="font-extrabold text-white block">Architecture & Cloud Storage:</span>
                <p className="leading-relaxed">
                  PostgreSQL database tables and Supabase image buckets synchronize directly with the catalogue. Clicking <strong>Initialize / Migrate Schema</strong> runs the complete SQL schema, enables Row Level Security (RLS), sets up image storage buckets, and seeds your jersey catalogue with per-size stocks.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Product Create / Edit Modal (High Contrast Minimalist) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black">
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">
                {editingProduct ? 'Edit Matchwear Kit' : 'Add New Matchwear Kit'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto bg-[#0A0A0A]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Kit Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Arsenal 2024/25 Home Jersey"
                    className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Club or Federation *</label>
                  <input
                    type="text"
                    required
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    placeholder="e.g. Arsenal / Real Madrid / Ghana"
                    className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Season</label>
                  <input
                    type="text"
                    value={formSeason}
                    onChange={(e) => setFormSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Specification</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-all"
                  >
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                    <option value="Third">Third</option>
                    <option value="Player Version">Player Version</option>
                    <option value="Retro">Retro</option>
                    <option value="Special Edition">Special Edition</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Selling Price (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Original Price (Strike-through)</label>
                  <input
                    type="number"
                    value={formOriginalPrice || ''}
                    onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                  />
                </div>
              </div>

              {/* Size Stocks Stepper */}
              <div>
                <label className="text-[11px] text-white block mb-2 font-mono uppercase tracking-wider font-extrabold">
                  Inventory Stock Count by Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {formSizes.map((s, idx) => (
                    <div key={s.size} className="text-center p-2 rounded-xl bg-black border border-white/10">
                      <span className="text-xs font-mono font-black text-white block mb-1">{s.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => {
                          const next = [...formSizes];
                          next[idx].stock = Math.max(0, parseInt(e.target.value) || 0);
                          setFormSizes(next);
                        }}
                        className="w-full text-center py-1 bg-[#121212] border border-white/15 rounded-lg text-xs font-mono text-white font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-zinc-400 font-mono">Image URLs (One per line)</label>
                  <label className="text-[11px] text-white hover:text-zinc-300 cursor-pointer flex items-center gap-1 font-mono">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="hidden"
                      onChange={handleProductImageUpload}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={formImages}
                  onChange={(e) => setFormImages(e.target.value)}
                  placeholder="https://... or click Upload Image above"
                  className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono">Garment Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Authentic player or stadium jersey details..."
                  className="w-full px-4 py-2.5 bg-black border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-all"
                />
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-extrabold border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-md"
                >
                  {editingProduct ? 'Save Kit Changes' : 'Publish Jersey'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0A0A0A] border border-white/15 rounded-3xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-mono">
                Payment Screenshot: {selectedProofOrder.order_number}
              </h4>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2 border border-white/10">
              <img
                src={selectedProofOrder.payment?.proof_image_url}
                alt="Proof"
                className="max-h-[50vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="px-4 py-2 rounded-full bg-white text-black text-xs font-extrabold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
