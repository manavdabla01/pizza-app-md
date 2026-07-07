// models/orderModel.js
const { pool } = require('../config/db');

const VALID_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const OrderModel = {
  VALID_STATUSES,

  async create(connection, { userId, customerName, phone, email, address, paymentMethod, razorpayOrderId, razorpayPaymentId, subtotal, tax, deliveryFee, totalPrice }) {
    const [result] = await connection.query(
      `INSERT INTO orders (user_id, customer_name, phone, email, address, payment_method, razorpay_order_id, razorpay_payment_id, subtotal, tax, delivery_fee, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, customerName, phone, email, address, paymentMethod || 'cod', razorpayOrderId, razorpayPaymentId, subtotal, tax, deliveryFee, totalPrice]
    );
    return result.insertId;
  },

  async addItem(connection, orderId, item) {
    await connection.query(
      `INSERT INTO order_items (order_id, pizza_id, side_item_id, size, quantity, price, item_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, item.pizzaId || null, item.sideItemId || null, item.size || null, item.quantity, item.price, item.itemType]
    );
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdAndUser(id, userId) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
    return rows[0] || null;
  },

  async getItemsForOrder(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.*, p.name AS pizza_name, s.name AS side_name
       FROM order_items oi
       LEFT JOIN pizzas p ON oi.pizza_id = p.id
       LEFT JOIN side_items s ON oi.side_item_id = s.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },

  // All orders, newest first, with username joined (admin view)
  async findAll() {
    const [orders] = await pool.query(
      `SELECT o.*, u.username
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const results = [];
    for (const order of orders) {
      const items = await this.getItemsForOrder(order.id);
      results.push({ ...order, items });
    }
    return results;
  },

  async findByUserId(userId) {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const results = [];
    for (const order of orders) {
      const items = await this.getItemsForOrder(order.id);
      results.push({ ...order, items });
    }
    return results;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },
};

module.exports = OrderModel;