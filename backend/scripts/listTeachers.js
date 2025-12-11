const mongoose = require('mongoose');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
require('dotenv').config();

const listTeachers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all teacher users
    const teacherUsers = await User.find({ 
      role: 'teacher',
      isActive: true 
    }).select('userId name email');

    if (teacherUsers.length === 0) {
      console.log('⚠️  No teachers found in the database.');
      console.log('💡 Run "node scripts/createTestTeacher.js" to create a test teacher.\n');
      await mongoose.connection.close();
      return;
    }

    console.log(`📋 Found ${teacherUsers.length} teacher(s):\n`);

    for (const user of teacherUsers) {
      const teacherProfile = await Teacher.findOne({ 
        userId: user._id,
        isActive: true 
      });

      console.log('─────────────────────────────────────');
      console.log('👤 Name:', user.name);
      console.log('🆔 Teacher ID:', user.userId);
      console.log('📧 Email:', user.email);
      
      if (teacherProfile) {
        console.log('📚 Subject:', teacherProfile.subject);
        console.log('🏫 Assigned Classes:', teacherProfile.assignedClasses.join(', ') || 'None');
      } else {
        console.log('⚠️  Teacher profile not found');
      }
      console.log('');
    }

    console.log('─────────────────────────────────────');
    console.log('\n💡 Default password for test accounts is usually "teacher123"');
    console.log('💡 To login, use: Teacher ID + Email + Password\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
listTeachers();
