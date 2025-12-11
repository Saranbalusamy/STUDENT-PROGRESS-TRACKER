 const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Timetable = require('../models/Timetable');
const LLMAnalytics = require('../models/LLMAnalytics');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateTeacherResponse } = require('../utils/teacherAssistant');

// Teacher login
const teacherLogin = async (req, res) => {
  try {
    const { teacherId, email, password } = req.body;
    
    console.log('Teacher Login Attempt:', { teacherId, email });
    
    // Find user with teacherId, email, role, and active status
    const user = await User.findOne({ 
      userId: teacherId, 
      email, 
      role: 'teacher',
      isActive: true 
    });
    
    if (!user) {
      console.log('User not found with credentials:', { teacherId, email });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', teacherId);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Find teacher profile
    const teacher = await Teacher.findOne({ userId: user._id, isActive: true });
    if (!teacher) {
      console.log('Teacher profile not found for user:', user._id);
      return res.status(401).json({ success: false, message: 'Teacher profile not found' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, teacherId: teacher.teacherId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        teacherId: teacher.teacherId,
        name: user.name,
        role: user.role,
        subject: teacher.subject,
        assignedClasses: teacher.assignedClasses
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher dashboard overview
const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const classStats = await Promise.all(
      teacher.assignedClasses.map(async className => {
        const studentCount = await Student.countDocuments({ className, isActive: true });
        return { className, studentCount };
      })
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[today.getDay()];

    // Count classes scheduled for today from timetable
    const todayClassesCount = await Timetable.countDocuments({
      teacherId: teacher._id,
      day: todayDayName
    });

    const totalStudents = classStats.reduce((sum, cls) => sum + cls.studentCount, 0);

    // Get students with lowest marks (bottom 5)
    const lowPerformingStudents = await Marks.aggregate([
      { $match: { teacherId: teacher._id } },
      { $group: { 
        _id: "$studentId", 
        avgMarks: { $avg: "$marks" } 
      }},
      { $sort: { avgMarks: 1 } },
      { $limit: 5 }
    ]).exec();
    
    // Populate student details
    const lowMarksStudents = await Promise.all(
      lowPerformingStudents.map(async student => {
        const studentData = await Student.findById(student._id).populate('userId', 'name');
        return {
          name: studentData?.userId?.name || 'Unknown',
          className: studentData?.className || 'Unknown',
          rollNo: studentData?.rollNo || 'N/A',
          avgMarks: Math.round(student.avgMarks)
        };
      })
    );

    // Get students with poor attendance (bottom 5)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Get all attendance records for the teacher's subject in the last month
    const attendanceRecords = await Attendance.find({
      teacherId: teacher._id,
      date: { $gte: lastMonth }
    }).select('students date');

    // Calculate attendance percentage for each student
    const studentAttendance = {};
    attendanceRecords.forEach(record => {
      record.students.forEach(student => {
        if (!studentAttendance[student.studentId]) {
          studentAttendance[student.studentId] = { present: 0, total: 0 };
        }
        studentAttendance[student.studentId].total++;
        if (student.status === 'present') {
          studentAttendance[student.studentId].present++;
        }
      });
    });

    // Calculate attendance percentages
    const attendancePercentages = Object.entries(studentAttendance).map(([studentId, data]) => ({
      studentId,
      percentage: (data.present / data.total) * 100
    }));

    // Sort by attendance percentage (ascending) and take bottom 5
    attendancePercentages.sort((a, b) => a.percentage - b.percentage);
    const lowAttendanceIds = attendancePercentages.slice(0, 5).map(item => item.studentId);

    // Fetch student details
    const lowAttendanceStudents = await Promise.all(
      lowAttendanceIds.map(async studentId => {
        const studentData = await Student.findById(studentId).populate('userId', 'name');
        const attendance = studentAttendance[studentId];
        return {
          name: studentData?.userId?.name || 'Unknown',
          className: studentData?.className || 'Unknown',
          rollNo: studentData?.rollNo || 'N/A',
          attendance: Math.round((attendance.present / attendance.total) * 100) || 0,
          daysPresent: attendance.present,
          daysTotal: attendance.total
        };
      })
    );

    res.json({
      success: true,
      teacher: {
        name: req.user.name,
        subject: teacher.subject,
        assignedClasses: classStats,
        todayClasses: todayClassesCount,
        totalStudents,
        lowMarksStudents,
        lowAttendanceStudents
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher's timetable
const getTeacherTimetable = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    // Get actual timetable entries from the database
    const timetableEntries = await Timetable.find({ teacherId: teacher._id });
    
    // Organize entries by day
    const organizedTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    timetableEntries.forEach(entry => {
      organizedTimetable[entry.day].push({
        id: entry._id,
        subject: entry.subject,
        time: entry.time,
        className: entry.className,
        room: entry.room,
        teacher: teacher.teacherId // Add teacher ID for reference
      });
    });

    res.json({ success: true, timetable: organizedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance records
const getTeacherAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { date, className } = req.query;
    const query = { teacher: teacher._id };
    if (date) query.date = date;
    if (className) query.className = className;

    const attendance = await Attendance.find(query)
      .populate('student', 'rollNo')
      .sort({ date: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { date, className, subject, students, totalStudents, presentCount, absentCount } = req.body;
    
    // Validate required fields
    if (!date || !className || !subject || !students || !Array.isArray(students)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Need date, className, subject, and students array.' 
      });
    }

    // Validate if teacher is assigned to this class
    if (!teacher.assignedClasses.includes(className)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this class' });
    }

    // Create new attendance record
    const attendanceRecord = new Attendance({
      date: new Date(date),
      className,
      subject,
      teacherId: teacher._id,
      students,
      totalStudents,
      presentCount,
      absentCount
    });

    await attendanceRecord.save();

    res.json({ 
      success: true, 
      message: 'Attendance saved successfully',
      record: attendanceRecord 
    });
  } catch (error) {
    console.error('Attendance save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students in a class
const getClassStudents = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { className } = req.params;
    
    // If className is not provided, return all students from all assigned classes
    if (!className) {
      const students = await Student.find({ 
        className: { $in: teacher.assignedClasses }, 
        isActive: true 
      })
        .populate('userId', 'name email')
        .select('_id rollNo userId className');
      
      // Log the structure for debugging
      console.log(`Found ${students.length} students across all classes`);
      
      return res.json({ success: true, students });
    }
    
    // If className is provided, check authorization and return students from that class
    if (!teacher.assignedClasses.includes(className)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this class' });
    }

    const students = await Student.find({ className, isActive: true })
      .populate('userId', 'name email')
      .select('_id rollNo userId');

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get marks
const getMarks = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { className, examType } = req.query;
    const query = { teacher: teacher._id };
    if (className) query.className = className;
    if (examType) query.examType = examType;

    const marks = await Marks.find(query)
      .populate('student', 'rollNo')
      .sort({ date: -1 });

    res.json({ success: true, marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update marks
const updateMarks = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const { className, examType, subject, marksData } = req.body;
    
    // Validate required fields
    if (!className || !examType || !subject || !marksData || !Array.isArray(marksData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Need className, examType, subject, and marksData array.' 
      });
    }

    // Validate if teacher is assigned to this class
    if (!teacher.assignedClasses.includes(className)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this class' });
    }

    // Validate teacher's subject
    if (teacher.subject !== subject) {
      return res.status(403).json({ success: false, message: 'Not authorized for this subject' });
    }

    // Validate marks data format
    for (const record of marksData) {
      if (!record.studentId || typeof record.marks !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid marks data format. Each record must have studentId and marks.'
        });
      }
    }

    // Create or update marks records
    const records = await Promise.all(
      marksData.map(async ({ studentId, marks }) => {
        // Verify if student exists in the class
        const student = await Student.findOne({ 
          _id: studentId, 
          className,
          isActive: true 
        });

        if (!student) {
          throw new Error(`Student ${studentId} not found in class ${className}`);
        }

        return await Marks.findOneAndUpdate(
          {
            studentId,
            className,
            subject,
            examType,
            teacherId: teacher._id
          },
          {
            marks,
            totalMarks: 100,  // You can make this dynamic if needed
            remarks: ''       // You can add remarks field in frontend if needed
          },
          { upsert: true, new: true, runValidators: true }
        );
      })
    );

    res.json({ 
      success: true, 
      message: 'Marks updated successfully',
      records 
    });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating marks'
    });
  }
};

// Get teacher assistant response
const getTeacherAssistantResponse = async (req, res) => {
  try {
    const { query, message } = req.body;
    
    // Accept both 'query' and 'message' for compatibility
    const userQuery = query || message;
    
    if (!userQuery) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }

    // Get teacher data for contextual responses
    const teacher = await Teacher.findOne({ userId: req.user._id })
      .populate('userId', 'name email');
    
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const teacherData = {
      id: teacher._id,
      name: teacher.userId.name,
      email: teacher.userId.email,
      subject: teacher.subject,
      classes: teacher.assignedClasses
    };

    // Start timing for response generation
    const startTime = Date.now();

    // Generate response using the utility function
    const assistantResponse = await generateTeacherResponse(userQuery, teacherData);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine query category based on content
    let category = 'general';
    const queryLower = userQuery.toLowerCase();
    
    // Use query analyzer for more accurate category detection
    const { analyzeQuery } = require('../utils/queryAnalyzer');
    const queryAnalysis = analyzeQuery(userQuery);
    
    // Set category based on analysis
    if (queryAnalysis.teacherCategory) {
      category = queryAnalysis.teacherCategory;
    } else
    if (queryLower.includes('lesson') || queryLower.includes('plan') || queryLower.includes('curriculum')) {
      category = 'lesson_planning';
    } else if (queryLower.includes('assessment') || queryLower.includes('test') || queryLower.includes('quiz') || queryLower.includes('grade')) {
      category = 'assessment';
    } else if (queryLower.includes('student') && (queryLower.includes('behavior') || queryLower.includes('discipline') || queryLower.includes('management'))) {
      category = 'classroom_management';
    } else if (queryLower.includes('activity') || queryLower.includes('engagement') || queryLower.includes('exercise')) {
      category = 'teaching_activities';
    }
    
    // Determine sentiment (basic implementation)
    const positiveWords = ['help', 'thanks', 'good', 'great', 'excellent', 'appreciate', 'please'];
    const negativeWords = ['bad', 'difficult', 'problem', 'issue', 'trouble', 'confused', 'struggling'];
    
    let sentiment = 'neutral';
    if (positiveWords.some(word => queryLower.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => queryLower.includes(word))) {
      sentiment = 'negative';
    }
    
    // Log the interaction to database for analytics
    try {
      const analytics = new LLMAnalytics({
        userId: req.user._id,
        userRole: 'teacher',
        query: userQuery,
        response: assistantResponse,
        responseTime,
        sentiment,
        category,
        sessionId: req.headers['x-session-id'] || `session_${Date.now()}`,
        metadata: {
          browser: req.headers['user-agent'] || 'unknown',
          device: 'web',
          os: req.headers['sec-ch-ua-platform'] || 'unknown'
        }
      });
      
      await analytics.save();
    } catch (analyticsError) {
      console.error('Failed to save analytics data:', analyticsError);
      // Continue execution even if analytics logging fails
    }
    
    res.status(200).json({
      success: true,
      reply: assistantResponse
    });
  } catch (error) {
    console.error('Error generating teacher assistant response:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error generating assistant response'
    });
  }
};

// Add a new timetable entry
const addTimetableEntry = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    const { className, day, subject, time, room } = req.body;
    
    // Validate if the teacher is assigned to this class
    if (!teacher.assignedClasses.includes(className)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to add entries for this class' 
      });
    }
    
    // Validate the day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid day. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday' 
      });
    }
    
    // Check for time conflicts
    const existingEntry = await Timetable.findOne({
      teacherId: teacher._id,
      day,
      time
    });
    
    if (existingEntry) {
      return res.status(409).json({ 
        success: false, 
        message: 'You already have a class scheduled at this time' 
      });
    }
    
    // Create new timetable entry
    const newEntry = new Timetable({
      teacherId: teacher._id,
      className,
      day,
      subject,
      time,
      room: room || ''
    });
    
    await newEntry.save();
    
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
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    const { entryId } = req.params;
    const { className, day, subject, time, room } = req.body;
    
    // Find the entry and ensure it belongs to this teacher
    const entry = await Timetable.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    if (entry.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to edit this entry' 
      });
    }
    
    // Validate if the teacher is assigned to this class
    if (className && !teacher.assignedClasses.includes(className)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to add entries for this class' 
      });
    }
    
    // Validate the day
    if (day) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!validDays.includes(day)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid day. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday' 
        });
      }
    }
    
    // Check for time conflicts if time is being changed
    if (time && (time !== entry.time || day !== entry.day)) {
      const existingEntry = await Timetable.findOne({
        teacherId: teacher._id,
        day: day || entry.day,
        time,
        _id: { $ne: entryId } // Exclude the current entry
      });
      
      if (existingEntry) {
        return res.status(409).json({ 
          success: false, 
          message: 'You already have a class scheduled at this time' 
        });
      }
    }
    
    // Update the entry
    entry.className = className || entry.className;
    entry.day = day || entry.day;
    entry.subject = subject || entry.subject;
    entry.time = time || entry.time;
    entry.room = room !== undefined ? room : entry.room;
    entry.updatedAt = Date.now();
    
    await entry.save();
    
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
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    const { entryId } = req.params;
    
    // Find the entry and ensure it belongs to this teacher
    const entry = await Timetable.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    if (entry.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this entry' 
      });
    }
    
    await Timetable.findByIdAndDelete(entryId);
    
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
  teacherLogin,
  getTeacherDashboard,
  getTeacherTimetable,
  getTeacherAttendance,
  markAttendance,
  getClassStudents,
  getMarks,
  updateMarks,
  getTeacherAssistantResponse,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
};
