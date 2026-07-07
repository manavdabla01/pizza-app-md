const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', authenticateJWT, createRazorpayOrder);
router.post('/verify', authenticateJWT, verifyPayment);

module.exports = router;