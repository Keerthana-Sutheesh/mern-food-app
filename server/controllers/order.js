const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, paymentMethod, deliveryAddress, cartItems } = req.body;

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

    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryAddress,
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
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
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
      filter.user = req.user.id;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getOrderNotifications = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const orders = await Order.find({ user: req.user.id })
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
