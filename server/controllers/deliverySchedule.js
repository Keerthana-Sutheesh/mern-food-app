const DeliverySchedule = require('../models/DeliverySchedule');
const Order = require('../models/Order');

exports.createDeliverySchedule = async (req, res) => {
  try {
    const { orderId, deliveryType, scheduledDate, scheduledTime, timeSlot, deliveryNotes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (deliveryType === 'scheduled') {
      if (!scheduledDate || !timeSlot) {
        return res.status(400).json({
          message: 'Scheduled date and time slot are required for scheduled delivery'
        });
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '12:00:00'}`);
      if (scheduledDateTime <= new Date()) {
        return res.status(400).json({
          message: 'Scheduled delivery time must be in the future'
        });
      }
    }

    const existingSchedule = await DeliverySchedule.findOne({ order: orderId });
    if (existingSchedule) {
      return res.status(400).json({ message: 'Delivery schedule already exists for this order' });
    }

    const scheduleData = {
      order: orderId,
      deliveryType,
      deliveryNotes
    };

    if (deliveryType === 'scheduled') {
      scheduleData.scheduledDate = new Date(scheduledDate);
      scheduleData.scheduledTime = scheduledTime;
      scheduleData.timeSlot = timeSlot;
      scheduleData.scheduledAt = new Date(`${scheduledDate}T${scheduledTime || '12:00:00'}`);
      scheduleData.status = 'confirmed'; 
    } else {
      scheduleData.status = 'pending'; 
    }

    const schedule = await DeliverySchedule.create(scheduleData);

    res.status(201).json({
      message: 'Delivery schedule created successfully',
      schedule
    });

  } catch (error) {
    console.error('Error creating delivery schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDeliveryScheduleByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const schedule = await DeliverySchedule.findOne({ order: orderId })
      .populate('order', 'orderStatus totalAmount')
      .populate('deliveryPartner', 'name email');

    if (!schedule) {
      return res.status(404).json({ message: 'Delivery schedule not found' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching delivery schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDeliverySchedule = async (req, res) => {
  try {
    const { deliveryType, scheduledDate, scheduledTime, timeSlot, deliveryNotes } = req.body;

    const schedule = await DeliverySchedule.findById(req.params.id).populate('order');
    if (!schedule) {
      return res.status(404).json({ message: 'Delivery schedule not found' });
    }

    if (schedule.order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }


    if (!['pending', 'confirmed'].includes(schedule.status)) {
      return res.status(400).json({ message: 'Cannot update delivery schedule at this stage' });
    }

    const updateData = { deliveryNotes };

    if (deliveryType === 'scheduled') {
      if (!scheduledDate || !timeSlot) {
        return res.status(400).json({
          message: 'Scheduled date and time slot are required'
        });
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '12:00:00'}`);
      if (scheduledDateTime <= new Date()) {
        return res.status(400).json({
          message: 'Scheduled delivery time must be in the future'
        });
      }

      updateData.deliveryType = deliveryType;
      updateData.scheduledDate = new Date(scheduledDate);
      updateData.scheduledTime = scheduledTime;
      updateData.timeSlot = timeSlot;
      updateData.scheduledAt = scheduledDateTime;
    }

    const updatedSchedule = await DeliverySchedule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: 'Delivery schedule updated successfully',
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('Error updating delivery schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpcomingDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      scheduledAt: { $gte: new Date() }
    };

    if (status) {
      query.status = status;
    }

    const schedules = await DeliverySchedule.find(query)
      .populate('order', 'orderStatus totalAmount deliveryAddress')
      .populate('deliveryPartner', 'name email')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await DeliverySchedule.countDocuments(query);

    res.status(200).json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming deliveries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const schedule = await DeliverySchedule.findById(req.params.id).populate('order');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const updateData = { status };
    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    const updatedSchedule = await DeliverySchedule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('order deliveryPartner');

    res.status(200).json({
      message: 'Delivery status updated successfully',
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    const schedule = await DeliverySchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const updatedSchedule = await DeliverySchedule.findByIdAndUpdate(
      req.params.id,
      {
        deliveryPartner: deliveryPartnerId,
        status: 'assigned'
      },
      { new: true }
    ).populate('deliveryPartner', 'name email');

    res.status(200).json({
      message: 'Delivery partner assigned successfully',
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('Error assigning delivery partner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

  
    const existingSchedules = await DeliverySchedule.find({
      scheduledAt: {
        $gte: targetDate,
        $lt: nextDay
      },
      status: { $in: ['confirmed', 'assigned', 'picked_up', 'out_for_delivery'] }
    });


    const slotCounts = {};
    existingSchedules.forEach(schedule => {
      if (schedule.timeSlot) {
        slotCounts[schedule.timeSlot] = (slotCounts[schedule.timeSlot] || 0) + 1;
      }
    });

  
    const allSlots = [
      '9:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 1:00 PM',
      '1:00 PM - 2:00 PM',
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM',
      '4:00 PM - 5:00 PM',
      '5:00 PM - 6:00 PM',
      '6:00 PM - 7:00 PM',
      '7:00 PM - 8:00 PM',
      '8:00 PM - 9:00 PM'
    ];


    const availableSlots = allSlots.map(slot => ({
      slot,
      available: (slotCounts[slot] || 0) < 5
    }));

    res.status(200).json({ availableSlots });

  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
