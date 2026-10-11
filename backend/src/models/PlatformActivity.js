const mongoose = require('mongoose');

const platformActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'PROFILE_UPDATED',
        'RESOURCE_CREATED',
        'RESOURCE_UPDATED',
        'RESOURCE_VERIFIED',
        'RESOURCE_SEARCHED',
        'REQUEST_SUBMITTED',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'BOOKING_CREATED',
        'BOOKING_COMPLETED',
        'RATING_SUBMITTED',
        'AI_QUERY_PERFORMED'
      ]
    },
    category: {
      type: String,
      default: 'General'
    },
    district: {
      type: String,
      default: ''
    },
    crop: {
      type: String,
      default: ''
    },
    month: {
      type: Number,
      default: () => new Date().getMonth() + 1
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

platformActivitySchema.index({ action: 1, district: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('PlatformActivity', platformActivitySchema);
