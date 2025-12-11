const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: false },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  isActive: { type: Boolean, default: true },
  // Other fields as needed
}, { timestamps: true });

// Compound index to allow reuse of userId for inactive records
userSchema.index({ userId: 1, isActive: 1 }, { unique: true });

// Password hash middleware on save (if you have that)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// The comparePassword method you asked about
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
module.exports = mongoose.model('User', userSchema);
