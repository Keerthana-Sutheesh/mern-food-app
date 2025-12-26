const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
      },
      name: String,
      quantity: Number,
      price: Number,
      customizations: [{
        name: String,
        value: String,
        price: { type: Number, default: 0 }
      }],
      specialInstructions: String
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: [
      'placed',
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'placed'
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  deliveryAddress: {
    addressLine: String,
    city: String,
    lat: Number,
    lng: Number
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'placed',
        'accepted',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['status_update', 'delivery_estimate', 'order_ready']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
