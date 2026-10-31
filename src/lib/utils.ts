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

export function generateWhatsAppMessage(params: {
  productName: string;
  size: JerseySize;
  quantity: number;
  totalPrice: number;
  city?: string;
  orderNumber?: string;
}): string {
  const { productName, size, quantity, totalPrice, city = 'Accra', orderNumber } = params;
  let msg = `🔥 *NEW ORDER - LOCKMAN JERSEYS*\n\n`;
  if (orderNumber) {
    msg += `*Order Reference:* ${orderNumber}\n`;
  }
  msg += `*Item:* ${productName}\n`;
  msg += `*Size:* ${size}\n`;
  msg += `*Quantity:* ${quantity}\n`;
  msg += `*Total Amount:* GH₵ ${totalPrice.toFixed(2)}\n`;
  msg += `*Delivery Location:* ${city}\n\n`;
  msg += `Please confirm availability and dispatch schedule.`;
  return msg;
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  // Normalize phone number (strip spaces, +, dashes)
  const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
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
}): string {
  const { productName, size, quantity, totalPrice, city = 'Accra', orderNumber } = params;
  return `⚡ LOCKMAN JERSEYS ORDER\n${orderNumber ? `Ref: #${orderNumber}\n` : ''}Item: ${productName}\nSize: ${size} | Qty: ${quantity}\nTotal: GH₵ ${totalPrice.toFixed(2)}\nDelivery: ${city}\n\nSent via LockmanJerseys.com`;
}

export function buildSnapchatUrl(username: string): string {
  const cleaned = username.replace(/^@/, '').trim();
  return `https://www.snapchat.com/add/${cleaned}`;
}
