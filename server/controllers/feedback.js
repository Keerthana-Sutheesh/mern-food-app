// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

/**
 * POST /api/feedbacks
 * Submit comprehensive feedback (restaurant + delivery)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const {
      orderId,
      restaurantRating,
      restaurantComment,
      restaurantFeedbackType = 'overall',
      deliveryRating,
      deliveryComment,
      deliveryFeedbackType = 'overall',
      overallRating,
      overallComment,
      images = []
    } = req.body;

    // Validate required fields
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ message: 'Overall rating is required (1-5)' });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      orderStatus: 'delivered'
    }).populate('restaurant');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found or feedback not allowed (must be delivered)'
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ order: orderId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this order' });
    }

    // Validate ratings
    if (restaurantRating && (restaurantRating < 1 || restaurantRating > 5)) {
      return res.status(400).json({ message: 'Restaurant rating must be between 1-5' });
    }
    if (deliveryRating && (deliveryRating < 1 || deliveryRating > 5)) {
      return res.status(400).json({ message: 'Delivery rating must be between 1-5' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      order: orderId,
      restaurant: order.restaurant._id,
      restaurantRating,
      restaurantComment,
      restaurantFeedbackType,
      deliveryRating,
      deliveryComment,
      deliveryFeedbackType,
      overallRating,
      overallComment,
      images,
      status: shouldAutoApprove({ restaurantComment, deliveryComment, overallComment }) ? 'approved' : 'pending'
    });

 
    await updateRestaurantRatings(order.restaurant._id);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: await feedback.populate('user', 'name')
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedback = await Feedback.findOne({ order: orderId })
      .populate('user', 'name')
      .populate('restaurant', 'name')
      .populate('restaurantResponse.respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching order feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRestaurantFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating, type } = req.query;

    const query = {
      restaurant: restaurantId,
      status: 'approved'
    };

    if (rating) {
      query.overallRating = parseInt(rating);
    }

    if (type) {
      query.restaurantFeedbackType = type;
    }

    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name')
      .populate('restaurantResponse.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(query);
    const stats = await Feedback.aggregate([
      { $match: { restaurant: require('mongoose').Types.ObjectId(restaurantId), status: 'approved' } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgOverallRating: { $avg: '$overallRating' },
          avgRestaurantRating: { $avg: '$restaurantRating' },
          avgDeliveryRating: { $avg: '$deliveryRating' },
          ratingDistribution: {
            $push: '$overallRating'
          }
        }
      }
    ]);

    const ratingStats = stats[0] || {
      totalReviews: 0,
      avgOverallRating: 0,
      avgRestaurantRating: 0,
      avgDeliveryRating: 0,
      ratingDistribution: []
    };


    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingStats.ratingDistribution.filter(r => r === rating).length
    }));

    res.status(200).json({
      feedbacks,
      stats: {
        ...ratingStats,
        avgOverallRating: ratingStats.avgOverallRating?.toFixed(1) || 0,
        avgRestaurantRating: ratingStats.avgRestaurantRating?.toFixed(1) || 0,
        avgDeliveryRating: ratingStats.avgDeliveryRating?.toFixed(1) || 0,
        distribution
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToFeedback = async (req, res) => {
  try {
    const { comment } = req.body;
    const feedbackId = req.params.id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Response comment is required' });
    }

    const feedback = await Feedback.findById(feedbackId).populate('restaurant');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    feedback.restaurantResponse = {
      comment: comment.trim(),
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await feedback.save();

    res.status(200).json({
      message: 'Response submitted successfully',
      feedback: await feedback.populate('restaurantResponse.respondedBy', 'name')
    });

  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markHelpful = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.helpful += 1;
    await feedback.save();

    res.status(200).json({ message: 'Marked as helpful' });
  } catch (error) {
    console.error('Error marking feedback as helpful:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reportFeedback = async (req, res) => {
  try {
    const { reason } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.reportedCount += 1;

    if (feedback.reportedCount >= 3) {
      feedback.status = 'flagged';
    }

    await feedback.save();

    res.status(200).json({ message: 'Feedback reported' });
  } catch (error) {
    console.error('Error reporting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingModeration = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ status: 'pending' });

    res.status(200).json({
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending moderation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.moderateFeedback = async (req, res) => {
  try {
    const { status, moderationReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    feedback.moderatedBy = req.user.id;
    feedback.moderationReason = moderationReason;
    feedback.moderatedAt = new Date();

    await feedback.save();

    if (status === 'approved') {
      await updateRestaurantRatings(feedback.restaurant);
    }

    res.status(200).json({
      message: `Feedback ${status}`,
      feedback
    });

  } catch (error) {
    console.error('Error moderating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getFeedbackStats = async (req, res) => {
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
    const avgRating = await Feedback.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$overallRating' } } }
    ]);

    res.status(200).json({
      totalFeedback,
      statusBreakdown: stats,
      averageRating: avgRating[0]?.avg?.toFixed(1) || 0
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function shouldAutoApprove({ restaurantComment, deliveryComment, overallComment }) {
  const comments = [restaurantComment, deliveryComment, overallComment].filter(Boolean);

  const suspiciousWords = ['spam', 'fake', 'test', 'asdf', 'qwerty'];
  const allText = comments.join(' ').toLowerCase();

  return !suspiciousWords.some(word => allText.includes(word));
}


async function updateRestaurantRatings(restaurantId) {
  try {
    const stats = await Feedback.aggregate([
      { $match: { restaurant: restaurantId, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgOverallRating: { $avg: '$overallRating' },
          avgRestaurantRating: { $avg: '$restaurantRating' },
          avgDeliveryRating: { $avg: '$deliveryRating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: stats[0].avgOverallRating.toFixed(1),
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating restaurant ratings:', error);
  }
}
