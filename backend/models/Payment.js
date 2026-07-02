const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  transactionId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Payment Details
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'refund', 'commission'],
    required: true
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'netbanking', 'upi', 'wallet', 'bank_transfer'],
    required: true
  },
  
  // Bank Details
  bankAccount: String,
  ifsc: String,
  accountHolder: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Gateway
  gateway: { type: String }, // stripe, razorpay, manual
  gatewayResponse: mongoose.Schema.Types.Mixed,
  
  // Metadata
  description: String,
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
