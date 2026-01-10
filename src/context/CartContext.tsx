import React, { createContext, useContext, useState } from 'react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clearCart: () => void;
  totalAmount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    increment(item.id);
  } else {
    setCart([...cart, { ...item, qty: 1 }]);
  }
};


  const increment = (id: number) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  };


const clearCart = () => {
  setCart([]);
};

  const decrement = (id: number) => {
    setCart(
      cart
        .map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0)
    );
  };

  const totalAmount = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, increment, clearCart, decrement, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext)!;
