// models/reviewModel.js
const { pool } = require('../config/db');

const ReviewModel = {
  async create({ userId, pizzaId, sideItemId, rating, comment }) {
    const [result] = await pool.query(
      `INSERT INTO reviews (user_id, pizza_id, side_item_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
      [userId, pizzaId || null, sideItemId || null, rating, comment || null]
    );
    const [rows] = await pool.query(
      `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?`,
      [result.insertId]
    );
    return rows[0];
  },

  async findForPizza(pizzaId) {
    const [rows] = await pool.query(
      `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.pizza_id = ? ORDER BY r.created_at DESC`,
      [pizzaId]
    );
    return rows;
  },

  async findForSideItem(sideItemId) {
    const [rows] = await pool.query(
      `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.side_item_id = ? ORDER BY r.created_at DESC`,
      [sideItemId]
    );
    return rows;
  },

  // Average rating + count for every pizza in one query (used to decorate the menu list)
  async getPizzaRatingSummary() {
    const [rows] = await pool.query(
      `SELECT pizza_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
       FROM reviews WHERE pizza_id IS NOT NULL GROUP BY pizza_id`
    );
    return rows;
  },

  async getSideItemRatingSummary() {
    const [rows] = await pool.query(
      `SELECT side_item_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
       FROM reviews WHERE side_item_id IS NOT NULL GROUP BY side_item_id`
    );
    return rows;
  },

  async getRecent(limit = 6) {
    const [rows] = await pool.query(
      `SELECT r.*, u.username,
              p.name AS pizza_name, s.name AS side_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN pizzas p ON r.pizza_id = p.id
       LEFT JOIN side_items s ON r.side_item_id = s.id
       WHERE r.comment IS NOT NULL AND r.comment != ''
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  async findByIdAndUser(id, userId) {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
    return rows[0] || null;
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ReviewModel;