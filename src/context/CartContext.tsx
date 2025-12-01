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
  isPayback?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (item: CartItem) => Promise<number | null>;
  updateCartItemCount: (cartItemId: number, count: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  removeSelectedCartItems: (cartItemIds: number[]) => Promise<void>;
  mergeLocalCartToDb: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get('/members/info');
        if (res.data.authenticated) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        // 로그인이 안 되어 있어도 로컬 카트 로드를 위해 일단 진행
      }
    };
    checkLogin();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]);

  const addToCart = async (newItem: CartItem): Promise<number | null> => {
    if (isLoggedIn) {
      const payload = {
        itemId: newItem.itemId,
        count: newItem.count,
        optionName: newItem.optionName,
        optionPrice: newItem.optionPrice,
      };
      
      try {
        const response = await api.post('/api/cart', payload);
        await fetchCart();
        return response.data.cartItemId; 
      } catch (error) {
        console.error(error);
        return null;
      }
    } else { // 비로그인 처리
      const currentCart = [...cartItems];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.itemId === newItem.itemId && item.optionName === newItem.optionName
      );

      let targetId: number;
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].count += newItem.count;
        targetId = currentCart[existingItemIndex].cartItemId || Date.now();
        if (!currentCart[existingItemIndex].cartItemId) currentCart[existingItemIndex].cartItemId = targetId;
      } else {
        targetId = Date.now();
        newItem.cartItemId = targetId;
        currentCart.push(newItem);
      }
      
      setCartItems(currentCart);
      localStorage.setItem('guest_cart', JSON.stringify(currentCart));
      return targetId;
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
      isLoading,
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