// models/pizzaModel.js
const { pool } = require('../config/db');

const PizzaModel = {
  async create({ name, description, category, toppings, prices, image }) {
    const [result] = await pool.query(
      `INSERT INTO pizzas (name, description, category, toppings, price_small, price_medium, price_large, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        category || 'pizzas',
        JSON.stringify(toppings),
        prices.Small,
        prices.Medium,
        prices.Large,
        image,
      ]
    );
    return this.findById(result.insertId);
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM pizzas ORDER BY created_at DESC');
    return rows.map(this._format);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM pizzas WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? this._format(rows[0]) : null;
  },

  async update(id, fields) {
    const updateData = {};
    if (fields.name) updateData.name = fields.name;
    if (fields.description) updateData.description = fields.description;
    if (fields.category) updateData.category = fields.category;
    if (fields.toppings) updateData.toppings = JSON.stringify(fields.toppings);
    if (fields.prices) {
      updateData.price_small = fields.prices.Small;
      updateData.price_medium = fields.prices.Medium;
      updateData.price_large = fields.prices.Large;
    }
    if (fields.image) updateData.image = fields.image;

    const keys = Object.keys(updateData);
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => updateData[k]);
    await pool.query(`UPDATE pizzas SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM pizzas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Normalizes DB row into the API shape (mirrors the original Mongoose "prices" object)
  _format(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      toppings: typeof row.toppings === 'string' ? JSON.parse(row.toppings) : row.toppings,
      prices: {
        Small: Number(row.price_small),
        Medium: Number(row.price_medium),
        Large: Number(row.price_large),
      },
      image: row.image,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },
};

module.exports = PizzaModel;
