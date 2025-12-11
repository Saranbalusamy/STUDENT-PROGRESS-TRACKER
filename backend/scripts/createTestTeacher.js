const mongoose = require('mongoose');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
require('dotenv').config();

const createTestTeacher = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test teacher data
    const testTeacherId = 'TCH001';
    const testEmail = 'teacher@test.com';
    const testPassword = 'teacher123';
    
    // Check if teacher already exists
    const existingUser = await User.findOne({ 
      userId: testTeacherId, 
      role: 'teacher',
      isActive: true 
    });

    if (existingUser) {
      console.log('⚠️  Teacher already exists:');
      console.log('   Teacher ID:', testTeacherId);
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
      
      const teacherProfile = await Teacher.findOne({ 
        userId: existingUser._id,
        isActive: true 
      });
      
      if (teacherProfile) {
        console.log('   Subject:', teacherProfile.subject);
        console.log('   Assigned Classes:', teacherProfile.assignedClasses);
      }
      
      await mongoose.connection.close();
      return;
    }

    // Create new user account
    const user = new User({
      userId: testTeacherId,
      name: 'Test Teacher',
      email: testEmail,
      password: testPassword,
      role: 'teacher',
      isActive: true
    });
    
    await user.save();
    console.log('✅ User account created');

    // Create teacher profile
    const teacher = new Teacher({
      userId: user._id,
      teacherId: testTeacherId,
      subject: 'Mathematics',
      assignedClasses: ['Class 10A', 'Class 10B'],
      qualification: 'M.Sc Mathematics',
      experience: 5,
      isActive: true
    });
    
    await teacher.save();
    console.log('✅ Teacher profile created');
    
    console.log('\n📋 Test Teacher Credentials:');
    console.log('   Teacher ID:', testTeacherId);
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('   Subject:', teacher.subject);
    console.log('   Assigned Classes:', teacher.assignedClasses.join(', '));
    console.log('\n✅ You can now login with these credentials!');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createTestTeacher();
