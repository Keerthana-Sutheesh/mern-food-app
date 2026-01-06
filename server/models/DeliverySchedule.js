const mongoose = require('mongoose');

const deliveryScheduleSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true 
  },
  deliveryType: {
    type: String,
    enum: ['instant', 'scheduled'],
    default: 'instant'
  },
  scheduledDate: {
    type: Date 
  },
  scheduledTime: {
    type: String 
  },
  scheduledAt: {
    type: Date
  },
  timeSlot: {
    type: String, 
    enum: [
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
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryNotes: {
    type: String,
    maxlength: 500
  },
  estimatedDeliveryTime: { 
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

deliveryScheduleSchema.index({ scheduledAt: 1, status: 1 });
deliveryScheduleSchema.index({ deliveryPartner: 1, status: 1 });

module.exports = mongoose.model('DeliverySchedule', deliveryScheduleSchema);
