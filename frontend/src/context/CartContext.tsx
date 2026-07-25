import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export type CartItem = { id: number; name: string; price: number; quantity: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: number; name: string; price: number }) => void;
  addToCartWithQuantity: (item: { id: number; name: string; price: number }, qty: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: { id: number; name: string; price: number }) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const addToCartWithQuantity = useCallback(
    (item: { id: number; name: string; price: number }, qty: number) => {
      setCart(prev => {
        const exists = prev.find(i => i.id === item.id);
        if (exists) {
          return prev.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i));
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => (i.id === id ? { ...i, quantity: qty } : i));
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, addToCart, addToCartWithQuantity, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }),
    [cart, addToCart, addToCartWithQuantity, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
