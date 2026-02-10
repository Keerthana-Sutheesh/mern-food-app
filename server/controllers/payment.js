const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const SavedPaymentMethod = require('../models/SavedPaymentMethod');

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    console.log('Creating Razorpay order for user:', req.user.id);

    if (!razorpayInstance) {
      return res.status(500).json({
        message: 'Payment service not configured. Please check Razorpay API credentials.',
        error: 'RAZORPAY_NOT_CONFIGURED'
      });
    }

    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey.includes('your_razorpay') || razorpayKey.includes('xxxxx')) {
      console.error('Invalid Razorpay key ID configured');
      return res.status(500).json({
        message: 'Payment service not properly configured. Please update Razorpay API credentials.',
        error: 'INVALID_RAZORPAY_KEY'
      });
    }

    const { orderId, savePaymentMethod, paymentMethodId } = req.body;
    console.log('Payment request:', { orderId, savePaymentMethod, paymentMethodId });

    const order = await Order.findById(orderId);

    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      console.error('Access denied for order:', orderId);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Order found:', order._id, 'Amount:', order.totalAmount);

    const amount = Math.round(order.totalAmount * 100); // Convert to paise

    const razorpayOrderData = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: req.user.id
      }
    };

    const razorpayOrder = await razorpayInstance.orders.create(razorpayOrderData);
    console.log('Razorpay order created:', razorpayOrder.id);

    const paymentData = {
      user: req.user.id,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      isSavedMethod: !!savePaymentMethod
    };

    if (paymentMethodId) {
      paymentData.savedMethodId = paymentMethodId;
    }

    const payment = await Payment.create(paymentData);
    console.log('Payment record created:', payment._id);

    const responseData = {
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR',
      orderId: orderId,
      userEmail: req.user.email,
      userName: req.user.name
    };

    console.log('Sending Razorpay response:', responseData);

    res.status(200).json(responseData);

  } catch (error) {
    const razorpayError = error?.error || {};
    const errorMessage = razorpayError.description || razorpayError.message || error.message || 'Payment creation failed';
    console.error('Payment creation error:', errorMessage, razorpayError);
    res.status(500).json({ message: 'Payment creation failed', error: errorMessage });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    console.log('Verifying Razorpay payment:', { razorpayOrderId, razorpayPaymentId });

    if (!razorpayPaymentId || !razorpaySignature || !razorpayOrderId) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('Invalid Razorpay signature');
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpayOrderId },
      {
        status: 'success',
        razorpayPaymentId: razorpayPaymentId,
        transactionId: razorpayPaymentId,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await Order.findByIdAndUpdate(orderId, { orderStatus: 'confirmed' });

    res.status(200).json({
      message: 'Payment verified successfully',
      payment: payment
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

exports.getSavedPaymentMethods = async (req, res) => {
  try {
    const savedMethods = await SavedPaymentMethod.find({
      user: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json(savedMethods);
  } catch (error) {
    console.error('Error fetching saved payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.savePaymentMethod = async (req, res) => {
  try {
    const { type, card, upi, netbanking, nickname, setAsDefault } = req.body;

    const savedMethodData = {
      user: req.user.id,
      type,
      nickname: nickname || 'My Payment Method'
    };

    if (type === 'card' && card) {
      savedMethodData.card = card;
    } else if (type === 'upi' && upi) {
      savedMethodData.upi = upi;
    } else if (type === 'netbanking' && netbanking) {
      savedMethodData.netbanking = netbanking;
    }

    const savedMethod = await SavedPaymentMethod.create(savedMethodData);

    if (setAsDefault) {
      await SavedPaymentMethod.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
      savedMethod.isDefault = true;
      await savedMethod.save();
    }

    res.status(201).json(savedMethod);
  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSavedPaymentMethod = async (req, res) => {
  try {
    const method = await SavedPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!method) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    await SavedPaymentMethod.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    const method = await SavedPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!method) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json(method);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('orderId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const receiptData = {
      id: payment._id,
      orderId: payment.orderId?._id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      receiptUrl: payment.receipt?.url
    };

    res.status(200).json(receiptData);
  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id).populate('orderId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ message: 'Can only refund successful payments' });
    }

    if (!razorpayInstance) {
      return res.status(500).json({ message: 'Razorpay client not configured' });
    }

    const refundAmount = amount ? Math.round(amount * 100) : Math.round(payment.amount * 100);

    const refundRequest = {
      amount: refundAmount,
      notes: {
        orderId: payment.orderId._id.toString(),
        reason: reason || 'Customer refund'
      }
    };

    const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, refundRequest);

    await Payment.findByIdAndUpdate(payment._id, {
      status: 'refunded',
      refund: {
        amount: amount || payment.amount,
        reason,
        processedAt: new Date(),
        razorpayRefundId: refund.id
      }
    });

    res.status(200).json({
      message: 'Refund processed successfully',
      refund: refund
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Refund processing failed', error: error.message });
  }
};
