const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../../controllers/userController');
const { authenticateAdminJWT } = require('../../middleware/authMiddleware');

router.get('/all-users', authenticateAdminJWT, getAllUsers);
router.patch('/:userId', authenticateAdminJWT, updateUser);
router.delete('/:userId', authenticateAdminJWT, deleteUser);

module.exports = router;
