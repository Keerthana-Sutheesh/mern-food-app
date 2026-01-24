const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  role: {
    type: String,
    enum: ["user", "owner", "admin", "delivery"],
    default: "user",
    immutable: true 
  },

  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer_not_to_say"]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "India" }
  },

  addresses: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      label: {
        type: String,
        required: true,
        enum: ["Home", "Office", "Other"]
      },
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: "India"
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },

  preferences: {
    language: { type: String, default: "en" },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" }
  },

  notifications: {
    email: {
      promotions: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      newRestaurants: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    push: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      deliveryStatus: { type: Boolean, default: true }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      security: { type: Boolean, default: true }
    }
  },

  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    favoriteCuisine: String,
    avgOrderValue: { type: Number, default: 0 }
  },

  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },

  deliveryPartner: {
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "van"]
    },
    licenseNumber: String,
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },

  restaurantOwner: {
    businessName: String,
    gstNumber: String,
    fssaiLicense: String,
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    }
  }

}, { timestamps: true });

userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "deliveryPartner.currentLocation": "2dsphere" });


userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});


userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});


userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000
    };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() }
  });
};

module.exports = mongoose.model("User", userSchema);
