const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const normalizeAddressFields = (data) => ({
  label: typeof data.label === 'string' ? data.label.trim() : data.label,
  street: typeof data.street === 'string' ? data.street.trim() : data.street,
  city: typeof data.city === 'string' ? data.city.trim() : data.city,
  state: typeof data.state === 'string' ? data.state.trim() : data.state,
  zipCode: typeof data.zipCode === 'string' ? data.zipCode.trim() : data.zipCode,
  country: typeof data.country === 'string' ? data.country.trim() : data.country,
  isDefault: parseBoolean(data.isDefault)
});

const validateAddress = (data, requireAll = false) => {
  const errors = [];
  const allowedLabels = ['Home', 'Office', 'Other'];

  const checkRequired = (value) => value !== undefined && value !== null && value !== '';

  const checkString = (field, value, min, max) => {
    if (typeof value !== 'string') {
      errors.push(`${field} must be a string`);
      return;
    }
    if (value.length < min) {
      errors.push(`${field} must be at least ${min} characters`);
    }
    if (value.length > max) {
      errors.push(`${field} must be under ${max} characters`);
    }
  };

  if (requireAll || checkRequired(data.label)) {
    if (!allowedLabels.includes(data.label)) {
      errors.push('Label must be Home, Office, or Other');
    }
  } else if (requireAll) {
    errors.push('Label is required');
  }

  if (requireAll || checkRequired(data.street)) {
    checkString('Street', data.street, 5, 120);
  } else if (requireAll) {
    errors.push('Street is required');
  }

  if (requireAll || checkRequired(data.city)) {
    checkString('City', data.city, 2, 60);
  } else if (requireAll) {
    errors.push('City is required');
  }

  if (requireAll || checkRequired(data.state)) {
    checkString('State', data.state, 2, 60);
  } else if (requireAll) {
    errors.push('State is required');
  }

  if (requireAll || checkRequired(data.zipCode)) {
    if (typeof data.zipCode !== 'string') {
      errors.push('ZIP code must be a string');
    } else if (!/^\d{5,6}$/.test(data.zipCode)) {
      errors.push('ZIP code must be 5-6 digits');
    }
  } else if (requireAll) {
    errors.push('ZIP code is required');
  }

  if (requireAll || checkRequired(data.country)) {
    checkString('Country', data.country, 2, 60);
  } else if (requireAll) {
    errors.push('Country is required');
  }

  if (data.isDefault === null) {
    errors.push('isDefault must be true or false');
  }

  return errors;
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADDRESS MANAGEMENT - ADD ADDRESS
exports.addAddress = async (req, res) => {
  try {
    const normalized = normalizeAddressFields(req.body);
    const errors = validateAddress(normalized, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid address details', errors });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First address is always default, or if explicitly marked as default
    const shouldBeDefault = user.addresses.length === 0 || normalized.isDefault;

    // If marking as default, unset default from all others
    if (shouldBeDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      label: normalized.label,
      street: normalized.street,
      city: normalized.city,
      state: normalized.state,
      zipCode: normalized.zipCode,
      country: normalized.country || 'India',
      isDefault: shouldBeDefault,
      createdAt: new Date()
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      address: newAddress
    });

  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADDRESS MANAGEMENT - GET ALL ADDRESSES
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      addresses: user.addresses || []
    });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADDRESS MANAGEMENT - UPDATE ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const normalized = normalizeAddressFields(req.body);
    const errors = validateAddress(normalized, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid address details', errors });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const hasUpdates = ['label', 'street', 'city', 'state', 'zipCode', 'country'].some(
      (field) => normalized[field] !== undefined
    ) || normalized.isDefault !== undefined;

    if (!hasUpdates) {
      return res.status(400).json({ message: 'No valid address fields provided' });
    }

    if (normalized.label !== undefined) address.label = normalized.label;
    if (normalized.street !== undefined) address.street = normalized.street;
    if (normalized.city !== undefined) address.city = normalized.city;
    if (normalized.state !== undefined) address.state = normalized.state;
    if (normalized.zipCode !== undefined) address.zipCode = normalized.zipCode;
    if (normalized.country !== undefined) address.country = normalized.country;

    // Handle default address
    if (normalized.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();

    res.status(200).json({
      message: 'Address updated successfully',
      address
    });

  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADDRESS MANAGEMENT - DELETE ADDRESS
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first remaining as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADDRESS MANAGEMENT - SET DEFAULT ADDRESS
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      message: 'Default address updated',
      address
    });

  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      preferences,
      avatar
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (preferences) {
      updateData.preferences = {
        language: preferences.language || 'en',
        currency: preferences.currency || 'INR',
        timezone: preferences.timezone || 'Asia/Kolkata'
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const { email, push, sms } = req.body;

    const updateData = {};

    if (email) {
      updateData['notifications.email'] = {
        promotions: email.promotions ?? true,
        orderUpdates: email.orderUpdates ?? true,
        newRestaurants: email.newRestaurants ?? true,
        security: email.security ?? true,
        newsletter: email.newsletter ?? false
      };
    }

    if (push) {
      updateData['notifications.push'] = {
        orderUpdates: push.orderUpdates ?? true,
        promotions: push.promotions ?? true,
        deliveryStatus: push.deliveryStatus ?? true
      };
    }

    if (sms) {
      updateData['notifications.sms'] = {
        orderUpdates: sms.orderUpdates ?? false,
        security: sms.security ?? true
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Notification preferences updated',
      notifications: user.notifications
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name image rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        const deliverySchedule = await require('../models/DeliverySchedule')
          .findOne({ order: order._id })
          .select('deliveryType scheduledAt timeSlot status estimatedDeliveryTime actualDeliveryTime')
          .lean();

        return {
          ...order,
          deliverySchedule
        };
      })
    );

    res.status(200).json({
      orders: ordersWithDelivery,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    })
      .populate('restaurant', 'name image rating address phone')
      .populate('items.menuItem', 'name price image')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const deliverySchedule = await require('../models/DeliverySchedule')
      .findOne({ order: orderId })
      .populate('deliveryPartner', 'name phone deliveryPartner.rating')
      .lean();

    const feedback = await require('../models/Feedback')
      .findOne({ order: orderId })
      .lean();

    res.status(200).json({
      order,
      deliverySchedule,
      feedback
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log('Password reset token:', resetToken);

    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log('Email verification token:', verificationToken);

    res.status(200).json({
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isVerified: true,
        emailVerifiedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orderStats = await Order.aggregate([
      { $match: { user: user._id, orderStatus: 'delivered' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0
    };

    user.stats = {
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      avgOrderValue: stats.avgOrderValue
    };
    await user.save();

    res.status(200).json({
      stats: user.stats,
      accountAge: user.accountAge,
      lastLogin: user.lastLoginAt
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};