 const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Timetable = require('../models/Timetable');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Admin login handler
const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ success: false, message: 'adminId and password are required' });
    }

    const admin = await User.findOne({ userId: adminId, role: 'admin' });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        userId: admin.userId,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });
    res.json({ success: true, stats: { totalStudents, totalTeachers, totalClasses } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Class Management
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate({
        path: 'assignedTeachers.teacherId',
        select: 'teacherId subject',
        model: 'Teacher'
      })
      .lean();
    
    // Get all students at once, grouped by class
    const allStudents = await Student.find({ isActive: true })
      .populate('userId', 'name email')
      .lean();
    
    // Group students by class name
    const studentsByClass = allStudents.reduce((acc, student) => {
      if (!acc[student.className]) {
        acc[student.className] = [];
      }
      acc[student.className].push(student);
      return acc;
    }, {});
    
    // Map classes with their students
    const classesWithCounts = classes.map(cls => ({
      ...cls,
      strength: studentsByClass[cls.name]?.length || 0,
      students: studentsByClass[cls.name] || [],
      assignedTeachers: cls.assignedTeachers || []
    }));
    
    res.json({ success: true, classes: classesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Class name is required' });
    
    const newClass = new Class({ name, isActive: true });
    await newClass.save();
    res.json({ success: true, class: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Class name is required' });
    
    const updatedClass = await Class.findByIdAndUpdate(
      id, 
      { name }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedClass) return res.status(404).json({ success: false, message: 'Class not found' });
    
    res.json({ success: true, class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await Class.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Management
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).populate('userId', 'name email');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, rollNo, password, className } = req.body;
    if (!name || !rollNo || !password || !className) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNo, isActive: true });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    // Create user account
    const user = new User({
      userId: rollNo,
      name,
      password,
      role: 'student'
    });
    await user.save();

    // Create student record
    const student = new Student({
      userId: user._id,
      rollNo,
      className,
      isActive: true
    });
    await student.save();

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNo, className } = req.body;
    
    if (!name || !rollNo || !className) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const student = await Student.findById(id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update student record
    student.rollNo = rollNo;
    student.className = className;
    await student.save();

    // Update user record
    student.userId.name = name;
    student.userId.userId = rollNo;
    await student.userId.save();

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Soft delete student
    student.isActive = false;
    await student.save();

    // Soft delete user
    student.userId.isActive = false;
    await student.userId.save();

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher Management
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).populate('userId', 'name email');
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { name, teacherId, email, password, subject, assignedClasses } = req.body;
    
    // Validate all required fields
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!teacherId?.trim()) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    // Clean up input data
    const cleanTeacherId = teacherId.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check only for duplicate teacher ID
    const existingTeacher = await Teacher.findOne({ teacherId, isActive: true });

    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher ID already in use' });
    }

    // Create new user account
    const user = new User({
      userId: cleanTeacherId,
      name: cleanName,
      email: cleanEmail,
      password,
      role: 'teacher',
      isActive: true
    });
    
    try {
      await user.save();
      console.log('User created:', user._id);
    } catch (dbError) {
      console.error('Database error creating user:', dbError);
      if (dbError.code === 11000 && dbError.keyPattern?.userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Teacher ID already exists. Please try with a different Teacher ID.' 
        });
      }
      throw dbError;
    }

    // Create teacher record
    const teacher = new Teacher({
      userId: user._id,
      teacherId,
      subject,
      assignedClasses: assignedClasses || [],
      isActive: true
    });
    await teacher.save();
    console.log('Teacher created:', teacher._id);

    // Update classes with assigned teacher
    if (assignedClasses && assignedClasses.length > 0) {
      await Promise.all(assignedClasses.map(className => 
        Class.findOneAndUpdate(
          { name: className, isActive: true },
          { 
            $addToSet: { 
              assignedTeachers: { 
                teacherId: teacher._id, 
                subject: subject 
              } 
            } 
          }
        )
      ));
    }

    res.json({ success: true, teacher });
  } catch (error) {
    console.error('Teacher creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacherId, email, subject, assignedClasses } = req.body;
    
    if (!name || !teacherId || !email || !subject) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const teacher = await Teacher.findById(id).populate('userId');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Remove teacher from old classes
    if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      for (const className of teacher.assignedClasses) {
        await Class.findOneAndUpdate(
          { name: className, isActive: true },
          { $pull: { assignedTeachers: { teacherId: teacher._id } } }
        );
      }
    }

    // Update teacher record
    teacher.teacherId = teacherId;
    teacher.subject = subject;
    teacher.assignedClasses = assignedClasses || [];
    await teacher.save();

    // Update user record
    teacher.userId.name = name;
    teacher.userId.email = email;
    teacher.userId.userId = teacherId;
    await teacher.userId.save();

    // Add teacher to new classes
    if (assignedClasses && assignedClasses.length > 0) {
      for (const className of assignedClasses) {
        await Class.findOneAndUpdate(
          { name: className, isActive: true },
          { 
            $addToSet: { 
              assignedTeachers: { 
                teacherId: teacher._id, 
                subject: subject 
              } 
            } 
          }
        );
      }
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findById(id).populate('userId');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Remove teacher from all classes
    if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
      for (const className of teacher.assignedClasses) {
        await Class.findOneAndUpdate(
          { name: className, isActive: true },
          { $pull: { assignedTeachers: { teacherId: teacher._id } } }
        );
      }
    }

    // Soft delete teacher
    teacher.isActive = false;
    await teacher.save();

    // Soft delete user
    teacher.userId.isActive = false;
    await teacher.userId.save();

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students for class assignment
const getAllStudentsForClass = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('userId', 'name')
      .select('_id rollNo className userId')
      .lean();
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all teachers for class assignment
const getAllTeachersForClass = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('userId', 'name email')
      .select('_id teacherId subject assignedClasses userId')
      .lean();
    
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign teacher to class
const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, className } = req.body;
    if (!teacherId || !className) {
      return res.status(400).json({ success: false, message: 'Teacher ID and class name are required' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const classDoc = await Class.findOne({ name: className, isActive: true });
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Add teacher to class
    await Class.findOneAndUpdate(
      { name: className, isActive: true },
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
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedClasses: className }
    });

    res.json({ success: true, message: 'Teacher assigned to class successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Timetable Management Functions

// Get all timetable entries
const getTimetable = async (req, res) => {
  try {
    // Get all timetable entries and populate teacher info with user details
    const timetableEntries = await Timetable.find()
      .populate({
        path: 'teacherId',
        select: 'teacherId subject assignedClasses',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });
    
    // Return all entries as is, the frontend will organize them
    res.json({ 
      success: true, 
      timetable: timetableEntries 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching timetable data',
      error: error.message 
    });
  }
};

// Create a new timetable entry
const createTimetableEntry = async (req, res) => {
  try {
    const { teacherId, className, day, time, room } = req.body;
    
    // Validate required fields
    if (!teacherId || !className || !day || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher, class, day, and time are required fields' 
      });
    }
    
    // Validate the day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid day. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday' 
      });
    }
    
    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }
    
    // Check for time conflicts for this teacher
    const existingEntry = await Timetable.findOne({
      teacherId,
      day,
      time
    });
    
    if (existingEntry) {
      return res.status(409).json({ 
        success: false, 
        message: 'This teacher already has a class scheduled at this time' 
      });
    }
    
    // Get the teacher to extract their subject
    const teacherDetails = await Teacher.findById(teacherId);
    
    if (!teacherDetails) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }
    
    // Create new timetable entry with subject from teacher
    const newEntry = new Timetable({
      teacherId,
      className,
      day,
      subject: teacherDetails.subject || 'No subject assigned',
      time,
      room: room || ''
    });
    
    await newEntry.save();
    
    // Populate teacher info before returning
    await newEntry.populate({
      path: 'teacherId',
      select: 'teacherId subject assignedClasses',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Timetable entry added successfully', 
      entry: newEntry 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error adding timetable entry', 
      error: error.message 
    });
  }
};

