const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceRequest',
      default: null
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1
    },
    location: {
      address: { type: String, default: '' },
      village: { type: String, default: '' },
      district: { type: String, required: true },
      state: { type: String, default: 'Tamil Nadu' }
    },
    pricing: {
      pricePerUnit: { type: Number, required: true },
      unit: { type: String, default: 'per_day' },
      totalAmount: { type: Number, required: true },
      deposit: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED'
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    farmerRatingGiven: {
      type: Boolean,
      default: false
    },
    ownerRatingGiven: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ resource: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ farmer: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
