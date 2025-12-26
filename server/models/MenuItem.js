const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  category: {
    type: String,
    required: true,
    enum: ["appetizer", "main", "dessert", "beverage", "side"]
  },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 15, min: 1 }, 
  spicyLevel: {
    type: String,
    enum: ["mild", "medium", "hot", "extra-hot"],
    default: "mild"
  },
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 } 
  },
  customizationOptions: [{
    name: { type: String, required: true }, 
    type: { type: String, enum: ["boolean", "select", "text"], default: "boolean" },
    options: [{ type: String }], 
    price: { type: Number, default: 0 }
  }],
  allergens: [{ type: String }]
}, { timestamps: true });


module.exports = mongoose.model('MenuItem', menuItemSchema);
