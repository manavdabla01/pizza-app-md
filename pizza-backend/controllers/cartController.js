// controllers/cartController.js
const CartModel = require('../models/cartModel');
const PizzaModel = require('../models/pizzaModel');
const SideItemModel = require('../models/sideItemModel');
const { getImageUrl } = require('../utils/imageUtils');

const DELIVERY_FEE = 30;
const TAX_RATE = 0.04;

// Add to Cart (Supports Pizza & Side Items)
const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let { items, pizzaId, sideItemId, size, quantity } = req.body;

    if (!items) {
      if (!pizzaId && !sideItemId) {
        return res.status(400).json({ success: false, message: 'Provide either a pizzaId or sideItemId.' });
      }
      items = [{ pizzaId, sideItemId, size, quantity }];
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid request. Provide at least one valid item.' });
    }

    let cart = await CartModel.findByUserId(userId);
    if (!cart) {
      cart = await CartModel.createEmptyCart(userId);
    }

    for (let item of items) {
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
      }

      let unitPrice = 0;
      let itemType = '';

      if (item.pizzaId) {
        const pizza = await PizzaModel.findById(item.pizzaId);
        if (!pizza) {
          return res.status(404).json({ success: false, message: `Pizza not found for ID: ${item.pizzaId}` });
        }
        if (!item.size || !pizza.prices[item.size]) {
          return res.status(400).json({ success: false, message: 'Invalid or missing pizza size.' });
        }
        unitPrice = pizza.prices[item.size];
        itemType = 'pizza';
      } else if (item.sideItemId) {
        const sideItem = await SideItemModel.findById(item.sideItemId);
        if (!sideItem) {
          return res.status(404).json({ success: false, message: `Side item not found for ID: ${item.sideItemId}` });
        }

        const priceKeys = Object.keys(sideItem.prices);
        let size = item.size;

        // Single-priced item (e.g. one snack size) — size is optional, auto-pick the only key
        if (!size && priceKeys.length === 1) {
          size = priceKeys[0];
        }

        if (!size || sideItem.prices[size] === undefined) {
          return res.status(400).json({ success: false, message: 'Invalid or missing size for side item.' });
        }

        item.size = size;
        unitPrice = sideItem.prices[size];
        itemType = sideItem.category || 'sideItem';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid item data. Provide either pizzaId or sideItemId.' });
      }

      const totalPriceForItem = unitPrice * item.quantity;

      const existingItem = await CartModel.findExistingItem(cart.id, {
        pizzaId: item.pizzaId,
        sideItemId: item.sideItemId,
        size: item.size,
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        const newPrice = unitPrice * newQuantity;
        await CartModel.updateItemQuantityAndPrice(existingItem.id, newQuantity, newPrice);
      } else {
        await CartModel.addItem(cart.id, {
          pizzaId: item.pizzaId,
          sideItemId: item.sideItemId,
          size: item.size,
          quantity: item.quantity,
          price: totalPriceForItem,
          itemType,
        });
      }
    }

    const totals = await CartModel.recalculateTotals(cart.id);

    return res.status(200).json({
      success: true,
      message: 'Item(s) added to cart successfully!',
      cart: { id: cart.id, userId, ...totals },
    });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await CartModel.getCartWithDetails(userId);

    if (!result || result.items.length === 0) {
      return res.status(200).json({ success: true, message: 'Cart is empty', items: [] });
    }

    const { cart, items } = result;

    const cartItems = items.map((item) => {
      const isPizza = !!item.pizza_id;
      return {
        cartItemId: item.id,
        id: isPizza ? item.pizza_id : item.side_item_id,
        name: isPizza ? item.pizza_name : item.side_name || 'Unknown Item',
        image: getImageUrl(req, isPizza ? item.pizza_image : item.side_image),
        description: isPizza ? item.pizza_description : item.side_description || '',
        size: item.size || null,
        quantity: item.quantity,
        price: Number(item.price),
        totalItemPrice: Number(item.price),
        itemType: item.item_type,
        category: isPizza ? 'pizza' : item.side_category || item.item_type,
      };
    });

    return res.status(200).json({
      success: true,
      items: cartItems,
      subtotal: Number(cart.subtotal),
      deliveryFee: Number(cart.delivery_fee),
      tax: Number(cart.tax),
      totalPrice: Number(cart.total_price),
    });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update quantities for one or more cart items (removes item if quantity <= 0)
const updateCartItem = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide an array of items with cartItemId and quantity',
      });
    }

    const cart = await CartModel.findByUserId(userId);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const existingItems = await CartModel.getItems(cart.id);

    for (const item of items) {
      const { cartItemId, quantity } = item;
      const cartItem = existingItems.find((ci) => ci.id === Number(cartItemId));

      if (!cartItem) {
        console.warn(`Cart item not found: ${cartItemId}`);
        continue;
      }

      const unitPrice = Number(cartItem.price) / cartItem.quantity;

      if (quantity <= 0) {
        await CartModel.removeItem(cartItem.id);
      } else {
        const newPrice = unitPrice * quantity;
        await CartModel.updateItemQuantityAndPrice(cartItem.id, quantity, newPrice);
      }
    }

    const remainingItems = await CartModel.getItems(cart.id);
    if (remainingItems.length === 0) {
      await CartModel.deleteCart(userId);
      return res.status(200).json({ success: true, message: 'Cart emptied' });
    }

    const totals = await CartModel.recalculateTotals(cart.id);
    return res.status(200).json({ success: true, message: 'Cart updated successfully', cart: { id: cart.id, ...totals } });
  } catch (error) {
    console.error('Error updating cart:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// DELETE /cart/item/:cartItemId
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const cart = await CartModel.findByUserId(userId);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const items = await CartModel.getItems(cart.id);
    const item = items.find((i) => i.id === Number(cartItemId));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    await CartModel.removeItem(item.id);

    const remainingItems = await CartModel.getItems(cart.id);
    if (remainingItems.length === 0) {
      await CartModel.deleteCart(userId);
      return res.status(200).json({ success: true, message: 'Item removed and cart is now empty' });
    }

    const totals = await CartModel.recalculateTotals(cart.id);
    return res.status(200).json({ success: true, message: 'Item removed from cart', cart: { id: cart.id, ...totals } });
  } catch (error) {
    console.error('Error removing cart item:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// DELETE /cart/clear
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await CartModel.deleteCart(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Cart already empty or not found' });
    }
    return res.status(200).json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

module.exports = { addToCart, updateCartItem, getCart, removeCartItem, clearCart };