// Update an existing timetable entry
const updateTimetableEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    const { teacherId, className, day, time, room } = req.body;
    
    // Validate required fields
    if (!teacherId || !className || !day || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher, class, day, and time are required fields' 
      });
    }
    
    // Find the entry
    const entry = await Timetable.findById(entryId);
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }
    
    // Check for time conflicts if we're changing day/time or teacher
    if (
      (entry.day !== day || entry.time !== time || entry.teacherId.toString() !== teacherId)
    ) {
      const existingEntry = await Timetable.findOne({
        teacherId,
        day,
        time,
        _id: { $ne: entryId } // Exclude the current entry
      });
      
      if (existingEntry) {
        return res.status(409).json({ 
          success: false, 
          message: 'This teacher already has a class scheduled at this time' 
        });
      }
    }
    
    // Get the teacher to extract their subject
    const teacherDetails = await Teacher.findById(teacherId);
    
    if (!teacherDetails) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }
    
    // Update the entry
    entry.teacherId = teacherId;
    entry.className = className;
    entry.day = day;
    entry.subject = teacherDetails.subject || 'No subject assigned';
    entry.time = time;
    entry.room = room || '';
    entry.updatedAt = Date.now();
    
    await entry.save();
    
    // Populate teacher info before returning
    await entry.populate('teacherId', 'name teacherId');
    
    res.json({ 
      success: true, 
      message: 'Timetable entry updated successfully', 
      entry 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating timetable entry', 
      error: error.message 
    });
  }
};

// Delete a timetable entry
const deleteTimetableEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    
    // Find and delete the entry
    const entry = await Timetable.findByIdAndDelete(entryId);
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Timetable entry deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting timetable entry', 
      error: error.message 
    });
  }
};

module.exports = { 
  adminLogin, 
  getDashboardStats, 
  getClasses, 
  createClass, 
  updateClass,
  deleteClass,
  getAllStudentsForClass,
  getAllTeachersForClass,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignTeacherToClass,
  // Timetable management functions
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
};
