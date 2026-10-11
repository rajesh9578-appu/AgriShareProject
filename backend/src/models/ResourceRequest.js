const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema(
  {
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
    requiredStartDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    requiredEndDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1
    },
    purpose: {
      type: String,
      required: [true, 'Purpose / Farming activity is required'],
      trim: true
    },
    crop: {
      type: String,
      default: 'General Farming'
    },
    landArea: {
      value: { type: Number, default: 1 },
      unit: { type: String, default: 'acres' }
    },
    location: {
      address: { type: String, default: '' },
      village: { type: String, default: '' },
      district: { type: String, required: true },
      state: { type: String, default: 'Tamil Nadu' }
    },
    additionalMessage: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    respondedAt: {
      type: Date,
      default: null
    },
    estimatedCost: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

resourceRequestSchema.index({ farmer: 1, status: 1 });
resourceRequestSchema.index({ owner: 1, status: 1 });
resourceRequestSchema.index({ resource: 1, requiredStartDate: 1, requiredEndDate: 1 });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
