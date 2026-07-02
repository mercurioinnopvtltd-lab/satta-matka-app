const express = require('express');
const User = require('../models/User');
const Game = require('../models/Game');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Block user
router.put('/users/:userId/block', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: true },
      { new: true }
    );
    res.json({ success: true, message: 'User blocked', user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unblock user
router.put('/users/:userId/unblock', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: false },
      { new: true }
    );
    res.json({ success: true, message: 'User unblocked', user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    
    const payments = await Payment.find();
    const totalDeposits = payments
      .filter(p => p.type === 'deposit' && p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalWithdrawals = payments
      .filter(p => p.type === 'withdrawal' && p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPlayers,
        totalAgents,
        totalDeposits,
        totalWithdrawals,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
