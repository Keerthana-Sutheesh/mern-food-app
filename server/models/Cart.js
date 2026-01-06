const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      customizations: [{
        name: String,
        value: String,
        price: { type: Number, default: 0 }
      }],
      specialInstructions: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
