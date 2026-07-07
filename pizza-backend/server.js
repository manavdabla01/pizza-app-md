// server.js
require('dotenv').config();
require('./config/setup-ssl');
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { pool, connectDB } = require('./config/db');


// PUBLIC ROUTES
const userRoutes = require('./routes/userRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sideItemRoutes = require('./routes/sideItemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// ADMIN ROUTES
const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const adminUserRoutes = require('./routes/admin/adminUserRoutes');
const adminPizzaRoutes = require('./routes/admin/adminPizzaRoutes');
const adminSideItemRoutes = require('./routes/admin/adminSideItemRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MySQL
connectDB();

// Serve uploaded images statically — full URLs are built in controllers via imageUtils
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (handy once this is deployed)
app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'API is running' }));

// PUBLIC ROUTES
app.use('/api/users', userRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sideitems', sideItemRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// ADMIN ROUTES
app.use('/api/admin', adminOrderRoutes);
app.use('/api/admin', adminPizzaRoutes);
app.use('/api/admin', adminSideItemRoutes);
app.use('/api/admin', adminUserRoutes);

// Multer error handler (bad file type / file too large etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Something went wrong' });
  }
  next();
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});