const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student', 'User'] // Allowing different types of senders
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student', 'User'] // Allowing different types of recipients
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster querying
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Pre-save hook to ensure valid ObjectIds
messageSchema.pre('save', function(next) {
  try {
    // Ensure sender is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(this.sender)) {
      throw new Error('Invalid sender ID');
    }
    
    // Ensure recipient is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(this.recipient)) {
      throw new Error('Invalid recipient ID');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;