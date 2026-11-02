import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/store/data-service';
import { ProductDetailClient } from './ProductDetailClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | LOCKMAN JERSEYS' };

  const firstImg = product.images?.[0];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lockmanjerseys.vercel.app';
  const imageUrl = firstImg
    ? (firstImg.startsWith('http')
        ? firstImg
        : `${baseUrl}${firstImg.startsWith('/') ? firstImg : `/${firstImg}`}`)
    : `${baseUrl}/images/brand/logo.png`;

  return {
    title: `${product.name} | LOCKMAN JERSEYS Ghana`,
    description: `Buy ${product.name} (${product.season}) for GH₵ ${product.price}. Available in Accra with express nationwide Ghana delivery and instant WhatsApp or Snapchat ordering.`,
    openGraph: {
      title: `${product.name} | LOCKMAN JERSEYS`,
      description: `Authentic ${product.jersey_type} - GH₵ ${product.price}. Express Accra delivery.`,
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'LOCKMAN JERSEYS',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | LOCKMAN JERSEYS`,
      description: `Buy ${product.name} (${product.season}) for GH₵ ${product.price}.`,
      images: [imageUrl],
    },
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
