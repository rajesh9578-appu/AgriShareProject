const mongoose = require('mongoose');

const savedResourceSchema = new mongoose.Schema(
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
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

savedResourceSchema.index({ farmer: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('SavedResource', savedResourceSchema);
