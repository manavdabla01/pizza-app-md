// controllers/pizzaController.js
const PizzaModel = require('../models/pizzaModel');
const ReviewModel = require('../models/reviewModel');
const { getImageUrl, deleteImageFile } = require('../utils/imageUtils');

const formatWithImageUrl = (req, pizza) => ({ ...pizza, image: getImageUrl(req, pizza.image) });

// Add new pizza (Admin only)
const addPizza = async (req, res) => {
  try {
    const { name, toppings, prices, description, category } = req.body;

    if (!name || !toppings || !prices || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, toppings, prices, description) are required.',
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }

    const toppingsArray = Array.isArray(toppings) ? toppings : toppings.split(',').map((t) => t.trim());

    let parsedPrices;
    try {
      parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid prices format. Must be valid JSON.' });
    }

    if (!parsedPrices.Small || !parsedPrices.Medium || !parsedPrices.Large) {
      return res.status(400).json({ success: false, message: 'Prices must include Small, Medium and Large.' });
    }

    const newPizza = await PizzaModel.create({
      name,
      description,
      category,
      toppings: toppingsArray,
      prices: parsedPrices,
      image: `/uploads/${req.file.filename}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Pizza added successfully!',
      pizza: formatWithImageUrl(req, newPizza),
    });
  } catch (error) {
    console.error('Error adding pizza:', error.message);
    return res.status(500).json({ success: false, message: 'Error adding pizza', error: error.message });
  }
};

// Get all pizzas (Public)
const getPizzas = async (req, res) => {
  try {
    const pizzas = await PizzaModel.findAll();
    const ratingSummary = await ReviewModel.getPizzaRatingSummary();
    const ratingMap = Object.fromEntries(ratingSummary.map((r) => [r.pizza_id, r]));

    const enriched = pizzas.map((p) => ({
      ...formatWithImageUrl(req, p),
      avgRating: ratingMap[p.id]?.avg_rating || null,
      reviewCount: ratingMap[p.id]?.review_count || 0,
    }));

    return res.status(200).json({ success: true, pizzas: enriched });
  } catch (error) {
    console.error('Error fetching pizzas:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching pizzas', error: error.message });
  }
};

// Get single pizza by id (Public)
const getPizzaById = async (req, res) => {
  try {
    const { pizzaId } = req.params;
    const pizza = await PizzaModel.findById(pizzaId);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found.' });
    }
    return res.status(200).json({ success: true, pizza: formatWithImageUrl(req, pizza) });
  } catch (error) {
    console.error('Error fetching pizza:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching pizza', error: error.message });
  }
};

// Delete pizza (Admin only)
const deletePizza = async (req, res) => {
  try {
    const { pizzaId } = req.params;
    const pizza = await PizzaModel.findById(pizzaId);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found.' });
    }

    await PizzaModel.remove(pizzaId);
    deleteImageFile(pizza.image);

    return res.status(200).json({ success: true, message: 'Pizza deleted successfully!' });
  } catch (error) {
    console.error('Error deleting pizza:', error.message);
    return res.status(500).json({ success: false, message: 'Error deleting pizza', error: error.message });
  }
};

// Update pizza (Admin only)
const updatePizza = async (req, res) => {
  try {
    const { pizzaId } = req.params;
    const { name, toppings, prices, description, category } = req.body;

    const existingPizza = await PizzaModel.findById(pizzaId);
    if (!existingPizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found.' });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;
    if (category) updatedData.category = category;
    if (toppings) {
      updatedData.toppings = Array.isArray(toppings) ? toppings : toppings.split(',').map((t) => t.trim());
    }
    if (prices) {
      try {
        updatedData.prices = typeof prices === 'string' ? JSON.parse(prices) : prices;
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid prices format.' });
      }
    }

    // If a new image is uploaded, replace it and clean up the old file
    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
      deleteImageFile(existingPizza.image);
    }

    const updatedPizza = await PizzaModel.update(pizzaId, updatedData);

    return res.status(200).json({
      success: true,
      message: 'Pizza updated successfully!',
      pizza: formatWithImageUrl(req, updatedPizza),
    });
  } catch (error) {
    console.error('Error updating pizza:', error.message);
    return res.status(500).json({ success: false, message: 'Error updating pizza', error: error.message });
  }
};

module.exports = { addPizza, getPizzas, getPizzaById, deletePizza, updatePizza };