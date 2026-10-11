const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Cereals', 'Pulses', 'Oilseeds', 'Commercial / Cash', 'Vegetables', 'Fruits', 'Spices', 'Horticulture'],
      default: 'Cereals'
    },
    seasons: {
      type: [String],
      default: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)']
    },
    soilTypes: {
      type: [String],
      default: ['Alluvial Soil', 'Clayey Loam']
    },
    stages: [
      {
        stageName: String,
        description: String,
        durationDays: Number,
        recommendedEquipment: [String]
      }
    ],
    commonEquipmentNeeded: {
      type: [String],
      default: ['Tractor', 'Rotavator', 'Seed Drill', 'Sprayer', 'Harvester']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Crop', cropSchema);
