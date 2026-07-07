// models/sideItemModel.js
const { pool } = require('../config/db');

const SideItemModel = {
  async create({ name, description, category, prices, image }) {
    const [result] = await pool.query(
      `INSERT INTO side_items (name, description, category, prices, image) VALUES (?, ?, ?, ?, ?)`,
      [name, description, category, JSON.stringify(prices), image]
    );
    return this.findById(result.insertId);
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM side_items ORDER BY created_at DESC');
    return rows.map(this._format);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM side_items WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? this._format(rows[0]) : null;
  },

  async update(id, fields) {
    const updateData = {};
    if (fields.name) updateData.name = fields.name;
    if (fields.description) updateData.description = fields.description;
    if (fields.category) updateData.category = fields.category;
    if (fields.prices) updateData.prices = JSON.stringify(fields.prices);
    if (fields.image) updateData.image = fields.image;

    const keys = Object.keys(updateData);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => updateData[k]);
    await pool.query(`UPDATE side_items SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM side_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  _format(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      prices: typeof row.prices === 'string' ? JSON.parse(row.prices) : row.prices,
      image: row.image,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },
};

module.exports = SideItemModel;
