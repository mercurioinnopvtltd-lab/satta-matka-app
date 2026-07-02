const express = require('express');
const Game = require('../models/Game');
const Bet = require('../models/Bet');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Declare result (Admin only)
router.post('/declare/:gameId', auth, adminAuth, async (req, res) => {
  try {
    const { openNumber, closeNumber } = req.body;
    
    const game = await Game.findByIdAndUpdate(
      req.params.gameId,
      {
        'result.openNumber': openNumber,
        'result.closeNumber': closeNumber,
        status: 'result_declared',
      },
      { new: true }
    );

    // Calculate winners
    const bets = await Bet.find({ gameId: req.params.gameId, status: 'pending' });
    
    for (let bet of bets) {
      let isWon = false;
      let payout = 0;

      if (bet.betType === 'open' && bet.number === openNumber) {
        isWon = true;
        payout = bet.amount * 9; // 9x payout
      } else if (bet.betType === 'close' && bet.number === closeNumber) {
        isWon = true;
        payout = bet.amount * 9;
      }

      bet.isWon = isWon;
      bet.status = isWon ? 'won' : 'lost';
      bet.winnings = payout;
      await bet.save();

      // Update player wallet if won
      if (isWon) {
        const player = await User.findById(bet.playerId);
        player.wallet.balance += payout;
        player.wallet.winnings += payout;
        await player.save();
      }
    }

    res.json({ success: true, message: 'Result declared', game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get game results
router.get('/', auth, async (req, res) => {
  try {
    const results = await Game.find({ status: 'result_declared' }).sort({ resultTime: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
