const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const {
  createRazorpayOrder,
  verifyPayment,
  getSavedPaymentMethods,
  savePaymentMethod,
  deleteSavedPaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  getPaymentReceipt,
  processRefund
} = require('../controllers/payment');


router.post('/create-order', protect, authorize('user'), createRazorpayOrder);

router.post('/verify', protect, authorize('user'), verifyPayment);
router.get('/saved-methods', protect, authorize('user'), getSavedPaymentMethods);
router.post('/saved-methods', protect, authorize('user'), savePaymentMethod);
router.delete('/saved-methods/:id', protect, authorize('user'), deleteSavedPaymentMethod);
router.put('/saved-methods/:id/default', protect, authorize('user'), setDefaultPaymentMethod);
router.get('/history', protect, authorize('user'), getPaymentHistory);
router.get('/:id/receipt', protect, authorize('user'), getPaymentReceipt);

router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
