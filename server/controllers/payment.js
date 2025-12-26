const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const SavedPaymentMethod = require('../models/SavedPaymentMethod');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured' });
    }

    const { orderId, savePaymentMethod, paymentMethodId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const options = {
      amount: order.totalAmount * 100,
      currency: 'INR',
      receipt: `order_rcpt_${order._id}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

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

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, savePaymentMethod } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'success',
        razorpayPaymentId: razorpay_payment_id,
        transactionId: razorpay_payment_id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await Order.findByIdAndUpdate(orderId, { orderStatus: 'confirmed' });

    // // Save payment method if requested
    // if (savePaymentMethod) {
    //   // This would be implemented based on the payment method used
    //   // For now, we'll skip this as it requires additional Razorpay API calls
    // }

    res.status(200).json({
      message: 'Payment verified successfully',
      payment: payment
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
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
      await SavedPaymentMethod.findByIdAndUpdate(savedMethod._id, { isDefault: true });
    }

    res.status(201).json(savedMethod);
  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({ message: 'Failed to save payment method' });
  }
};

exports.deleteSavedPaymentMethod = async (req, res) => {
  try {
    const savedMethod = await SavedPaymentMethod.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!savedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    savedMethod.isActive = false;
    await savedMethod.save();

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

    const savedMethod = await SavedPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!savedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json(savedMethod);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user.id })
      .populate('orderId', 'totalAmount createdAt orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user.id });

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
      paymentId: payment._id,
      orderId: payment.orderId._id,
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


    // const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    //   amount: (amount || payment.amount) * 100 
    // });

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
    res.status(500).json({ message: 'Refund processing failed' });
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
      await SavedPaymentMethod.findByIdAndUpdate(savedMethod._id, { isDefault: true });
    }

    res.status(201).json(savedMethod);
  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({ message: 'Failed to save payment method' });
  }
};

exports.deleteSavedPaymentMethod = async (req, res) => {
  try {
    const savedMethod = await SavedPaymentMethod.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!savedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    savedMethod.isActive = false;
    await savedMethod.save();

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

    const savedMethod = await SavedPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!savedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json(savedMethod);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user.id })
      .populate('orderId', 'totalAmount createdAt orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user.id });

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
      paymentId: payment._id,
      orderId: payment.orderId._id,
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

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: (amount || payment.amount) * 100
    });

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
    res.status(500).json({ message: 'Refund processing failed' });
  }
};
