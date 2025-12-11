const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
require('dotenv').config();

const assignTeachersToClass = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find class 10A
    const class10A = await Class.findOne({ name: 'class 10A', isActive: true });
    if (!class10A) {
      console.log('Class 10A not found');
      return;
    }
    
    // Find teachers T-001 and T-002
    const teachers = await Teacher.find({ 
      teacherId: { $in: ['T-001', 'T-002'] },
      isActive: true 
    });
    
    console.log('Found teachers:', teachers.map(t => ({ id: t.teacherId, subject: t.subject })));
    
    // Assign teachers to class
    for (const teacher of teachers) {
      await Class.findOneAndUpdate(
        { name: 'class 10A', isActive: true },
        { 
          $addToSet: { 
            assignedTeachers: { 
              teacherId: teacher._id, 
              subject: teacher.subject 
            } 
          } 
        }
      );
      
      // Add class to teacher's assigned classes
      await Teacher.findByIdAndUpdate(teacher._id, {
        $addToSet: { assignedClasses: 'class 10A' }
      });
      
      console.log(`Assigned teacher ${teacher.teacherId} (${teacher.subject}) to class 10A`);
    }
    
    console.log('Teachers assigned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

assignTeachersToClass();
