 const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: String, required: true },
  subject: { 
    type: String, 
    enum: [
      'Tamil',
      'English',
      'Mathematics',
      'Science',
      'Social Science',
      'Computer Science',
      'Botany',
      'Zoology',
      'Commerce',
      'Economics',
      'Accountancy',
      'Business Mathematics',
      'Computer Application',
      'Physics',
      'Chemistry',
      'Biology'
    ], 
    required: true 
  },
  assignedClasses: [String],
  qualification: String,
  experience: Number,
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to allow reuse of teacherId for inactive records
teacherSchema.index({ teacherId: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
