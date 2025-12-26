// routes/payments.js
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


router.post('/create-order', protect, createRazorpayOrder);

router.post('/verify', protect, verifyPayment);
router.get('/saved-methods', protect, getSavedPaymentMethods);
router.post('/saved-methods', protect, savePaymentMethod);
router.delete('/saved-methods/:id', protect, deleteSavedPaymentMethod);
router.put('/saved-methods/:id/default', protect, setDefaultPaymentMethod);
router.get('/history', protect, getPaymentHistory);
router.get('/:id/receipt', protect, getPaymentReceipt);

router.post('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
