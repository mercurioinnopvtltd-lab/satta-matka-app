const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_key');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate deposit
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.userId;

    const paymentId = `PAY_${Date.now()}`;
    const payment = new Payment({
      paymentId,
      userId,
      amount,
      type: 'deposit',
      paymentMethod,
      status: 'pending',
    });

    await payment.save();

    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'inr',
        metadata: { paymentId, userId },
      });

      payment.gateway = 'stripe';
      payment.gatewayResponse = paymentIntent;
      await payment.save();

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentId,
      });
    } else if (paymentMethod === 'upi') {
      res.json({
        success: true,
        message: 'UPI Payment - Scan QR Code',
        paymentId,
      });
    } else {
      res.json({
        success: true,
        message: 'Payment initiated',
        paymentId,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.userId;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'success';
    await payment.save();

    // Add to wallet
    const user = await User.findById(userId);
    user.wallet.balance += payment.amount;
    user.wallet.deposited += payment.amount;
    await user.save();

    res.json({
      success: true,
      message: 'Payment successful',
      wallet: user.wallet,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Withdrawal request
router.post('/withdrawal', auth, async (req, res) => {
  try {
    const { amount, bankAccount, ifsc, accountHolder } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (user.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const paymentId = `WTH_${Date.now()}`;
    const payment = new Payment({
      paymentId,
      userId,
      amount,
      type: 'withdrawal',
      paymentMethod: 'bank_transfer',
      bankAccount,
      ifsc,
      accountHolder,
      status: 'pending',
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      paymentId,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
