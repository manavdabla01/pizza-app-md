const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const { addPizza, updatePizza, deletePizza } = require('../../controllers/pizzaController');
const { authenticateAdminJWT } = require('../../middleware/authMiddleware');

router.post('/addPizza', authenticateAdminJWT, upload.single('image'), addPizza);
router.patch('/pizza/:pizzaId', authenticateAdminJWT, upload.single('image'), updatePizza);
router.delete('/pizza/:pizzaId', authenticateAdminJWT, deletePizza);

module.exports = router;
