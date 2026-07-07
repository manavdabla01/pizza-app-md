const express = require('express');
const { checkoutOrder, getMyOrders, cancelOrder } = require('../controllers/orderController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkoutOrder', authenticateJWT, checkoutOrder);
router.get('/my-orders', authenticateJWT, getMyOrders);
router.delete('/:orderId', authenticateJWT, cancelOrder);

module.exports = router;
