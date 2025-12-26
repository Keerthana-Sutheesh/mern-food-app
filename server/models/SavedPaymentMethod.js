// models/SavedPaymentMethod.js
const mongoose = require('mongoose');

const savedPaymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['card', 'upi', 'netbanking'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // Card details
  card: {
    token: String, // Razorpay token for saved cards
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    issuer: String,
    international: Boolean,
    emi: Boolean
  },
  // UPI details
  upi: {
    id: String,
    handle: String
  },
  // Net Banking details
  netbanking: {
    bankCode: String,
    bankName: String
  },
  nickname: String, // User-friendly name
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

savedPaymentMethodSchema.index({ user: 1, isDefault: 1 }, {
  unique: true,
  partialFilterExpression: { isDefault: true }
});

module.exports = mongoose.model('SavedPaymentMethod', savedPaymentMethodSchema);