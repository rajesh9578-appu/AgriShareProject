const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['farmer_to_owner', 'owner_to_farmer'],
      default: 'farmer_to_owner'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: 1000
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate rating per booking per reviewer
ratingSchema.index({ booking: 1, reviewer: 1 }, { unique: true });
ratingSchema.index({ resource: 1, rating: 1 });
ratingSchema.index({ reviewee: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
