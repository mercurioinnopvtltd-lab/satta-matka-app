const express = require('express');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all games
router.get('/', auth, async (req, res) => {
  try {
    const games = await Game.find().sort({ startTime: 1 });
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get active games
router.get('/active', auth, async (req, res) => {
  try {
    const games = await Game.find({ status: { $in: ['active', 'closed'] } });
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create game (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { gameName, startTime, closingTime } = req.body;
    const gameId = `GAME_${Date.now()}`;

    const game = new Game({
      gameId,
      gameName,
      startTime,
      closingTime,
    });

    await game.save();
    res.status(201).json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
