const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    taluk: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      required: [true, 'District is required for location matching'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Tamil Nadu'
    },
    landArea: {
      type: Number,
      required: [true, 'Land area is required'],
      min: [0.1, 'Land area must be at least 0.1']
    },
    landUnit: {
      type: String,
      enum: ['acres', 'hectares', 'cents', 'bigha'],
      default: 'acres'
    },
    soilType: {
      type: String,
      enum: ['Alluvial Soil', 'Black Soil', 'Red Soil', 'Laterite Soil', 'Clayey Loam', 'Sandy Loam', 'Saline Soil', 'Other'],
      default: 'Red Soil'
    },
    irrigationType: {
      type: String,
      enum: ['Drip Irrigation', 'Borewell / Well', 'Canal Irrigation', 'Sprinkler', 'Rainfed', 'River / Tank', 'Other'],
      default: 'Borewell / Well'
    },
    cropsCultivated: {
      type: [String],
      default: ['Paddy']
    },
    farmingExperience: {
      type: Number,
      default: 5,
      min: 0
    },
    preferredResources: {
      type: [String],
      default: ['Tractor', 'Rotavator', 'Harvester', 'Sprayer']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [78.1198, 9.9252] // Madurai defaults
      },
      address: {
        type: String,
        default: ''
      }
    },
    profileImage: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED'
    },
    completionPercentage: {
      type: Number,
      default: 20
    }
  },
  {
    timestamps: true
  }
);

farmerProfileSchema.index({ 'location': '2dsphere' });
farmerProfileSchema.index({ district: 1, state: 1 });

farmerProfileSchema.methods.calculateCompletion = function () {
  let score = 0;
  if (this.village) score += 10;
  if (this.taluk) score += 10;
  if (this.district) score += 15;
  if (this.state) score += 10;
  if (this.landArea > 0) score += 15;
  if (this.soilType) score += 10;
  if (this.irrigationType) score += 10;
  if (this.cropsCultivated && this.cropsCultivated.length > 0) score += 10;
  if (this.preferredResources && this.preferredResources.length > 0) score += 10;
  this.completionPercentage = score;
  return score;
};

farmerProfileSchema.pre('save', function (next) {
  this.calculateCompletion();
  next();
});

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
