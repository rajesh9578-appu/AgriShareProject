const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      default: 'Agricultural Consultation'
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        matchedResources: [
          {
            resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
            name: String,
            category: String,
            price: Number,
            unit: String,
            location: String,
            matchReason: String,
            verified: Boolean
          }
        ],
        suggestedActions: [
          {
            label: String,
            action: String,
            query: String
          }
        ],
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    contextSnapshot: {
      crop: String,
      landArea: Number,
      soilType: String,
      district: String
    }
  },
  {
    timestamps: true
  }
);

aiConversationSchema.index({ farmer: 1, updatedAt: -1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
