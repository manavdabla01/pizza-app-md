import { createContext, useContext, useState, useCallback } from 'react';
import * as endpoints from '../api/endpoints';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, deliveryFee: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await endpoints.getCart();
      setItems(data.items || []);
      setTotals({
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        deliveryFee: data.deliveryFee || 0,
        totalPrice: data.totalPrice || 0,
      });
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = useCallback(
    async (payload) => {
      await endpoints.addToCart(payload);
      await refreshCart();
      setDrawerOpen(true);
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      await endpoints.updateCartItems([{ cartItemId, quantity }]);
      await refreshCart();
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      await endpoints.removeCartItem(cartItemId);
      await refreshCart();
    },
    [refreshCart]
  );

  const emptyCart = useCallback(async () => {
    await endpoints.clearCart();
    setItems([]);
    setTotals({ subtotal: 0, tax: 0, deliveryFee: 0, totalPrice: 0 });
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        loading,
        itemCount,
        drawerOpen,
        setDrawerOpen,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
