const Order = require('../models/Order');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, paymentMethod = 'COD', deliveryAddress, cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = cartItems.map(item => {
      let customizationsArray = [];
      if (item.customizations && typeof item.customizations === 'object') {
        customizationsArray = Object.entries(item.customizations).map(([name, value]) => ({
          name,
          value: String(value),
          price: 0 
        }));   
      }

      return {
        menuItem: item._id || item.menuItem,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customizations: customizationsArray,
        specialInstructions: item.specialInstructions || ''
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const estimatedDeliveryTime = new Date(Date.now() + (30 + Math.random() * 15) * 60 * 1000);

    // Log incoming payload to help debugging
    console.log('createOrder body:', JSON.stringify(req.body));

    // Build delivery address from request or fallbacks
    let deliveryAddrForModel = {};
    
    // 1. Try to use provided deliveryAddress
    if (deliveryAddress && typeof deliveryAddress === 'object' && Object.keys(deliveryAddress).length > 0) {
      const parts = [];
      if (deliveryAddress.addressLine) parts.push(deliveryAddress.addressLine);
      if (deliveryAddress.addressLine1) parts.push(deliveryAddress.addressLine1);
      if (deliveryAddress.street) parts.push(deliveryAddress.street);
      if (deliveryAddress.city) deliveryAddrForModel.city = deliveryAddress.city;
      if (deliveryAddress.town && !deliveryAddrForModel.city) deliveryAddrForModel.city = deliveryAddress.town;
      if (deliveryAddress.state && !deliveryAddrForModel.city) deliveryAddrForModel.city = deliveryAddress.state;
      if (deliveryAddress.zipCode) parts.push(deliveryAddress.zipCode);
      if (deliveryAddress.country) parts.push(deliveryAddress.country);

      if (parts.length > 0) {
        deliveryAddrForModel.addressLine = parts.join(', ').trim();
      }
      if (deliveryAddress.lat) deliveryAddrForModel.lat = deliveryAddress.lat;
      if (deliveryAddress.lng) deliveryAddrForModel.lng = deliveryAddress.lng;
    }
    
    // 2. If still missing, try to get user's saved address
    if (!deliveryAddrForModel.addressLine && !deliveryAddrForModel.city) {
      try {
        const fullUser = await User.findById(req.user._id).select('addresses address');
        if (fullUser && fullUser.addresses && fullUser.addresses.length > 0) {
          const defaultAddr = fullUser.addresses.find(a => a.isDefault) || fullUser.addresses[0];
          if (defaultAddr) {
            const parts = [];
            if (defaultAddr.street) parts.push(defaultAddr.street);
            if (defaultAddr.city) {
              deliveryAddrForModel.city = defaultAddr.city;
            }
            if (defaultAddr.state) parts.push(defaultAddr.state);
            if (defaultAddr.zipCode) parts.push(defaultAddr.zipCode);
            if (defaultAddr.country) parts.push(defaultAddr.country);
            if (parts.length > 0) {
              deliveryAddrForModel.addressLine = parts.join(', ').trim();
            }
          }
        } else if (fullUser && fullUser.address) {
          // Fallback to old-style address object
          const parts = [];
          if (fullUser.address.street) parts.push(fullUser.address.street);
          if (fullUser.address.city) deliveryAddrForModel.city = fullUser.address.city;
          if (fullUser.address.state) parts.push(fullUser.address.state);
          if (fullUser.address.zipCode) parts.push(fullUser.address.zipCode);
          if (fullUser.address.country) parts.push(fullUser.address.country);
          if (parts.length > 0) {
            deliveryAddrForModel.addressLine = parts.join(', ').trim();
          }
        }
      } catch (e) {
        console.warn('Could not load user saved address:', e.message);
      }
    }

    console.log('Final deliveryAddr:', JSON.stringify(deliveryAddrForModel));

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId || (cartItems[0] && cartItems[0].restaurant),
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryAddress: deliveryAddrForModel,
      estimatedDeliveryTime,
      statusHistory: [{
        status: 'placed',
        note: 'Order placed successfully'
      }],
      notifications: [{
        type: 'status_update',
        message: 'Your order has been placed successfully'
      }]
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: order
    });

  } catch (error) {
    console.error('Order creation error:', error.message, error.stack);
    if (error.name === 'ValidationError') {
      // Return 400 for Mongoose validation errors with details
      const messages = Object.values(error.errors || {}).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: error.message || 'Server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentOrder = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const order = await Order.findOne({
      user: req.user._id,
      restaurant: restaurantId
    })
    .sort({ createdAt: -1 })
    .populate('restaurant', 'name');

    if (!order) {
      return res.status(404).json({ message: 'No order found for this restaurant' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Get current order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getOrderNotifications = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      notifications: order.notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = [
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    order.statusHistory.push({
      status: status,
      note: note || `Order status updated to ${status}`
    });

   
    if (status === 'accepted') {
      order.estimatedDeliveryTime = new Date(Date.now() + 25 * 60 * 1000); // 25 minutes
    } else if (status === 'preparing') {
      order.estimatedDeliveryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    } else if (status === 'out_for_delivery') {
      order.estimatedDeliveryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    } else if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.estimatedDeliveryTime = null;
    }


    let notificationMessage = '';
    switch (status) {
      case 'accepted':
        notificationMessage = 'Your order has been accepted by the restaurant';
        break;
      case 'preparing':
        notificationMessage = 'Your order is being prepared';
        break;
      case 'out_for_delivery':
        notificationMessage = 'Your order is out for delivery';
        break;
      case 'delivered':
        notificationMessage = 'Your order has been delivered successfully';
        break;
      case 'cancelled':
        notificationMessage = 'Your order has been cancelled';
        break;
    }

    if (notificationMessage) {
      order.notifications.push({
        type: 'status_update',
        message: notificationMessage
      });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order: order
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.markNotificationAsRead = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notification = order.notifications.id(req.params.notificationId);
    if (notification) {
      notification.read = true;
      await order.save();
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getUserNotifications = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select('notifications orderStatus')
      .sort({ createdAt: -1 });

    const allNotifications = [];
    orders.forEach(order => {
      order.notifications.forEach(notification => {
        allNotifications.push({
          ...notification.toObject(),
          orderId: order._id,
          orderStatus: order.orderStatus
        });
      });
    });


    allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      notifications: allNotifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
