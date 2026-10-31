'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  Database,
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  ExternalLink, 
  Search, 
  Check, 
  Save,
  MessageCircle,
  Camera
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
  initialStats: any;
}

export function AdminDashboardClient({
  initialProducts,
  categories,
  initialOrders,
  initialSettings,
  initialStats,
}: AdminDashboardClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payments' | 'settings' | 'database'>('overview');
  
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

  const handleVerifyPayment = async (orderId: string, status: 'confirmed' | 'rejected') => {
    const notes = prompt(`Enter reconciliation note for ${status.toUpperCase()} (optional):`, `Verified by Admin on ${new Date().toLocaleDateString()}`) || '';
    await verifyPayment(orderId, status, notes, 'Store Administrator');
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId && o.payment) {
          return {
            ...o,
            order_status: status === 'confirmed' ? 'processing' : 'cancelled',
            payment: {
              ...o.payment,
              status,
              notes,
              verified_at: new Date().toISOString(),
              verified_by: 'Store Administrator',
            },
          };
        }
        return o;
      })
    );
    setSelectedProofOrder(null);
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

  const lowStockProducts = products.filter(p => p.sizes.some(s => s.stock <= 4));

  return (
    <div className="min-h-screen bg-[#070707] text-[#F1F0E9]">
      
      {/* Top Header */}
      <header className="bg-[#070707] border-b border-[#262626] px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#121212] border border-[#262626] overflow-hidden flex items-center justify-center shrink-0 p-0.5">
            <img
              src="/images/brand/logo.png"
              alt="LOCKMAN JERSEYS"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-[#F1F0E9] tracking-widest block">
              LOCKMAN <span className="text-[#FFFFFF]">COMMAND CENTER</span>
            </span>
            <span className="text-[10px] text-[#A5ADA7] font-mono block">
              Store Operations & Inventory
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#262626] text-xs font-bold text-[#A5ADA7] hover:text-[#F1F0E9] transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-red-900/60 text-red-400 text-xs font-bold hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#070707] border-b border-[#262626] px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-2 py-2">
          {[
            { id: 'overview', label: 'Overview & Alerts', icon: LayoutDashboard },
            { id: 'products', label: `Inventory (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'payments', label: `MoMo Verifications (${orders.filter(o => o.payment?.status === 'submitted').length})`, icon: CreditCard },
            { id: 'settings', label: 'Store Settings', icon: Settings },
            { id: 'database', label: 'Database & SQL', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#070707]'
                    : 'text-[#A5ADA7] hover:text-[#F1F0E9] hover:bg-[#121212]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-1">
                <span className="text-[10px] font-bold text-[#A5ADA7] uppercase tracking-[0.2em] block font-mono">
                  Confirmed Revenue
                </span>
                <span className="text-2xl font-bold text-[#FFFFFF] font-mono">
                  {formatCedis(
                    orders
                      .filter(o => o.payment?.status === 'confirmed')
                      .reduce((sum, o) => sum + o.total_amount, 0)
                  )}
                </span>
                <span className="text-xs text-[#A5ADA7] block pt-1">
                  Reconciled MoMo orders
                </span>
              </div>

              <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-1">
                <span className="text-[10px] font-bold text-[#A5ADA7] uppercase tracking-[0.2em] block font-mono">
                  Active Catalogue
                </span>
                <span className="text-2xl font-bold text-[#F1F0E9] font-mono">
                  {products.length}
                </span>
                <span className="text-xs text-[#A5ADA7] block pt-1">
                  Total published jersey styles
                </span>
              </div>

              <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-1">
                <span className="text-[10px] font-bold text-[#A5ADA7] uppercase tracking-[0.2em] block font-mono">
                  Stock Units
                </span>
                <span className="text-2xl font-bold text-[#F1F0E9] font-mono">
                  {products.reduce((acc, p) => acc + p.total_stock, 0)}
                </span>
                <span className="text-xs text-[#A5ADA7] block pt-1">
                  Total physical units in stock
                </span>
              </div>

              <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-1">
                <span className="text-[10px] font-bold text-[#A5ADA7] uppercase tracking-[0.2em] block font-mono">
                  Awaiting Verification
                </span>
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  {orders.filter(o => o.payment?.status === 'submitted').length}
                </span>
                <span className="text-xs text-[#A5ADA7] block pt-1">
                  MoMo transactions to review
                </span>
              </div>
            </div>

            {/* Low-Stock Warning Banner */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                    Low Inventory Alerts ({lowStockProducts.length} Products)
                  </h3>
                </div>
                <span className="text-xs text-[#A5ADA7] font-mono">
                  Threshold: ≤ 4 units remaining
                </span>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-[#FFFFFF]">
                  All jersey specifications maintain healthy stock units.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="p-3.5 rounded-lg bg-[#070707] border border-[#262626] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#F1F0E9] truncate max-w-[180px] uppercase">{p.name}</h4>
                        <span className="text-[10px] font-mono text-[#FFFFFF]">Total: {p.total_stock}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.map(s => (
                          <span
                            key={s.size}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              s.stock === 0
                                ? 'bg-red-950/60 text-red-300 border border-red-800'
                                : s.stock <= 4
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                : 'bg-[#181818] text-[#A5ADA7]'
                            }`}
                          >
                            {s.size}: {s.stock}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                Recent Orders
              </h3>
              <div className="divide-y divide-[#262626]">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#F1F0E9]">{order.order_number}</span>
                      <span className="text-[#A5ADA7] ml-2">by {order.customer_name} ({order.customer_phone})</span>
                      <p className="text-[11px] text-[#A5ADA7] mt-0.5">{order.delivery_address}, {order.delivery_city}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-mono font-bold text-[#F1F0E9] block">{formatCedis(order.total_amount)}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        order.order_status === 'delivered' ? 'bg-[#181818] text-[#FFFFFF] border border-[#262626]' : 'bg-amber-950/60 text-amber-400'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INVENTORY & PRODUCTS CRUD */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5ADA7]" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <button
                onClick={() => openProductModal()}
                className="px-5 py-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#070707] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Matchwear Item</span>
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl bg-[#121212] border border-[#262626] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070707] border-b border-[#262626] text-[#A5ADA7] uppercase font-mono">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Club/Nation</th>
                      <th className="py-3 px-4">Price (GH₵)</th>
                      <th className="py-3 px-4">Stock Breakdown</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#181818]/40 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-contain bg-[#070707] border border-[#262626] p-0.5" />
                          <div>
                            <span className="font-bold text-[#F1F0E9] block uppercase tracking-tight">{p.name}</span>
                            <span className="text-[10px] text-[#A5ADA7]">{p.jersey_type} · {p.season}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#A5ADA7] font-medium">{p.club_or_national}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#F1F0E9]">{formatCedis(p.price)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {p.sizes.map((s) => (
                              <button
                                key={s.size}
                                onClick={() => {
                                  const newVal = prompt(`Update stock for ${p.name} (${s.size}):`, s.stock.toString());
                                  if (newVal !== null) {
                                    handleStockChange(p.id, s.size, parseInt(newVal) || 0);
                                  }
                                }}
                                title="Click to adjust stock"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  s.stock === 0 ? 'bg-red-950/60 text-red-300 border-red-800' : s.stock <= 4 ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-[#070707] text-[#F1F0E9] border-[#262626]'
                                }`}
                              >
                                {s.size}:{s.stock}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold ${p.total_stock <= 5 ? 'text-amber-400' : 'text-[#FFFFFF]'}`}>
                            {p.total_stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openProductModal(p)}
                            className="p-1.5 rounded-lg bg-[#181818] text-[#FFFFFF] hover:bg-[#262626] border border-[#262626]"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-900/50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Responsive Inventory Cards (No horizontal scroll) */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
                  <div className="flex gap-3 items-center">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-14 h-14 rounded-xl object-contain bg-[#070707] border border-[#262626] p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#F1F0E9] truncate uppercase">{p.name}</h4>
                      <p className="text-xs text-[#A5ADA7] truncate">{p.club_or_national} • {p.jersey_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-sm text-white">{formatCedis(p.price)}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.total_stock === 0
                            ? 'bg-red-950/60 text-red-300'
                            : p.total_stock <= 5
                            ? 'bg-amber-950/60 text-amber-300'
                            : 'bg-emerald-950/60 text-emerald-300'
                        }`}>
                          {p.total_stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Size quick stock chips */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-semibold block mb-1">
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
                          className={`h-9 rounded-lg text-xs font-mono font-bold border flex flex-col items-center justify-center ${
                            s.stock === 0
                              ? 'bg-red-950/60 text-red-300 border-red-800'
                              : s.stock <= 4
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-[#070707] text-[#F1F0E9] border-[#262626]'
                          }`}
                        >
                          <span className="text-[10px] opacity-70">{s.size}</span>
                          <span className="leading-none">{s.stock}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions (44px touch targets) */}
                  <div className="pt-2 border-t border-[#262626] grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openProductModal(p)}
                      className="h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Edit className="w-4 h-4 text-zinc-300" />
                      <span>Edit Kit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="h-11 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-900/50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDER MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono transition-all ${
                    orderStatusFilter === status
                      ? 'bg-[#FFFFFF] text-[#070707]'
                      : 'bg-[#121212] text-[#A5ADA7] hover:text-[#F1F0E9] border border-[#262626]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A5ADA7] bg-[#121212] rounded-xl border border-[#262626]">
                  No orders found under this filter.
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="p-5 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
                      <div>
                        <span className="text-sm font-bold font-mono text-[#FFFFFF] mr-3">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-[#A5ADA7]">
                          Channel: <strong className="text-[#F1F0E9] uppercase">{order.order_channel}</strong> · {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#A5ADA7]">Status:</span>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#070707] border border-[#262626] text-xs font-mono font-bold text-[#F1F0E9] focus:outline-none focus:border-[#FFFFFF]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Customer</span>
                        <p className="text-[#F1F0E9] font-bold">{order.customer_name}</p>
                        <p className="text-[#A5ADA7] font-mono">{order.customer_phone}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Delivery Location</span>
                        <p className="text-[#F1F0E9]">{order.delivery_address}</p>
                        <p className="text-[#A5ADA7]">{order.delivery_city} {order.delivery_notes ? `(${order.delivery_notes})` : ''}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Payment</span>
                        <p className="text-[#F1F0E9] font-bold font-mono">{formatCedis(order.total_amount)}</p>
                        <p className="text-[#A5ADA7] uppercase text-[11px] font-mono">
                          {order.payment_method} {order.payment ? `(${order.payment.status})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#262626] flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070707] border border-[#262626] text-xs">
                          <span className="text-[#F1F0E9] font-medium">{item.product_name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#181818] text-[#FFFFFF] font-mono text-[10px] font-bold">
                            {item.size} x {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MOMO VERIFICATION */}
        {/* ========================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] text-xs text-[#A5ADA7] leading-relaxed">
              <p>
                <strong>Reconciliation Standard:</strong> Confirm incoming Mobile Money SMS or merchant portal transactions before approving delivery dispatch.
              </p>
            </div>

            <div className="space-y-4">
              {orders
                .filter(o => o.payment)
                .map(order => {
                  const pay = order.payment!;
                  const isSubmitted = pay.status === 'submitted' || pay.status === 'pending';
                  return (
                    <div key={order.id} className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold font-mono text-[#F1F0E9]">
                            Order {order.order_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            pay.status === 'confirmed'
                              ? 'bg-[#181818] text-[#FFFFFF] border-[#262626]'
                              : pay.status === 'rejected'
                              ? 'bg-red-950/60 text-red-300 border-red-800'
                              : 'bg-amber-950/60 text-amber-400 border-amber-800'
                          }`}>
                            {pay.status}
                          </span>
                        </div>
                        <span className="text-base font-bold font-mono text-[#FFFFFF]">
                          {formatCedis(pay.amount)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Reference ID</span>
                          <span className="text-[#F1F0E9] font-mono font-bold text-xs bg-[#070707] px-2 py-1 rounded border border-[#262626] inline-block mt-1">
                            {pay.payment_reference}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Customer</span>
                          <p className="text-[#F1F0E9] font-bold">{order.customer_name}</p>
                          <p className="text-[#A5ADA7] font-mono">{order.customer_phone}</p>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A5ADA7] uppercase block font-bold font-mono">Provider & Time</span>
                          <p className="text-[#F1F0E9] uppercase font-mono">{pay.payment_method}</p>
                          <p className="text-[#A5ADA7]">{new Date(pay.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {pay.proof_image_url && (
                        <div className="p-3 rounded-lg bg-[#070707] border border-[#262626] flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <Camera className="w-4 h-4 text-[#FFFFFF]" />
                            <span className="text-[#F1F0E9]">Attached Transfer Screenshot</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedProofOrder(order)}
                            className="px-3 py-1 rounded bg-[#181818] text-[#FFFFFF] text-xs font-bold hover:bg-[#262626] border border-[#262626]"
                          >
                            View Screenshot
                          </button>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#262626]">
                        <span className="text-xs text-[#A5ADA7]">
                          {pay.verified_by ? `Reconciled by ${pay.verified_by} (${pay.notes || 'Approved'})` : 'Pending administrator check'}
                        </span>

                        {isSubmitted && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyPayment(order.id, 'confirmed')}
                              className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#070707] text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Confirm Payment</span>
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(order.id, 'rejected')}
                              className="px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STORE SETTINGS (Configurable Business Information) */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {saveSuccess && (
              <div className="p-4 rounded-lg bg-[#181818] border border-[#FFFFFF]/40 text-[#FFFFFF] text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Store configurations updated successfully.</span>
              </div>
            )}

            {/* General Location */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                Store Location & Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Showroom / City Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Accra, Ghana"
                    value={settings.location_address}
                    onChange={(e) => setSettings({ ...settings, location_address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Customer Inquiry Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +233 ..."
                    value={settings.phone_display}
                    onChange={(e) => setSettings({ ...settings, phone_display: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <div className="flex items-center gap-2 text-[#FFFFFF]">
                <MessageCircle className="w-4 h-4" />
                <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                  WhatsApp Ordering
                </h3>
              </div>

              <div>
                <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">
                  WhatsApp Business Number (Country code with no spaces or +, e.g. 233...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 233240000000"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>
            </div>

            {/* Snapchat */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <div className="flex items-center gap-2 text-[#FFFFFF]">
                <Camera className="w-4 h-4" />
                <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                  Snapchat Ordering
                </h3>
              </div>

              <div>
                <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">
                  Snapchat Username (Without @)
                </label>
                <input
                  type="text"
                  placeholder="e.g. lockman_jerseys"
                  value={settings.snapchat_username}
                  onChange={(e) => setSettings({ ...settings, snapchat_username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>
            </div>

            {/* Mobile Money Accounts */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <div className="flex items-center gap-2 text-[#FFFFFF]">
                <CreditCard className="w-4 h-4" />
                <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                  Ghana Mobile Money Merchant Accounts
                </h3>
              </div>

              {/* MTN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">MTN MoMo Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 024..."
                    value={settings.mtn_momo_number}
                    onChange={(e) => setSettings({ ...settings, mtn_momo_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">MTN Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lockman Jerseys"
                    value={settings.mtn_momo_name}
                    onChange={(e) => setSettings({ ...settings, mtn_momo_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>

              {/* Telecel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Telecel Cash Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 020..."
                    value={settings.telecel_cash_number}
                    onChange={(e) => setSettings({ ...settings, telecel_cash_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Telecel Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lockman Jerseys"
                    value={settings.telecel_cash_name}
                    onChange={(e) => setSettings({ ...settings, telecel_cash_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>

              {/* AT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">AT Money Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 026..."
                    value={settings.at_money_number}
                    onChange={(e) => setSettings({ ...settings, at_money_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">AT Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lockman Jerseys"
                    value={settings.at_money_name}
                    onChange={(e) => setSettings({ ...settings, at_money_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Fees */}
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                Logistics & Delivery Rates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Accra Delivery (GH₵)</label>
                  <input
                    type="number"
                    value={settings.delivery_fee_accra}
                    onChange={(e) => setSettings({ ...settings, delivery_fee_accra: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Nationwide Delivery (GH₵)</label>
                  <input
                    type="number"
                    value={settings.delivery_fee_nationwide}
                    onChange={(e) => setSettings({ ...settings, delivery_fee_nationwide: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Free Delivery Threshold (GH₵)</label>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#070707] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#070707] font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-[#070707]" />
              <span>Save Configuration</span>
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 6: DATABASE */}
        {/* ========================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#121212] border border-[#262626] space-y-4">
              <div className="flex items-center gap-2 text-[#FFFFFF]">
                <Database className="w-4 h-4" />
                <h3 className="text-sm font-bold text-[#F1F0E9] uppercase tracking-wider font-mono">
                  Supabase PostgreSQL Architecture
                </h3>
              </div>
              <p className="text-xs text-[#A5ADA7] leading-relaxed">
                The database schema is fully defined at <code className="text-[#FFFFFF] font-mono">supabase/schema.sql</code> including Row Level Security (RLS) policies for products, inventory, orders, and payment records.
              </p>
              <div className="p-4 rounded-lg bg-[#070707] border border-[#262626] text-xs text-[#A5ADA7] space-y-1">
                <span className="font-bold text-[#F1F0E9] block font-mono">Production Integration:</span>
                <p>
                  To attach a live Supabase database, set <code className="text-[#FFFFFF]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-[#FFFFFF]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment variables.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#070707] border border-[#262626] rounded-2xl shadow-luxury overflow-hidden my-8">
            <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#121212]">
              <h3 className="text-[#F1F0E9] font-bold text-sm uppercase tracking-wider font-mono">
                {editingProduct ? 'Edit Matchwear Item' : 'New Matchwear Item'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-[#A5ADA7] hover:text-[#F1F0E9]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-[#070707]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ghana Black Stars 2024/25 Home"
                    className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Club or Federation *</label>
                  <input
                    type="text"
                    required
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    placeholder="e.g. Real Madrid / Ghana"
                    className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Season</label>
                  <input
                    type="text"
                    value={formSeason}
                    onChange={(e) => setFormSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Specification</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
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
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
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
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Selling Price (GH₵) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono font-bold focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Original Price (Optional)</label>
                  <input
                    type="number"
                    value={formOriginalPrice || ''}
                    onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 520"
                    className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#F1F0E9] block mb-1.5 font-bold uppercase tracking-wider font-mono">
                  Inventory Stock Units by Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {formSizes.map((s, idx) => (
                    <div key={s.size} className="text-center">
                      <span className="text-xs font-mono font-bold text-[#F1F0E9] block mb-1">{s.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => {
                          const next = [...formSizes];
                          next[idx].stock = Math.max(0, parseInt(e.target.value) || 0);
                          setFormSizes(next);
                        }}
                        className="w-full text-center py-1.5 bg-[#121212] border border-[#262626] rounded-lg text-xs font-mono text-[#FFFFFF]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#A5ADA7] font-mono">Image URLs (One per line)</label>
                  <label className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 font-mono">
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
                  className="w-full px-3.5 py-2 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs font-mono focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A5ADA7] block mb-1 font-mono">Garment Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#121212] border border-[#262626] rounded-lg text-[#F1F0E9] text-xs focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#121212] text-[#F1F0E9] text-xs font-bold border border-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#FFFFFF] text-[#070707] text-xs font-black uppercase tracking-wider hover:bg-[#E5E5E5]"
                >
                  {editingProduct ? 'Save Changes' : 'Create Jersey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Proof Modal */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#070707] border border-[#262626] rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[#F1F0E9] font-bold text-xs uppercase tracking-wider font-mono">
                Payment Screenshot: {selectedProofOrder.order_number}
              </h4>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="text-[#A5ADA7] hover:text-[#F1F0E9]"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-lg bg-[#121212] flex items-center justify-center p-2 border border-[#262626]">
              <img
                src={selectedProofOrder.payment?.proof_image_url}
                alt="Proof"
                className="max-h-[50vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="px-4 py-2 rounded-lg bg-[#181818] text-xs text-[#F1F0E9] font-bold border border-[#262626]"
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
