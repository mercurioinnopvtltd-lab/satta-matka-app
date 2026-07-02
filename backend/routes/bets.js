const express = require('express');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Game = require('../models/Game');
const auth = require('../middleware/auth');

const router = express.Router();

// Place bet
router.post('/place', auth, async (req, res) => {
  try {
    const { gameId, betType, number, amount } = req.body;
    const playerId = req.user.userId;

    // Validate game
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Game not active' });
    }

    // Validate amount
    if (amount < game.minBet || amount > game.maxBet) {
      return res.status(400).json({ success: false, message: 'Invalid bet amount' });
    }

    // Check wallet balance
    const player = await User.findById(playerId);
    if (player.wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct from wallet
    player.wallet.balance -= amount;
    await player.save();

    // Create bet
    const betId = `BET_${Date.now()}`;
    const bet = new Bet({
      betId,
      gameId,
      playerId,
      betType,
      number,
      amount,
    });

    await bet.save();

    // Update game stats
    game.totalBets += 1;
    game.totalAmount += amount;
    await game.save();

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get player bets
router.get('/player/:playerId', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ playerId: req.params.playerId })
      .populate('gameId')
      .sort({ createdAt: -1 });
    res.json({ success: true, bets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
