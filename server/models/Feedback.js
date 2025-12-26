const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },


  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  restaurantRating: {
    type: Number,
    min: 1,
    max: 5
  },
  restaurantComment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  restaurantFeedbackType: {
    type: String,
    enum: ['food_quality', 'service', 'ambiance', 'value', 'overall'],
    default: 'overall'
  },


  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryComment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  deliveryFeedbackType: {
    type: String,
    enum: ['speed', 'packaging', 'communication', 'courtesy', 'overall'],
    default: 'overall'
  },

  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  overallComment: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationReason: {
    type: String,
    trim: true
  },
  moderatedAt: {
    type: Date
  },

  restaurantResponse: {
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  },

  isVerifiedPurchase: {
    type: Boolean,
    default: true 
  },
  helpful: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },

  images: [{
    url: String,
    alt: String
  }]

}, { timestamps: true });


feedbackSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
feedbackSchema.index({ order: 1 }, { unique: true });
feedbackSchema.index({ status: 1, createdAt: -1 });


feedbackSchema.virtual('restaurantRatingStars').get(function() {
  return '⭐'.repeat(this.restaurantRating || 0);
});

feedbackSchema.virtual('deliveryRatingStars').get(function() {
  return '⭐'.repeat(this.deliveryRating || 0);
});

module.exports = mongoose.model('Feedback', feedbackSchema);
