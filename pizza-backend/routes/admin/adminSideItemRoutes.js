const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const { authenticateAdminJWT } = require('../../middleware/authMiddleware');
const { addSideItem, updateSideItem, deleteSideItem } = require('../../controllers/sideItemController');

// NOTE: auth runs BEFORE upload so unauthenticated requests never touch disk
router.post('/addSideItem', authenticateAdminJWT, upload.single('image'), addSideItem);
router.patch('/sideItem/:id', authenticateAdminJWT, upload.single('image'), updateSideItem);
router.delete('/sideItem/:id', authenticateAdminJWT, deleteSideItem);

module.exports = router;
