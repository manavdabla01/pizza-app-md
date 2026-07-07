const express = require('express');
const router = express.Router();
const { authenticateAdminJWT } = require('../../middleware/authMiddleware');
const { getOrders, updateOrderStatus } = require('../../controllers/orderController');

router.get('/getOrders', authenticateAdminJWT, getOrders);
router.patch('/updateStatus/:id', authenticateAdminJWT, updateOrderStatus);

module.exports = router;
