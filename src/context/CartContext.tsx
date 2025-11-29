'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface CartItem {
  cartItemId?: number;
  itemId: number;
  itemNm: string;
  price: number;
  count: number;
  imgUrl: string;
  optionName: string;
  optionPrice: number;
  isDiscount: boolean;
  discountRate: number;
  deliveryFee: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (item: CartItem) => Promise<void>;
  updateCartItemCount: (cartItemId: number, count: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  removeSelectedCartItems: (cartItemIds: number[]) => Promise<void>;
  mergeLocalCartToDb: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get('/members/info');
        if (res.data.authenticated) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const fetchCart = async () => {
    if (isLoggedIn) {
      try {
        const res = await api.get('/api/cart');
        setCartItems(res.data);
      } catch (err) {
        console.error('Failed to fetch cart from DB', err);
      }
    } else {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      } else {
        setCartItems([]);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]);

  const addToCart = async (newItem: CartItem) => {
    if (isLoggedIn) {
      const payload = {
        itemId: newItem.itemId,
        count: newItem.count,
        optionName: newItem.optionName,
        optionPrice: newItem.optionPrice,
      };
      await api.post('/api/cart', payload);
      await fetchCart();
    } else {
      const currentCart = [...cartItems];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.itemId === newItem.itemId && item.optionName === newItem.optionName
      );

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].count += newItem.count;
      } else {
        newItem.cartItemId = Date.now();
        currentCart.push(newItem);
      }
      
      setCartItems(currentCart);
      localStorage.setItem('guest_cart', JSON.stringify(currentCart));
    }
  };

  const updateCartItemCount = async (cartItemId: number, count: number) => {
    if (isLoggedIn) {
      await api.patch(`/api/cart/${cartItemId}`, { count });
      await fetchCart();
    } else {
      const updatedCart = cartItems.map(item => 
        item.cartItemId === cartItemId ? { ...item, count } : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (isLoggedIn) {
      await api.delete(`/api/cart/${cartItemId}`);
      await fetchCart();
    } else {
      const updatedCart = cartItems.filter(item => item.cartItemId !== cartItemId);
      setCartItems(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
    }
  };

  const removeSelectedCartItems = async (cartItemIds: number[]) => {
    if (cartItemIds.length === 0) return;

    if (isLoggedIn) {
      await api.post('/api/cart/delete', { cartItemIds });
      await fetchCart();
    } else {
      const updatedCart = cartItems.filter(item => 
        item.cartItemId !== undefined && !cartItemIds.includes(item.cartItemId)
      );
      setCartItems(updatedCart);
      localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
    }
  };

  const mergeLocalCartToDb = async () => {
    const localCart = localStorage.getItem('guest_cart');
    if (!localCart) return;

    const parsedCart: CartItem[] = JSON.parse(localCart);
    if (parsedCart.length === 0) return;

    const mergeData = parsedCart.map(item => ({
      itemId: item.itemId,
      count: item.count,
      optionName: item.optionName,
      optionPrice: item.optionPrice
    }));

    try {
      await api.post('/api/cart/merge', mergeData);
      localStorage.removeItem('guest_cart');
      await fetchCart();
    } catch (error) {
      console.error('Cart merge failed', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount: cartItems.length, 
      fetchCart, 
      addToCart, 
      updateCartItemCount, 
      removeFromCart,
      removeSelectedCartItems,
      mergeLocalCartToDb
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}