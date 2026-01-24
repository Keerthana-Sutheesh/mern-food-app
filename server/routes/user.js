const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.put('/notifications', userController.updateNotifications);
router.get('/orders', userController.getOrderHistory);
router.get('/orders/:orderId', userController.getOrderDetails);

// Address Management Routes
router.post('/addresses', userController.addAddress);
router.get('/addresses', userController.getAddresses);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);
router.put('/addresses/:addressId/default', userController.setDefaultAddress);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.post('/verify-email', userController.sendEmailVerification);
router.post('/verify-email/:token', userController.verifyEmail);
router.delete('/account', userController.deleteAccount);

router.get('/stats', userController.getUserStats);

module.exports = router;