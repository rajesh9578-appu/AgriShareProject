const mongoose = require('mongoose');

const resourceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'Tractor'
    },
    typicalOperations: {
      type: [String],
      default: []
    },
    suggestedUnits: {
      type: [String],
      default: ['per_hour', 'per_day', 'per_acre']
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

module.exports = mongoose.model('ResourceCategory', resourceCategorySchema);
