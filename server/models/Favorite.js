const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem"
  },
  type: {
    type: String,
    enum: ["restaurant", "menuItem"],
    required: true
  }
}, { timestamps: true });


favoriteSchema.index({ user: 1, restaurant: 1, menuItem: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);