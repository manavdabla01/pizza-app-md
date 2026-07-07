const express = require('express');
const { addToCart, updateCartItem, getCart, removeCartItem, clearCart } = require('../controllers/cartController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authenticateJWT, addToCart);
router.get('/', authenticateJWT, getCart);
router.patch('/update', authenticateJWT, updateCartItem);
router.delete('/item/:cartItemId', authenticateJWT, removeCartItem);
router.delete('/clear', authenticateJWT, clearCart);

module.exports = router;
