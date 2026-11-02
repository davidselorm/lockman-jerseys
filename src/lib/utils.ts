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
}): string {
  const { productName, size, quantity, totalPrice, city = 'Accra', orderNumber } = params;
  return `⚡ LOCKMAN JERSEYS ORDER\n${orderNumber ? `Ref: #${orderNumber}\n` : ''}Item: ${productName}\nSize: ${size} | Qty: ${quantity}\nTotal: GH₵ ${totalPrice.toFixed(2)}\nDelivery: ${city}\n\nSent via LockmanJerseys.com`;
}

export function buildSnapchatUrl(username: string): string {
  const cleaned = username.replace(/^@/, '').trim();
  return `https://www.snapchat.com/add/${cleaned}`;
}
