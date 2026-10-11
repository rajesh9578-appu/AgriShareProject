const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    queryType: {
      type: String,
      enum: ['PROFILE_BASED', 'REQUIREMENT_ANALYZER', 'SMART_MATCHING', 'SEASONAL_DEMAND'],
      default: 'PROFILE_BASED'
    },
    inputParams: {
      crop: String,
      landSize: Number,
      farmingStage: String,
      district: String,
      season: String,
      customQuery: String
    },
    recommendedResources: [
      {
        resource: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Resource',
          required: true
        },
        matchScore: {
          type: Number,
          default: 90
        },
        matchReason: {
          type: String,
          required: true
        },
        suitabilityBadges: [String],
        estimatedDistanceKm: Number
      }
    ],
    suggestedCategories: [String],
    agronomicAdvice: String,
    seasonalTrends: String,
    confidenceScore: {
      type: Number,
      default: 0.95
    }
  },
  {
    timestamps: true
  }
);

aiRecommendationSchema.index({ farmer: 1, createdAt: -1 });

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
