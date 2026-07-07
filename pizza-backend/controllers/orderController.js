// controllers/orderController.js
const { pool } = require('../config/db');
const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');

const checkoutOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { customerName, phone, email, address, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;

    if (!customerName || !phone || !email || !address) {
      connection.release();
      return res.status(400).json({ success: false, message: 'All contact details are required' });
    }

    const validPaymentMethods = ['upi', 'card', 'cod'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Invalid payment method. Use upi, card, or cod.' });
    }

    // Online payments must already be verified via /payment/verify before checkout
    if ((paymentMethod === 'upi' || paymentMethod === 'card') && (!razorpayOrderId || !razorpayPaymentId)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Payment reference missing. Complete payment before checkout.' });
    }

    const cart = await CartModel.findByUserId(userId);
    if (!cart) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const cartItems = await CartModel.getItems(cart.id);
    if (cartItems.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    await connection.beginTransaction();

    // Use the cart's already-calculated totals — don't just sum item prices
    const subtotal = Number(cart.subtotal);
    const tax = Number(cart.tax);
    const deliveryFee = Number(cart.delivery_fee);
    const totalPrice = Number(cart.total_price);

    const orderId = await OrderModel.create(connection, {
      userId,
      customerName,
      phone,
      email,
      address,
      paymentMethod: paymentMethod || 'cod',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      subtotal,
      tax,
      deliveryFee,
      totalPrice,
    });

    for (const item of cartItems) {
      // cart_items.item_type uses 'pizza'; orders.item_type uses 'pizzas' — normalize here
      const orderItemType = item.item_type === 'pizza' ? 'pizzas' : item.item_type;
      await OrderModel.addItem(connection, orderId, {
        pizzaId: item.pizza_id,
        sideItemId: item.side_item_id,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price),
        itemType: orderItemType,
      });
    }

    // Remove the cart (its items cascade automatically via FK)
    await connection.query('DELETE FROM carts WHERE user_id = ?', [userId]);

    await connection.commit();
    connection.release();

    const newOrder = await OrderModel.findById(orderId);
    const items = await OrderModel.getItemsForOrder(orderId);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: { ...newOrder, items },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Checkout Error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findAll();
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!OrderModel.VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = await OrderModel.updateStatus(id, status);
    console.log(`Order status updated to ${status} for Order ID: ${id}`);

    return res.status(200).json({ success: true, message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error.message);
    return res.status(500).json({ success: false, message: 'Error updating order status' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await OrderModel.findByUserId(userId);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching your orders' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await OrderModel.findByIdAndUser(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    const updatedOrder = await OrderModel.updateStatus(orderId, 'cancelled');

    return res.status(200).json({ success: true, message: 'Order has been cancelled', order: updatedOrder });
  } catch (error) {
    console.error('Cancel Order Error:', error.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.', error: error.message });
  }
};

module.exports = { checkoutOrder, getOrders, updateOrderStatus, cancelOrder, getMyOrders };