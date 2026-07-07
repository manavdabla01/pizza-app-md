// utils/imageUtils.js
const fs = require('fs');
const path = require('path');

// Builds a full, absolute image URL so the frontend never has to guess the host.
// Uses BASE_URL from .env if set (recommended for production), else falls back
// to the incoming request's protocol + host (works fine for local dev).
const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}${imagePath}`;
};

// Deletes an old uploaded image from disk when it's replaced/removed.
// Never throws — a missing file or default image should not break the request.
const deleteImageFile = (imagePath) => {
  try {
    if (!imagePath) return;
    if (imagePath.includes('default-pizza.jpg') || imagePath.includes('default-sideitem.jpg')) return;
    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Error deleting image file:', err.message);
  }
};

module.exports = { getImageUrl, deleteImageFile };
