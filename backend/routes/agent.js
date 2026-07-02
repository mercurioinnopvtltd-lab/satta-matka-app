const express = require('express');
const User = require('../models/User');
const Bet = require('../models/Bet');
const auth = require('../middleware/auth');

const router = express.Router();

// Get agent dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const agentId = req.user.userId;
    
    // Get agent details
    const agent = await User.findById(agentId);
    
    // Get agent's players
    const players = await User.find({ agentId }).select('-password');
    
    // Get agent's bets
    const bets = await Bet.find({ agentId }).populate('playerId').populate('gameId');
    
    const totalBets = bets.length;
    const totalAmount = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalWinnings = bets.filter(b => b.isWon).reduce((sum, b) => sum + b.winnings, 0);
    
    res.json({
      success: true,
      agent: {
        name: agent.name,
        email: agent.email,
        commission: agent.commission,
        wallet: agent.wallet,
      },
      stats: {
        totalPlayers: players.length,
        totalBets,
        totalAmount,
        totalWinnings,
      },
      players,
      recentBets: bets.slice(-10),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get agent's players
router.get('/players', auth, async (req, res) => {
  try {
    const agentId = req.user.userId;
    const players = await User.find({ agentId }).select('-password');
    res.json({ success: true, players });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
