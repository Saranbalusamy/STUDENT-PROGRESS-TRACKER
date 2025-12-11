const mongoose = require('mongoose');

const LLMAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  userRole: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  category: {
    type: String,
    required: true
  },
  isHelpful: {
    type: Boolean,
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  metadata: {
    browser: String,
    device: String,
    os: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for common queries
LLMAnalyticsSchema.index({ userId: 1, createdAt: -1 });
LLMAnalyticsSchema.index({ userRole: 1, createdAt: -1 });
LLMAnalyticsSchema.index({ category: 1 });
LLMAnalyticsSchema.index({ createdAt: 1 });

module.exports = mongoose.model('LLMAnalytics', LLMAnalyticsSchema);