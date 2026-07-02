const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  
  // User Type: admin, agent, player
  role: {
    type: String,
    enum: ['admin', 'agent', 'player'],
    default: 'player'
  },
  
  // Player/Agent Fields
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Wallet
  wallet: {
    balance: { type: Number, default: 0 },
    deposited: { type: Number, default: 0 },
    winnings: { type: Number, default: 0 },
  },
  
  // Commission
  commission: {
    earned: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
  },
  
  // KYC
  kyc: {
    verified: { type: Boolean, default: false },
    aadhar: String,
    pan: String,
    bankAccount: String,
    ifsc: String,
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
