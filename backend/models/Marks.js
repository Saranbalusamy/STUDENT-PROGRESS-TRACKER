 const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  className: { type: String, required: true },
  subject: { type: String, enum: [
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
    'Computer Application'
  ], required: true },
  examType: { type: String, enum: ['unit1', 'unit2', 'quarterly', 'half_yearly', 'annual'], required: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  totalMarks: { type: Number, default: 100 },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'] },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  remarks: String,
  entryDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Grade calculation
marksSchema.pre('save', function(next) {
  const percentage = (this.marks / this.totalMarks) * 100;
  if (percentage >= 90) this.grade = 'A';
  else if (percentage >= 80) this.grade = 'B';
  else if (percentage >= 70) this.grade = 'C';
  else if (percentage >= 60) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Marks', marksSchema);
