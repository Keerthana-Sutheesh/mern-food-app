const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    image: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    deliveryTime: {
      type: String,
      default: "30-45 mins"
    },
    deliveryFee: {
      type: Number,
      default: 40
    },
    hoursOfOperation: {
      type: String,
      default: "9:00 AM - 10:00 PM"
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$"
    },
    services: {
      type: [String],
      default: []
    },
    menuHighlights: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Restaurant", restaurantSchema);
