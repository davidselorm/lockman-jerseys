import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, JerseySize, StoreSettings } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCedis(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function resolveAbsoluteImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:')) return ''; // Skip bulky base64 data URLs in message text
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://lockmanjerseys.vercel.app';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

export function generateWhatsAppMessage(params: {
  productName: string;
  size: JerseySize;
  quantity: number;
  totalPrice: number;
  city?: string;
  orderNumber?: string;
  imageUrl?: string;
  productSlug?: string;
}): string {
  const { productName, size, quantity, totalPrice, city = 'Accra', orderNumber, imageUrl, productSlug } = params;
  let msg = `*NEW ORDER - LOCKMAN JERSEYS*\n\n`;
  if (orderNumber) {
    msg += `*Order Reference:* #${orderNumber}\n`;
  }
  msg += `*Item:* ${productName}\n`;
  msg += `*Size:* ${size}\n`;
  msg += `*Quantity:* ${quantity}\n`;
  msg += `*Total Amount:* GH₵ ${totalPrice.toFixed(2)}\n`;
  msg += `*Delivery Location:* ${city}\n\n`;

  if (productSlug) {
    const baseUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://lockmanjerseys.vercel.app';
    msg += `*Product Link:* ${baseUrl}/product/${productSlug}\n`;
  }

  msg += `\nPlease confirm availability and dispatch schedule.`;
  return msg;
}

export const DEFAULT_WHATSAPP_NUMBER = '233257107980';

export function buildWhatsAppUrl(phoneNumber: string | undefined | null, message: string): string {
  // Normalize phone number (strip spaces, +, dashes). Default to official hotline if missing or dummy
  const raw = phoneNumber && phoneNumber.trim() ? phoneNumber : DEFAULT_WHATSAPP_NUMBER;
  let cleanedPhone = raw.replace(/[^0-9]/g, '');
  if (!cleanedPhone || cleanedPhone === '233240000000' || cleanedPhone.includes('000000')) {
    cleanedPhone = DEFAULT_WHATSAPP_NUMBER;
  }
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encodedMsg}`;
}

export function generateSnapchatOrderSummary(params: {
  productName: string;
  size: JerseySize;
  quantity: number;
  totalPrice: number;
  city?: string;
  orderNumber?: string;
  imageUrl?: string;
  productSlug?: string;
}): string {
  const { productName, size, quantity, totalPrice, city = 'Accra', orderNumber, productSlug } = params;
  let text = `*LOCKMAN JERSEYS ORDER*\n${orderNumber ? `Ref: #${orderNumber}\n` : ''}Item: ${productName}\nSize: ${size} | Qty: ${quantity}\nTotal: GH₵ ${totalPrice.toFixed(2)}\nDelivery: ${city}\n`;
  if (productSlug) {
    const baseUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://lockmanjerseys.vercel.app';
    text += `Product Link: ${baseUrl}/product/${productSlug}\n`;
  }
  text += `\nSent via LockmanJerseys.com`;
  return text;
}

export function buildSnapchatUrl(username: string): string {
  const cleaned = username.replace(/^@/, '').trim();
  return `https://www.snapchat.com/add/${cleaned}`;
}
