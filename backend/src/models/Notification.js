const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'OTP',
        'REQUEST_RECEIVED',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'BOOKING_CONFIRMED',
        'BOOKING_REMINDER',
        'BOOKING_COMPLETED',
        'RESOURCE_VERIFIED',
        'RESOURCE_REJECTED',
        'AI_RECOMMENDATION',
        'NEW_REVIEW',
        'SYSTEM'
      ],
      default: 'SYSTEM'
    },
    data: {
      resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
      requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceRequest', default: null },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
      actionUrl: { type: String, default: '' },
      meta: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
