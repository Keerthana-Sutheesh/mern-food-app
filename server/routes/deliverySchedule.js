// routes/deliverySchedules.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const {
  createDeliverySchedule,
  getDeliveryScheduleByOrder,
  updateDeliverySchedule,
  getUpcomingDeliveries,
  updateDeliveryStatus,
  assignDeliveryPartner,
  getAvailableTimeSlots
} = require('../controllers/deliverySchedule');

router.post('/', protect, createDeliverySchedule);
router.get('/order/:orderId', protect, getDeliveryScheduleByOrder);
router.put('/:id', protect, updateDeliverySchedule);
router.get(
  '/upcoming',
  protect,
  authorize('admin', 'delivery'),
  getUpcomingDeliveries
);

router.put(
  '/:id/status',
  protect,
  authorize('delivery'),
  updateDeliveryStatus
);

router.put(
  '/:id/assign',
  protect,
  authorize('admin'),
  assignDeliveryPartner
);

router.get('/available-slots', getAvailableTimeSlots);

module.exports = router;
