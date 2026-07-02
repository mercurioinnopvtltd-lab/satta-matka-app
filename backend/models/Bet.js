const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  betId: { type: String, unique: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Bet Details
  betType: {
    type: String,
    enum: ['open', 'close', 'jodi', 'haruf'],
    required: true
  },
  number: { type: String, required: true },
  amount: { type: Number, required: true },
  
  // Win/Loss
  isWon: { type: Boolean, default: null },
  winnings: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  resultAt: Date,
});

module.exports = mongoose.model('Bet', betSchema);
