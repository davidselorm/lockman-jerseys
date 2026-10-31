import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/store/data-service';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | LOCKMAN JERSEYS' };

  return {
    title: `${product.name} | LOCKMAN JERSEYS Ghana`,
    description: `Buy ${product.name} (${product.season}) for GH₵ ${product.price}. Available in Accra with express nationwide Ghana delivery and Mobile Money payment.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const relatedJerseys = allProducts
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.club_or_national === product.club_or_national))
    .slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedJerseys} />;
}
