'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, JerseySize, CartItem, StoreSettings } from '@/types';
import { getStoreSettings } from './data-service';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: JerseySize, quantity?: number) => void;
  removeItem: (productId: string, size: JerseySize) => void;
  updateQuantity: (productId: string, size: JerseySize, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  deliveryCity: 'Accra' | 'Nationwide';
  setDeliveryCity: (city: 'Accra' | 'Nationwide') => void;
  deliveryFee: number;
  total: number;
  storeSettings: StoreSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'lockman_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState<'Accra' | 'Nationwide'>('Accra');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  // Load cart and settings on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Failed to parse cart:', e);
    }

    getStoreSettings().then(setStoreSettings);
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [items]);

  const addItem = (product: Product, size: JerseySize, quantity: number = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.product.id === product.id && i.selectedSize === size
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [...prev, { product, selectedSize: size, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, size: JerseySize) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.selectedSize === size)));
  };

  const updateQuantity = (productId: string, size: JerseySize, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const deliveryFee =
    storeSettings && subtotal >= storeSettings.free_delivery_threshold
      ? 0
      : deliveryCity === 'Accra'
      ? storeSettings?.delivery_fee_accra ?? 30
      : storeSettings?.delivery_fee_nationwide ?? 60;

  const total = subtotal + (items.length > 0 ? deliveryFee : 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        totalItems,
        subtotal,
        deliveryCity,
        setDeliveryCity,
        deliveryFee,
        total,
        storeSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
