// controllers/reviewController.js
const ReviewModel = require('../models/reviewModel');
const PizzaModel = require('../models/pizzaModel');
const SideItemModel = require('../models/sideItemModel');

// Add a review for a pizza OR a side item (exactly one must be provided)
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pizzaId, sideItemId, rating, comment } = req.body;

    if (!pizzaId && !sideItemId) {
      return res.status(400).json({ success: false, message: 'Provide either pizzaId or sideItemId.' });
    }
    if (pizzaId && sideItemId) {
      return res.status(400).json({ success: false, message: 'Provide only one of pizzaId or sideItemId.' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (pizzaId) {
      const pizza = await PizzaModel.findById(pizzaId);
      if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found.' });
    } else {
      const sideItem = await SideItemModel.findById(sideItemId);
      if (!sideItem) return res.status(404).json({ success: false, message: 'Side item not found.' });
    }

    const review = await ReviewModel.create({ userId, pizzaId, sideItemId, rating, comment });

    return res.status(201).json({ success: true, message: 'Review added!', review });
  } catch (error) {
    console.error('Error adding review:', error.message);
    return res.status(500).json({ success: false, message: 'Error adding review', error: error.message });
  }
};

const getPizzaReviews = async (req, res) => {
  try {
    const { pizzaId } = req.params;
    const reviews = await ReviewModel.findForPizza(pizzaId);
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

const getSideItemReviews = async (req, res) => {
  try {
    const { sideItemId } = req.params;
    const reviews = await ReviewModel.findForSideItem(sideItemId);
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// Latest reviews across all pizzas/side items — used for homepage testimonials
const getRecentReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.getRecent(6);
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching recent reviews:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching recent reviews' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await ReviewModel.findByIdAndUser(id, userId);
    if (!review && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Review not found or not yours.' });
    }

    await ReviewModel.remove(id);
    return res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    return res.status(500).json({ success: false, message: 'Error deleting review' });
  }
};

module.exports = { addReview, getPizzaReviews, getSideItemReviews, getRecentReviews, deleteReview };