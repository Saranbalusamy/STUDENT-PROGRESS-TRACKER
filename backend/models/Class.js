 const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  strength: { type: Number, default: 0 },
  assignedTeachers: [{
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    subject: String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
