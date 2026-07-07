// controllers/sideItemController.js
const SideItemModel = require('../models/sideItemModel');
const ReviewModel = require('../models/reviewModel');
const { getImageUrl, deleteImageFile } = require('../utils/imageUtils');

const formatWithImageUrl = (req, item) => ({ ...item, image: getImageUrl(req, item.image) });

// Add a new side item (Admin only)
const addSideItem = async (req, res) => {
  try {
    const { name, category, prices, description } = req.body;

    if (!name || !category || !prices || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, category, prices, description) are required.',
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }

    let parsedPrices;
    try {
      parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format for prices. It should be a valid JSON object.',
      });
    }

    if (typeof parsedPrices !== 'object' || Object.keys(parsedPrices).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prices must be a non-empty object with at least one size/quantity.',
      });
    }

    const newSideItem = await SideItemModel.create({
      name,
      category,
      description,
      prices: parsedPrices,
      image: `/uploads/${req.file.filename}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Side item added successfully!',
      sideItem: formatWithImageUrl(req, newSideItem),
    });
  } catch (error) {
    console.error('Error adding side item:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error while adding side item.', error: error.message });
  }
};

// Get all side items (Public)
const getSideItems = async (req, res) => {
  try {
    const items = await SideItemModel.findAll();
    const ratingSummary = await ReviewModel.getSideItemRatingSummary();
    const ratingMap = Object.fromEntries(ratingSummary.map((r) => [r.side_item_id, r]));

    const enriched = items.map((i) => ({
      ...formatWithImageUrl(req, i),
      avgRating: ratingMap[i.id]?.avg_rating || null,
      reviewCount: ratingMap[i.id]?.review_count || 0,
    }));

    return res.status(200).json({ success: true, items: enriched });
  } catch (error) {
    console.error('Error fetching side items:', error.message);
    return res.status(500).json({ success: false, message: 'Error fetching side items.', error: error.message });
  }
};

// Update a side item (Admin only)
const updateSideItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, prices, description } = req.body;

    const existingItem = await SideItemModel.findById(id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Side item not found.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (prices) {
      try {
        const parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
        if (typeof parsedPrices !== 'object' || Object.keys(parsedPrices).length === 0) {
          return res.status(400).json({ success: false, message: 'Prices must be a valid non-empty object.' });
        }
        updateData.prices = parsedPrices;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format for prices. It should be a valid JSON object.',
        });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      deleteImageFile(existingItem.image);
    }

    const updatedItem = await SideItemModel.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Side item updated successfully!',
      sideItem: formatWithImageUrl(req, updatedItem),
    });
  } catch (error) {
    console.error('Error updating side item:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error while updating side item.', error: error.message });
  }
};

// Delete a side item (Admin only)
const deleteSideItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await SideItemModel.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Side item not found.' });
    }

    await SideItemModel.remove(id);
    deleteImageFile(item.image);

    return res.status(200).json({ success: true, message: 'Side item deleted successfully!' });
  } catch (error) {
    console.error('Error deleting side item:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error while deleting side item.', error: error.message });
  }
};

module.exports = { addSideItem, getSideItems, updateSideItem, deleteSideItem };