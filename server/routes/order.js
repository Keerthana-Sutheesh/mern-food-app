const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrderNotifications,
  markNotificationAsRead,
  getUserNotifications,
  getCurrentOrder
} = require('../controllers/order');


router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/current/:restaurantId', protect, getCurrentOrder);
router.get('/user/notifications', protect, getUserNotifications);
router.get('/:id', protect, getOrderById);

router.put(
  '/:id/status',
  protect,
  updateOrderStatus
);

router.get('/:id/notifications', protect, getOrderNotifications);

router.put('/:id/notifications/:notificationId/read', protect, markNotificationAsRead);

module.exports = router;
