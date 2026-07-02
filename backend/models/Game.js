const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, unique: true, required: true },
  gameName: { type: String, required: true }, // e.g., "Morning", "Evening", "Night"
  description: String,
  
  // Game Timing
  startTime: { type: Date, required: true },
  closingTime: { type: Date, required: true },
  resultTime: { type: Date },
  
  // Result
  result: {
    openNumber: { type: String },
    closeNumber: { type: String },
    openJodi: { type: String },
    closeJodi: { type: String },
  },
  
  // Game Status
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed', 'result_declared'],
    default: 'upcoming'
  },
  
  // Settings
  minBet: { type: Number, default: 10 },
  maxBet: { type: Number, default: 100000 },
  commissionPercentage: { type: Number, default: 10 },
  
  // Metadata
  totalBets: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  totalWinnings: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', gameSchema);
