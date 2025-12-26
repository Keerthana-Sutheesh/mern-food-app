const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'success', 'failed', 'refunded'],
    default: 'created'
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'netbanking', 'wallet', 'upi']
    },
    card: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    },
    upi: {
      id: String
    },
    wallet: {
      name: String
    }
  },
  isSavedMethod: {
    type: Boolean,
    default: false
  },
  savedMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedPaymentMethod'
  },
  transactionId: String,
  receipt: {
    url: String,
    generatedAt: Date
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    razorpayRefundId: String
  }
}, { timestamps: true });

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
