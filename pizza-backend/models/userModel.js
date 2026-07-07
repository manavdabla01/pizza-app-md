// models/userModel.js
const { pool } = require('../config/db');

const UserModel = {
  async create({ username, email, hashedPassword, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'customer']
    );
    return { id: result.insertId, username, email, role: role || 'customer' };
  },

  async findByEmailOrUsername(email, username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at, updated_at FROM users'
    );
    return rows;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  // Deletes user and cascades cart/orders (handled by DB FK ON DELETE CASCADE)
  async remove(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;
