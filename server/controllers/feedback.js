const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  try {
    const {
      orderId,
      restaurantId,
      overallRating,
      overallComment,
      restaurantRating,
      deliveryRating
    } = req.body;

    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.restaurant.toString() !== restaurantId) {
      return res.status(400).json({ message: 'Order does not belong to this restaurant' });
    }
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ message: 'Cannot submit feedback for cancelled orders' });
    }

    const existingFeedback = await Feedback.findOne({ order: orderId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this order' });
    }

    const feedback = await Feedback.create({
      order: orderId,
      restaurant: restaurantId,
      user: req.user._id,
      overallRating,
      overallComment,
      restaurantRating,
      deliveryRating,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ message: error.message });
  }
};


const getOrderFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      order: req.params.orderId
    }).populate('user', 'name');

    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getRestaurantFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const feedbacks = await Feedback.find({
      restaurant: new mongoose.Types.ObjectId(restaurantId)
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = feedbacks.length;
    const avgOverallRating =
      totalReviews === 0
        ? 0
        : (
            feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
            totalReviews
          ).toFixed(1);

    res.json({
      feedbacks,
      stats: {
        totalReviews,
        avgOverallRating
      }
    });
  } catch (err) {
    console.error('Get restaurant feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const respondToFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate({ path: 'restaurant', populate: { path: 'owner', select: '_id name email' } });

    console.log('RespondToFeedback: user=', req.user._id.toString());
    console.log('RespondToFeedback: feedback=', feedback ? feedback._id.toString() : null);
    console.log('RespondToFeedback: restaurant=', feedback && feedback.restaurant ? feedback.restaurant._id.toString() : null);
    console.log('RespondToFeedback: restaurant.owner=', feedback && feedback.restaurant && feedback.restaurant.owner ? feedback.restaurant.owner._id.toString() : null);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (!feedback.restaurant) {
      return res.status(400).json({ message: 'Feedback does not have associated restaurant' });
    }

    const ownerId = feedback.restaurant.owner && feedback.restaurant.owner._id ? feedback.restaurant.owner._id.toString() : feedback.restaurant.owner ? feedback.restaurant.owner.toString() : null;

    if (!ownerId) {
      return res.status(400).json({ message: 'Restaurant owner not found' });
    }

    if (ownerId !== req.user._id.toString()) {
      console.error('Owner mismatch:', { ownerId, userId: req.user._id.toString() });
      return res.status(403).json({ message: 'Not authorized to respond to this feedback' });
    }

    feedback.restaurantResponse = {
      comment: req.body.comment,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    await feedback.save();
    res.json({ message: 'Response added' });
  } catch (err) {
    console.error('Respond to feedback error:', err);
    res.status(500).json({ message: 'Failed to respond' });
  }
};

const markHelpful = async (req, res) => {
  await Feedback.findByIdAndUpdate(req.params.id, {
    $inc: { helpful: 1 }
  });
  res.json({ message: 'Marked helpful' });
};

const reportFeedback = async (req, res) => {
  await Feedback.findByIdAndUpdate(req.params.id, {
    reported: true,
    reportReason: req.body.reason
  });
  res.json({ message: 'Feedback reported' });
};

const getPendingModeration = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ status: 'pending' })
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (err) {
    console.error('Get pending moderation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const moderateFeedback = async (req, res) => {
  try {
    const { status, moderationReason } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatedBy: req.user._id,
        moderationReason,
        moderatedAt: new Date()
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback moderated', feedback });
  } catch (err) {
    console.error('Moderate feedback error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$overallRating' } } }
    ]);

    res.json({
      totalFeedback,
      statusBreakdown: stats,
      averageRating: averageRating[0]?.avg?.toFixed(1) || 0
    });
  } catch (err) {
    console.error('Get feedback stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitFeedback,
  getOrderFeedback,
  getRestaurantFeedback,
  respondToFeedback,
  markHelpful,
  reportFeedback,
  getPendingModeration,
  moderateFeedback,
  getFeedbackStats
};
