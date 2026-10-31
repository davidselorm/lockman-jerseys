import React from 'react';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { 
  getProducts, 
  getCategories, 
  getOrders, 
  getStoreSettings, 
  getDashboardStats 
} from '@/lib/store/data-service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administrator Dashboard | LOCKMAN JERSEYS',
  description: 'Manage jerseys, inventory, Ghana MoMo payment verifications, and store settings.',
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  // Verify cryptographically signed session
  if (!session.authenticated) {
    redirect('/admin/login');
  }

  const [products, categories, orders, storeSettings, stats] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
    getStoreSettings(),
    getDashboardStats(),
  ]);

  return (
    <AdminDashboardClient
      initialProducts={products}
      categories={categories}
      initialOrders={orders}
      initialSettings={storeSettings}
      initialStats={stats}
    />
  );
}
