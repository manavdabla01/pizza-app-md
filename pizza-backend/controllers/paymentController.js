// controllers/paymentController.js
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const CartModel = require('../models/cartModel');

// Creates a Razorpay order sized to the user's current cart total.
// Frontend uses the returned order_id to open the Razorpay checkout modal.
const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await CartModel.findByUserId(userId);

    if (!cart || Number(cart.total_price) <= 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const amountInPaise = Math.round(Number(cart.total_price) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `cart_${cart.id}_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not initiate payment', error: error.message });
  }
};

// Verifies the HMAC signature Razorpay sends back after a successful payment.
// This MUST pass before we treat the payment as real — never trust the frontend alone.
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    return res.status(500).json({ success: false, message: 'Payment verification error', error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };