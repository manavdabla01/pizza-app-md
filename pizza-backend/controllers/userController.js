// controllers/userController.js
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');

// Signup (Admin or Customer)
const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await UserModel.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({ username, email, hashedPassword, role });

    console.log(`New user created with username: ${username}`);
    return res.status(201).json({
      success: true,
      message: `${newUser.role} account created successfully`,
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating account:', error.message);
    return res.status(500).json({ success: false, message: 'Error creating account' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = generateToken(payload);

    const { password: _pw, ...userWithoutPassword } = user;

    console.log('Login successful');
    return res.status(200).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ success: false, message: 'Error logging in' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, role } = req.body;

    if (req.user.id !== Number(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this user' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;

    const updatedUser = await UserModel.update(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    return res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

// Logout (stateless JWT — client just discards the token)
const logout = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Logout successful. Remove token from client.' });
  } catch (error) {
    console.error('Error during logout:', error.message);
    return res.status(500).json({ success: false, message: 'Error logging out' });
  }
};

// Delete user (DB cascades cart & orders via FK ON DELETE CASCADE)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== Number(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this user' });
    }

    const deleted = await UserModel.remove(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

module.exports = { signup, login, getAllUsers, updateUser, deleteUser, logout };
