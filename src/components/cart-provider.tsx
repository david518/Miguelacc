"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CartItem = {
  cartId: string;
  productId: string;
  variationId?: string | number;
  variationName?: string;
  name: string;
  price?: number;
  quantity: number;
  image?: string | null;
  allowCvsPickup?: boolean; // 此商品可否超商取貨
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cartId" | "quantity">, quantity?: number) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
  clear: () => void;
  discountedTotal: number;
  originalTotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (item: Omit<CartItem, "cartId" | "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (entry) => entry.productId === item.productId && entry.variationId === item.variationId
        );
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
          };
          return next;
        }
        const cartId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        return [...prev, { ...item, cartId, quantity }];
      });
    },
    []
  );

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const clear = useCallback(() => setItems((prev) => (prev.length === 0 ? prev : [])), []);

  const { discountedTotal, originalTotal } = useMemo(() => {
    const original = items.reduce((sum, item) => {
      if (!item.price) return sum;
      return sum + item.price * item.quantity;
    }, 0);
    return {
      originalTotal: original,
      discountedTotal: original * 0.9,
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      discountedTotal,
      originalTotal,
    }),
    [items, addItem, updateQuantity, removeItem, clear, discountedTotal, originalTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
