const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [78.1198, 9.9252]
      },
      address: { type: String, default: '' },
      village: { type: String, default: '' },
      taluk: { type: String, default: '' },
      district: { type: String, required: true },
      state: { type: String, default: 'Tamil Nadu' }
    },
    availability: {
      isAvailable: {
        type: Boolean,
        default: true
      },
      availableDates: [
        {
          from: { type: Date, required: true },
          to: { type: Date, required: true }
        }
      ],
      availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      noticePeriodHours: {
        type: Number,
        default: 12
      },
      notes: {
        type: String,
        default: ''
      }
    },
    pricing: {
      price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
      },
      unit: {
        type: String,
        enum: ['per_hour', 'per_day', 'per_acre', 'per_trip', 'fixed', 'free_sharing'],
        default: 'per_day'
      },
      deposit: {
        type: Number,
        default: 0
      },
      isNegotiable: {
        type: Boolean,
        default: false
      }
    },
    photos: {
      type: [String],
      default: []
    },
    suitableCrops: {
      type: [String],
      default: ['All Crops']
    },
    suitableLandSize: {
      min: { type: Number, default: 0.5 },
      max: { type: Number, default: 100 },
      unit: { type: String, default: 'acres' }
    },
    usageType: {
      type: String,
      enum: ['rental', 'sharing', 'service', 'equipment_with_operator'],
      default: 'rental'
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair'],
      default: 'good'
    },
    specs: {
      brand: { type: String, default: '' },
      modelYear: { type: Number, default: null },
      horsepower: { type: String, default: '' },
      fuelType: { type: String, default: 'Diesel' },
      capacity: { type: String, default: '' },
      withOperator: { type: Boolean, default: false }
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'CORRECTION_REQUIRED'],
      default: 'VERIFIED' // Default verified for initial seed / smooth testing or pending based on admin rules
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ratingSummary: {
      average: { type: Number, default: 4.8, min: 0, max: 5 },
      count: { type: Number, default: 1 }
    },
    totalBookingsCount: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ 'location': '2dsphere' });
resourceSchema.index({ 'location.district': 1, category: 1, 'availability.isAvailable': 1 });
resourceSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
