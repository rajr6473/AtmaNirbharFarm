import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DELIVERY_CART_STORAGE_KEY = '@dhanvantri_delivery_cart';

type DeliveryCartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
  variantId?: number;
  variantLabel?: string;
  productId?: number;
};

type DeliveryCartContextType = {
  cart: DeliveryCartItem[];
  addToCart: (item: Omit<DeliveryCartItem, 'qty'>) => void;
  increment: (id: number, variantId?: number) => void;
  decrement: (id: number, variantId?: number) => void;
  removeFromCart: (id: number, variantId?: number) => void;
  clearCart: () => void;
  totalAmount: number;
  cartItemCount: number;
  isCartLoaded: boolean;
  getCartItem: (id: number, variantId?: number) => DeliveryCartItem | undefined;
};

const DeliveryCartContext = createContext<DeliveryCartContextType | null>(null);

export const DeliveryCartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<DeliveryCartItem[]>([]);
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
      const storedCart = await AsyncStorage.getItem(DELIVERY_CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading delivery cart from storage:', error);
    } finally {
      setIsCartLoaded(true);
    }
  };

  const saveCartToStorage = async (cartData: DeliveryCartItem[]) => {
    try {
      await AsyncStorage.setItem(DELIVERY_CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving delivery cart to storage:', error);
    }
  };

  const addToCart = useCallback((item: Omit<DeliveryCartItem, 'qty'>) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => {
        if (item.variantId) {
          return i.id === item.id && i.variantId === item.variantId;
        }
        return i.id === item.id && !i.variantId;
      });

      if (existing) {
        return prevCart.map(i => {
          if (item.variantId) {
            return (i.id === item.id && i.variantId === item.variantId)
              ? { ...i, qty: i.qty + 1 }
              : i;
          }
          return (i.id === item.id && !i.variantId) ? { ...i, qty: i.qty + 1 } : i;
        });
      } else {
        return [...prevCart, { ...item, qty: 1 }];
      }
    });
  }, []);

  const increment = useCallback((id: number, variantId?: number) => {
    setCart(prevCart => prevCart.map(i => {
      if (variantId) {
        return (i.id === id && i.variantId === variantId) ? { ...i, qty: i.qty + 1 } : i;
      }
      return (i.id === id && !i.variantId) ? { ...i, qty: i.qty + 1 } : i;
    }));
  }, []);

  const decrement = useCallback((id: number, variantId?: number) => {
    setCart(prevCart =>
      prevCart
        .map(i => {
          if (variantId) {
            return (i.id === id && i.variantId === variantId) ? { ...i, qty: i.qty - 1 } : i;
          }
          return (i.id === id && !i.variantId) ? { ...i, qty: i.qty - 1 } : i;
        })
        .filter(i => i.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number, variantId?: number) => {
    setCart(prevCart => prevCart.filter(i => {
      if (variantId) {
        return !(i.id === id && i.variantId === variantId);
      }
      return !(i.id === id && !i.variantId);
    }));
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

  const getCartItem = useCallback((id: number, variantId?: number) => {
    return cart.find(i => {
      if (variantId) {
        return i.id === id && i.variantId === variantId;
      }
      return i.id === id && !i.variantId;
    });
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
    getCartItem,
  }), [cart, addToCart, increment, decrement, removeFromCart, clearCart, totalAmount, cartItemCount, isCartLoaded, getCartItem]);

  return (
    <DeliveryCartContext.Provider value={value}>
      {children}
    </DeliveryCartContext.Provider>
  );
};

export const useDeliveryCart = () => {
  const context = useContext(DeliveryCartContext);
  if (!context) {
    throw new Error('useDeliveryCart must be used within a DeliveryCartProvider');
  }
  return context;
};
