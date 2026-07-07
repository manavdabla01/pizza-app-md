const express = require('express');
const { addReview, getPizzaReviews, getSideItemReviews, getRecentReviews, deleteReview } = require('../controllers/reviewController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateJWT, addReview);
router.get('/recent', getRecentReviews);
router.get('/pizza/:pizzaId', getPizzaReviews);
router.get('/sideitem/:sideItemId', getSideItemReviews);
router.delete('/:id', authenticateJWT, deleteReview);

module.exports = router;