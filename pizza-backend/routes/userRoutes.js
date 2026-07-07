const express = require('express');
const { signup, login, updateUser, logout, deleteUser } = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authenticateJWT, logout);
router.patch('/:userId', authenticateJWT, updateUser);
router.delete('/:userId', authenticateJWT, deleteUser);

module.exports = router;
