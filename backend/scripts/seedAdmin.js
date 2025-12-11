 const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        userId: 'admin123',
        name: 'Administrator',
        password: 'admin@2024',
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created: admin123 / admin@2024');
    } else {
      console.log('Admin user already exists');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
