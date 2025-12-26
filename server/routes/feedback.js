const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const {
  submitFeedback,
  getOrderFeedback,
  getRestaurantFeedback,
  respondToFeedback,
  markHelpful,
  reportFeedback,
  getPendingModeration,
  moderateFeedback,
  getFeedbackStats
} = require('../controllers/feedback');


router.post('/', protect, submitFeedback);
router.get('/order/:orderId', protect, getOrderFeedback);
router.get('/restaurant/:restaurantId', getRestaurantFeedback);
router.put('/:id/response', protect, respondToFeedback);
router.put('/:id/helpful', protect, markHelpful);
router.put('/:id/report', protect, reportFeedback);
router.get('/moderation/pending', protect, authorize('admin'), getPendingModeration);
router.put('/:id/moderate', protect, authorize('admin'), moderateFeedback);
router.get('/stats', protect, authorize('admin'), getFeedbackStats);

module.exports = router;
