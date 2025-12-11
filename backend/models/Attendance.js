 const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    rollNo: String,
    status: { type: String, enum: ['present', 'absent', 'late'], required: true }
  }],
  totalStudents: Number,
  presentCount: Number,
  absentCount: Number
}, { timestamps: true });

attendanceSchema.index({ date: 1, className: 1, subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
