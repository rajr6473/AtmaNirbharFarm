import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@dhanvantri_cart';

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalAmount: number;
  cartItemCount: number;
  isCartLoaded: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to AsyncStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isCartLoaded) {
      saveCartToStorage(cart);
    }
  }, [cart, isCartLoaded]);

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setIsCartLoaded(true);
    }
  };

  const saveCartToStorage = async (cartData: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = useCallback((item: Omit<CartItem, 'qty'>) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
  }, []);

  const increment = useCallback((id: number) => {
    setCart(prevCart => prevCart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }, []);

  const decrement = useCallback((id: number) => {
    setCart(prevCart =>
      prevCart
        .map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prevCart => prevCart.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    totalAmount,
    cartItemCount,
    isCartLoaded,
  }), [cart, addToCart, increment, decrement, removeFromCart, clearCart, totalAmount, cartItemCount, isCartLoaded]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
