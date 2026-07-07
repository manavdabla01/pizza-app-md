// models/cartModel.js
const { pool } = require('../config/db');

const CartModel = {
  async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM carts WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  },

  async createEmptyCart(userId, connection = pool) {
    const [result] = await connection.query(
      'INSERT INTO carts (user_id, subtotal, tax, delivery_fee, total_price) VALUES (?, 0, 0, 0, 0)',
      [userId]
    );
    return { id: result.insertId, user_id: userId, subtotal: 0, tax: 0, delivery_fee: 0, total_price: 0 };
  },

  async getItems(cartId) {
    const [rows] = await pool.query('SELECT * FROM cart_items WHERE cart_id = ?', [cartId]);
    return rows;
  },

  // Full cart with joined pizza/side item details (for GET /cart)
  async getCartWithDetails(userId) {
    const cart = await this.findByUserId(userId);
    if (!cart) return null;

    const [items] = await pool.query(
      `SELECT ci.*,
              p.name AS pizza_name, p.image AS pizza_image, p.description AS pizza_description,
              s.name AS side_name, s.image AS side_image, s.description AS side_description, s.category AS side_category
       FROM cart_items ci
       LEFT JOIN pizzas p ON ci.pizza_id = p.id
       LEFT JOIN side_items s ON ci.side_item_id = s.id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    return { cart, items };
  },

  async findExistingItem(cartId, { pizzaId, sideItemId, size }) {
    let query = 'SELECT * FROM cart_items WHERE cart_id = ? AND size <=> ?';
    const params = [cartId, size || null];

    if (pizzaId) {
      query += ' AND pizza_id = ?';
      params.push(pizzaId);
    } else if (sideItemId) {
      query += ' AND side_item_id = ?';
      params.push(sideItemId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async addItem(cartId, item) {
    const [result] = await pool.query(
      `INSERT INTO cart_items (cart_id, pizza_id, side_item_id, size, quantity, price, item_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cartId, item.pizzaId || null, item.sideItemId || null, item.size || null, item.quantity, item.price, item.itemType]
    );
    return result.insertId;
  },

  async updateItemQuantityAndPrice(cartItemId, quantity, price) {
    await pool.query('UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?', [quantity, price, cartItemId]);
  },

  async removeItem(cartItemId) {
    await pool.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
  },

  async updateTotals(cartId, { subtotal, tax, deliveryFee, totalPrice }) {
    await pool.query(
      'UPDATE carts SET subtotal = ?, tax = ?, delivery_fee = ?, total_price = ? WHERE id = ?',
      [subtotal, tax, deliveryFee, totalPrice, cartId]
    );
  },

  async deleteCart(userId) {
    const [result] = await pool.query('DELETE FROM carts WHERE user_id = ?', [userId]);
    return result.affectedRows > 0;
  },

  async recalculateTotals(cartId) {
    const items = await this.getItems(cartId);
    const DELIVERY_FEE = 30;
    const TAX_RATE = 0.04;
    const subtotal = items.reduce((sum, i) => sum + Number(i.price), 0);
    const tax = subtotal * TAX_RATE;
    const totalPrice = Math.round(subtotal + DELIVERY_FEE + tax);
    await this.updateTotals(cartId, { subtotal, tax, deliveryFee: DELIVERY_FEE, totalPrice });
    return { subtotal, tax, deliveryFee: DELIVERY_FEE, totalPrice, itemCount: items.length };
  },
};

module.exports = CartModel;
