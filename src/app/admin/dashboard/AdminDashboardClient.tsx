'use client';

import React, { useState, useRef } from 'react';
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
  Truck,
  X,
  Sparkles,
  PhoneCall,
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  AlertCircle,
  Eye,
  Star,
  Flame,
  Layers
} from 'lucide-react';
import { Product, Category, Order, StoreSettings, JerseySize, JerseyType } from '@/types';
import { formatCedis } from '@/lib/utils';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateOrderStatus, 
  updateStoreSettings,
  clearAllProducts,
  clearAllOrders
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab & View Mode ('list' vs 'editor')
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'database'>('products');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Store data state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // ========================================================
  // FORM STATES (Add / Edit Matchwear Kit)
  // ========================================================
  const [formName, setFormName] = useState('');
  const [formClub, setFormClub] = useState('');
  const [formSeason, setFormSeason] = useState('2024/25');
  const [formType, setFormType] = useState<JerseyType>('Home');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'cat-1');
  const [formPrice, setFormPrice] = useState<number | ''>(450);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | ''>(500);
  const [formDescription, setFormDescription] = useState('');
  
  // High-Resolution Image Gallery Previews (Array of URLs/base64)
  const [formImages, setFormImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Visibility & Marketing flags
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(true);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Size stock matrix
  const [formSizes, setFormSizes] = useState<{ size: JerseySize; stock: number }[]>([
    { size: 'S', stock: 5 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 5 },
    { size: '2XL', stock: 2 },
    { size: '3XL', stock: 1 },
  ]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    if (!confirm('This will execute the PostgreSQL schema, create all missing tables, and ensure cloud storage is ready. Continue?')) {
      return;
    }

    setDbMigrating(true);
    setDbMigrationLogs(['Initiating clean database migration...']);
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
        setDbMigrationLogs(prev => [...prev, '✓ Database schema verified and clean!']);
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

  const handleClearAllKits = async () => {
    const confirmation = prompt('Type CLEAR to confirm wiping all kits and sample data:');
    if (confirmation !== 'CLEAR') return;

    try {
      await clearAllProducts();
      await fetch('/api/admin/clear-kits', { method: 'POST' });
      setProducts([]);
      showToast('Database wiped cleanly. Catalogue is now 0 items for production.');
      router.refresh();
    } catch (err) {
      console.error('Error clearing products:', err);
    }
  };

  React.useEffect(() => {
    // Client-side active session guard
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store' });
        if (!res.ok) {
          localStorage.removeItem('lockman_admin_authed');
          window.location.replace('/admin/login');
        }
      } catch {
        window.location.replace('/admin/login');
      }
    };
    checkAuth();
  }, []);

  React.useEffect(() => {
    if (activeTab === 'database' && !dbStatus && !dbLoading) {
      fetchDatabaseStatus();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' });
    } catch (e) {
      console.warn('Logout fetch warning:', e);
    }
    localStorage.removeItem('lockman_admin_authed');
    // Clear cookie from client side as well
    document.cookie = 'lockman_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/admin/login');
  };

  // ========================================================
  // IMAGE UPLOAD & GALLERY MANAGEMENT (FIXED PREVIEWS)
  // ========================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
            setFormImages(prev => [...prev, data.url]);
          }
        }
      }
      showToast('Photo uploaded and preview added!');
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast('Upload error. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setFormImages(prev => [...prev, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
    showToast('Photo link added to gallery preview!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setFormImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(indexToPrimary, 1);
      return [item, ...copy];
    });
    showToast('Cover photo updated!');
  };

  // ========================================================
  // OPEN / CLOSE EDITOR
  // ========================================================
  const openEditor = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormClub(product.club_or_national);
      setFormSeason(product.season);
      setFormType(product.jersey_type);
      setFormCategory(product.category_id);
      setFormPrice(product.price);
      setFormOriginalPrice(product.original_price || '');
      setFormDescription(product.description);
      setFormImages(product.images || []);
      setFormSizes([...product.sizes]);
      setFormIsFeatured(product.is_featured);
      setFormIsNewArrival(product.is_new_arrival);
      setFormIsAvailable(product.is_available);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormClub('');
      setFormSeason('2024/25');
      setFormType('Home');
      setFormCategory(categories[0]?.id || 'cat-1');
      setFormPrice(450);
      setFormOriginalPrice(500);
      setFormDescription('');
      setFormImages([]);
      setFormSizes([
        { size: 'S', stock: 5 },
        { size: 'M', stock: 10 },
        { size: 'L', stock: 10 },
        { size: 'XL', stock: 5 },
        { size: '2XL', stock: 2 },
        { size: '3XL', stock: 1 },
      ]);
      setFormIsFeatured(false);
      setFormIsNewArrival(true);
      setFormIsAvailable(true);
    }
    setUrlInput('');
    setShowUrlInput(false);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingProduct(null);
  };

  // ========================================================
  // SAVE / DELETE PRODUCT
  // ========================================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a product name');
      return;
    }

    if (formImages.length === 0) {
      alert('Please upload or attach at least one photo for this matchwear kit.');
      return;
    }

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const catObj = categories.find(c => c.id === formCategory);

    const priceNum = Number(formPrice) || 0;
    const origPriceNum = formOriginalPrice ? Number(formOriginalPrice) : undefined;

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, {
        name: formName,
        slug,
        club_or_national: formClub,
        season: formSeason,
        jersey_type: formType,
        category_id: formCategory,
        category_name: catObj?.name,
        price: priceNum,
        original_price: origPriceNum,
        description: formDescription,
        images: formImages,
        sizes: formSizes,
        is_featured: formIsFeatured,
        is_new_arrival: formIsNewArrival,
        is_available: formIsAvailable,
      });

      if (updated) {
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        showToast('Kit updated successfully!');
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
        price: priceNum,
        original_price: origPriceNum,
        description: formDescription,
        is_featured: formIsFeatured,
        is_new_arrival: formIsNewArrival,
        is_popular: false,
        is_available: formIsAvailable,
        images: formImages,
        sizes: formSizes,
      });

      setProducts(prev => [created, ...prev]);
      showToast('New matchwear kit published to storefront!');
    }

    closeEditor();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this kit from the catalogue?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Kit removed from catalogue.');
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
    showToast(`Order status updated to ${status}`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateStoreSettings(settings);
    setSettings(updated);
    setSaveSuccess(true);
    showToast('Store settings saved successfully!');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.club_or_national.toLowerCase().includes(productSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (productStockFilter === 'in_stock') return p.total_stock > 0;
    if (productStockFilter === 'out_of_stock') return p.total_stock === 0;
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.order_status === orderStatusFilter;
  });

  const totalStockCount = products.reduce((acc, p) => acc + p.total_stock, 0);
  const totalFormUnits = formSizes.reduce((acc, s) => acc + (s.stock || 0), 0);

  // ========================================================
  // RENDER: ADD / EDIT MATCHWEAR KIT PAGE (CLEAN & SIMPLE)
  // ========================================================
  if (isEditorOpen) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-24">
        
        {/* Editor Sticky Top Header */}
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center transition-all"
                title="Back to inventory"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                  {editingProduct ? 'Edit Matchwear Kit' : 'Add New Matchwear Kit'}
                </h1>
                <p className="text-xs text-zinc-400">
                  {editingProduct ? `Editing: ${editingProduct.name}` : 'Upload photos and set stock for production'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-white/10 transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-black" />
                <span>{editingProduct ? 'Save Changes' : 'Publish Kit'}</span>
              </button>
            </div>

          </div>
        </header>

        {/* Editor Form Body */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Photos & Kit Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. VISUAL PHOTO GALLERY (FIXED: SHOWS PREVIEWS, NOT RAW URLS) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-5 h-5 text-white" />
                    <div>
                      <h2 className="text-sm font-black uppercase text-white tracking-wide">
                        Kit Photos & Previews
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Upload official kit photos. First photo is used as the cover.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white">
                    {formImages.length} {formImages.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>

                {/* Upload Action Card / Dropzone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="p-5 rounded-2xl bg-black border border-dashed border-white/20 hover:border-white cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingImage}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white text-zinc-300 group-hover:text-black flex items-center justify-center transition-all">
                      {uploadingImage ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        {uploadingImage ? 'Uploading Photos...' : 'Upload Photos from Device'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Supports JPG, PNG, WEBP (Multiple allowed)
                      </span>
                    </div>
                  </label>

                  {/* Or Add from Image Link */}
                  <div className="p-5 rounded-2xl bg-black border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-white block">Add via Web Link</span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        Paste external Nike, Adidas or high-res photo URL
                      </span>
                    </div>

                    {showUrlInput ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-[#141414] border border-white/20 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-3 py-1.5 bg-white text-black text-xs font-black rounded-xl hover:bg-zinc-200"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="mt-3 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors text-center"
                      >
                        + Enter Image Link
                      </button>
                    )}
                  </div>
                </div>

                {/* VISUAL IMAGE PREVIEWS GRID (NO RAW TEXT!) */}
                {formImages.length > 0 ? (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-mono text-zinc-400 block">
                      Uploaded Photo Gallery (Tap cover to re-order):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-2xl bg-black border border-white/15 overflow-hidden flex items-center justify-center p-1"
                        >
                          {/* Real Visual Image Thumbnail */}
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-contain rounded-xl"
                          />

                          {/* Cover Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-white text-black shadow-md flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-black" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/70 hover:bg-white hover:text-black text-zinc-300 opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                            >
                              Make Cover
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 shadow-md"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-black border border-white/5 text-center text-xs text-zinc-500">
                    No photos added yet. Upload or paste a link above to preview your jersey.
                  </div>
                )}

              </div>

              {/* 2. KIT BASICS */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
                <h2 className="text-sm font-black uppercase text-white tracking-wide">
                  Kit Details & Identity
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Kit Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arsenal 2024/25 Home Cannon Jersey"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                        Club / Federation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arsenal FC / Real Madrid / Ghana"
                        value={formClub}
                        onChange={(e) => setFormClub(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                        Season
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2024/25"
                        value={formSeason}
                        onChange={(e) => setFormSeason(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Kit Edition Pills */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">
                      Kit Edition / Specification
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['Home', 'Away', 'Third', 'Player Version', 'Retro', 'Special Edition'] as JerseyType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormType(t)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            formType === t
                              ? 'bg-white text-black shadow-md'
                              : 'bg-black text-zinc-400 hover:text-white border border-white/15'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">
                      Store Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormCategory(c.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            formCategory === c.id
                              ? 'bg-white text-black shadow-md'
                              : 'bg-black text-zinc-400 hover:text-white border border-white/15'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Garment Description */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Garment Description & Fit Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="High-breathability stadium cut with official tournament badges and authentic embroidered club shield..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Pricing, Sizes & Stock Stepper (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 3. PRICING */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
                <h2 className="text-sm font-black uppercase text-white tracking-wide">
                  Pricing & Value
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Selling Price (GH₵) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">GH₵</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-14 pr-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-sm font-mono font-black focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Original Price (Strike-through / Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">GH₵</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 520"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full pl-14 pr-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-sm font-mono focus:outline-none focus:border-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. SIZES & STOCK STEPPER */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase text-white tracking-wide">
                    Live Stock Count by Size
                  </h2>
                  <span className="text-xs font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    {totalFormUnits} Total Units
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {formSizes.map((s, idx) => (
                    <div
                      key={s.size}
                      className="p-3 rounded-2xl bg-black border border-white/15 flex flex-col items-center justify-center space-y-2 text-center"
                    >
                      <span className="text-xs font-mono font-black text-white">
                        Size {s.size}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...formSizes];
                            next[idx].stock = Math.max(0, next[idx].stock - 1);
                            setFormSizes(next);
                          }}
                          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center font-black text-sm active:scale-90 transition-all"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => {
                            const next = [...formSizes];
                            next[idx].stock = Math.max(0, parseInt(e.target.value) || 0);
                            setFormSizes(next);
                          }}
                          className="w-12 text-center py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-bold text-white"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const next = [...formSizes];
                            next[idx].stock = next[idx].stock + 1;
                            setFormSizes(next);
                          }}
                          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center font-black text-sm active:scale-90 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. VISIBILITY & BADGES */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-3">
                <h2 className="text-sm font-black uppercase text-white tracking-wide">
                  Storefront Visibility
                </h2>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-black border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Active on Storefront</span>
                      <span className="text-[10px] text-zinc-400">Allows customers to view and order this kit</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-black border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Feature on Homepage</span>
                      <span className="text-[10px] text-zinc-400">Spotlight in Vault Picks</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-2xl bg-black border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formIsNewArrival}
                      onChange={(e) => setFormIsNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded accent-white"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">New Arrival Badge</span>
                      <span className="text-[10px] text-zinc-400">Highlights in Latest Drops</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

          </form>
        </main>

        {/* Sticky Bottom Save Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 py-3.5 px-4 sm:px-8 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              Ready to publish: <strong>{formName || 'Untitled Kit'}</strong> ({totalFormUnits} units)
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={closeEditor}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="px-8 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-white/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-black" />
                <span>{editingProduct ? 'Save Changes' : 'Publish Kit to Storefront'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ========================================================
  // RENDER: MAIN ADMIN DASHBOARD (CLEAN, BEAUTIFUL & SIMPLE)
  // ========================================================
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-full bg-white text-black text-xs font-black shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
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
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white text-black">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Direct Management Console
              </span>
            </div>
          </div>

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

      {/* Airbnb Minimalist Tab Navigation Bar */}
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
            
            {/* Top Bar: Search, Filters & Add Product */}
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
                    className="w-full pl-11 pr-4 py-3 bg-[#0C0C0C] border border-white/15 rounded-full text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-all"
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

                {/* Stock Filter Chips */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0C0C0C] border border-white/10 text-xs">
                  <button
                    onClick={() => setProductStockFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      productStockFilter === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setProductStockFilter('in_stock')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      productStockFilter === 'in_stock' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    In Stock
                  </button>
                </div>
              </div>

              {/* Add Kit Primary Button */}
              <button
                onClick={() => openEditor()}
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Matchwear Kit</span>
              </button>

            </div>

            {/* EMPTY STATE: WHEN CATALOGUE HAS ZERO PRODUCTS (CLEAN SLATE) */}
            {products.length === 0 ? (
              <div className="p-10 sm:p-16 rounded-3xl bg-[#0C0C0C] border border-white/10 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-white text-black flex items-center justify-center mx-auto shadow-xl">
                  <Package className="w-8 h-8 stroke-[2.2]" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Catalogue is Clean & Ready for Production
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    All dummy and test kits have been cleared from the database. Click below to add your first authentic jersey with photos and live size stock.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => openEditor()}
                    className="px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-white/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add First Matchwear Kit</span>
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-[#0C0C0C] rounded-3xl border border-white/10 space-y-3">
                <Search className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-sm font-bold text-white">No kits match &ldquo;{productSearch}&rdquo;</p>
                <button
                  onClick={() => setProductSearch('')}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-[#0C0C0C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/80 border-b border-white/10 text-zinc-400 uppercase font-mono tracking-wider">
                        <tr>
                          <th className="py-4 px-6">Jersey Style</th>
                          <th className="py-4 px-4">Club / Team</th>
                          <th className="py-4 px-4">Price</th>
                          <th className="py-4 px-4">Sizes & Stock (Tap to Quick-Edit)</th>
                          <th className="py-4 px-4 text-center">Total</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                            
                            <td className="py-3.5 px-6 flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                {p.images[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-zinc-500" />
                                )}
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
                                onClick={() => openEditor(p)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white text-zinc-300 hover:text-black border border-white/15 transition-all"
                                title="Edit Kit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 rounded-full bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all"
                                title="Delete Kit"
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

                {/* Mobile Responsive Inventory Cards */}
                <div className="md:hidden space-y-3">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="p-4 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-3">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0">
                          {p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-zinc-500" />
                          )}
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
                          onClick={() => openEditor(p)}
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
              </>
            )}

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
                  <p className="text-xs text-zinc-400">There are currently no customer orders under this filter.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, '');
                  const waChatLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${order.customer_name}, this is Lockman Jerseys regarding your order #${order.order_number} (${formatCedis(order.total_amount)}).`
                  )}`;

                  return (
                    <div key={order.id} className="p-6 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-5 hover:border-white/20 transition-all">
                      
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

            <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-white">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Customer WhatsApp Ordering Line
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                All 1-tap WhatsApp checkout buttons on the storefront forward customer orders directly to this number.
              </p>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5 font-mono uppercase">
                  WhatsApp Business Number (Country code with no + or spaces, e.g. 233...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 233257107980"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs font-mono focus:outline-none focus:border-white transition-all"
                />
              </div>
            </div>

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
                    placeholder="e.g. +233 25 710 7980"
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
                      Database Health & Production Setup
                    </h3>
                    <p className="text-xs text-zinc-400">
                      PostgreSQL database status & maintenance tools
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
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
                    <span>{dbMigrating ? 'Checking Schema...' : 'Initialize / Verify Schema'}</span>
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
                      {dbLoading ? 'Checking...' : dbStatus?.connected ? 'Online (Connected)' : 'Local Storage Mode'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-white/10">
                  <span className="text-[11px] text-zinc-400 font-mono block">Database Schema</span>
                  <span className="mt-1 block text-xs font-mono font-bold text-white">
                    {dbLoading ? '...' : dbStatus?.tablesReady ? 'All 8 Tables Ready' : 'Tables Initialized'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-white/10">
                  <span className="text-[11px] text-zinc-400 font-mono block">Catalogue Count</span>
                  <span className="mt-1 block text-xs font-mono font-bold text-white">
                    {products.length} live kits
                  </span>
                </div>
              </div>

              {/* Maintenance Tools: Wipe Test Data Button */}
              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-red-300">
                      Production Reset: Zero-Out Database
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Wipes any lingering demo jerseys or orders from local and cloud storage.
                    </p>
                  </div>
                  <button
                    onClick={handleClearAllKits}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    Clear All Test Data
                  </button>
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

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
