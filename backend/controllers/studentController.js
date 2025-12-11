 const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const LLMAnalytics = require('../models/LLMAnalytics');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateAIInsights } = require('../utils/aiInsights');
const { generateLLMResponse } = require('../utils/llmTutor');

// Student login
const studentLogin = async (req, res) => {
  try {
    const { className, rollNo, password } = req.body;
    const student = await Student.findOne({ className, rollNo, isActive: true }).populate('userId');

    if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await student.userId.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: student.userId._id, role: student.userId.role, studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        rollNo: student.rollNo,
        name: student.userId.name,
        role: student.userId.role,
        className: student.className
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student dashboard data
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId)
      .populate('userId', 'name email')
      .select('rollNo className');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get attendance percentage
    const attendanceRecords = await Attendance.find({
      'students.studentId': student._id,
      date: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
      }
    });

    let totalDays = attendanceRecords.length;
    let presentDays = attendanceRecords.reduce((count, record) => {
      const studentAttendance = record.students.find(s => 
        s.studentId.toString() === student._id.toString()
      );
      return count + (studentAttendance?.status === 'present' ? 1 : 0);
    }, 0);

    const attendancePercentage = totalDays ? (presentDays / totalDays) * 100 : 0;

    // Get overall performance percentage
    const marksRecords = await Marks.find({
      studentId: student._id
    });

    let totalMarks = 0;
    let obtainedMarks = 0;

    marksRecords.forEach(record => {
      totalMarks += record.totalMarks || 100;
      obtainedMarks += record.marks || 0;
    });

    const overallPercentage = totalMarks ? (obtainedMarks / totalMarks) * 100 : 0;

    // Get class leaderboard (top 5 students by marks)
    const classStudents = await Student.find({ 
      className: student.className,
      isActive: true
    }).populate('userId', 'name');

    const leaderboardData = await Promise.all(
      classStudents.map(async (classStudent) => {
        const studentMarks = await Marks.find({ studentId: classStudent._id });
        
        let totalStudentMarks = 0;
        let obtainedStudentMarks = 0;
        
        studentMarks.forEach(record => {
          totalStudentMarks += record.totalMarks || 100;
          obtainedStudentMarks += record.marks || 0;
        });
        
        // Get attendance for this student
        const studentAttendance = await Attendance.find({
          'students.studentId': classStudent._id,
          date: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        });
        
        let studentTotalDays = studentAttendance.length;
        let studentPresentDays = studentAttendance.reduce((count, record) => {
          const attendance = record.students.find(s => 
            s.studentId.toString() === classStudent._id.toString()
          );
          return count + (attendance?.status === 'present' ? 1 : 0);
        }, 0);
        
        const studentAttendancePercentage = studentTotalDays ? (studentPresentDays / studentTotalDays) * 100 : 0;
        
        return {
          id: classStudent._id,
          name: classStudent.userId.name,
          rollNo: classStudent.rollNo,
          percentage: totalStudentMarks ? (obtainedStudentMarks / totalStudentMarks) * 100 : 0,
          attendance: Math.round(studentAttendancePercentage)
        };
      })
    );
    
    // Sort leaderboard by percentage (descending)
    leaderboardData.sort((a, b) => b.percentage - a.percentage);
    
    // Get student's rank in the class
    const studentRank = leaderboardData.findIndex(s => s.id.toString() === student._id.toString()) + 1;

    res.json({
      success: true,
      student: {
        name: student.userId.name,
        rollNo: student.rollNo,
        className: student.className,
        attendancePercentage: Math.round(attendancePercentage),
        overallPercentage: Math.round(overallPercentage),
        rank: studentRank
      },
      leaderboard: leaderboardData.slice(0, 5) // Top 5 students
    });
  } catch (error) {
    console.error('Error in student dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};

// Get student performance data
const getStudentPerformance = async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId).select('className');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get marks by subject
    const marksRecords = await Marks.find({ studentId: student._id });

    const subjectWiseMarks = {};
    const subjects = new Set();
    const attendanceBySubject = {};

    marksRecords.forEach(record => {
      if (record.subject) {
        subjects.add(record.subject);
        subjectWiseMarks[record.subject] = record.marks;
      }
    });

    // Get attendance by subject
    const attendanceRecords = await Attendance.find({
      'students.studentId': student._id,
      date: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    });

    const subjectAttendance = {};
    attendanceRecords.forEach(record => {
      if (record.subject) {
        if (!subjectAttendance[record.subject]) {
          subjectAttendance[record.subject] = { present: 0, total: 0 };
        }
        const studentAttendance = record.students.find(s => 
          s.studentId.toString() === student._id.toString()
        );
        subjectAttendance[record.subject].total++;
        if (studentAttendance?.status === 'present') {
          subjectAttendance[record.subject].present++;
        }
      }
    });

    // Calculate attendance percentages
    Object.keys(subjectAttendance).forEach(subject => {
      const { present, total } = subjectAttendance[subject];
      attendanceBySubject[subject] = total ? (present / total) * 100 : 0;
    });

    res.json({
      success: true,
      data: {
        subjects: Array.from(subjects),
        subjectWiseMarks,
        attendanceBySubject
      }
    });
  } catch (error) {
    console.error('Error in student performance:', error);
    res.status(500).json({ success: false, message: 'Failed to load performance data' });
  }
};

// Get student attendance data
const getStudentAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const student = await Student.findById(req.user.studentId).select('className');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else {
      // Default to current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const attendanceRecords = await Attendance.find({
      'students.studentId': student._id,
      ...dateFilter
    }).sort({ date: 1 });

    const attendanceData = attendanceRecords.map(record => {
      const studentAttendance = record.students.find(s => 
        s.studentId.toString() === student._id.toString()
      );
      
      return {
        date: record.date,
        subject: record.subject || 'Unknown',
        status: studentAttendance?.status || 'absent',
        remarks: studentAttendance?.remarks || ''
      };
    });

    // Calculate summary
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(record => record.status === 'present').length;
    const absentDays = attendanceData.filter(record => record.status === 'absent').length;
    const percentage = totalDays ? (presentDays / totalDays) * 100 : 0;

    // Group attendance by subject for frontend compatibility
    const attendanceBySubject = {};
    attendanceData.forEach(record => {
      if (!attendanceBySubject[record.subject]) {
        attendanceBySubject[record.subject] = {
          present: 0,
          total: 0,
          percentage: 0,
          records: []
        };
      }
      attendanceBySubject[record.subject].total++;
      if (record.status === 'present') {
        attendanceBySubject[record.subject].present++;
      }
      attendanceBySubject[record.subject].records.push(record);
    });

    // Calculate percentages for each subject
    Object.keys(attendanceBySubject).forEach(subject => {
      const { present, total } = attendanceBySubject[subject];
      attendanceBySubject[subject].percentage = total ? Math.round((present / total) * 100) : 0;
    });

    res.json({
      success: true,
      attendance: attendanceBySubject,
      data: {
        summary: {
          totalDays,
          presentDays,
          absentDays,
          percentage: Math.round(percentage)
        },
        records: attendanceData
      }
    });
  } catch (error) {
    console.error('Error in student attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to load attendance data' });
  }
};

// Get AI insights for student
const getStudentInsights = async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId)
      .populate('userId', 'name')
      .select('rollNo className');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get recent performance data
    const marksRecords = await Marks.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent attendance data
    const attendanceRecords = await Attendance.find({
      'students.studentId': student._id,
      date: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    });

    const presentDays = attendanceRecords.reduce((count, record) => {
      const studentAttendance = record.students.find(s => 
        s.studentId.toString() === student._id.toString()
      );
      return count + (studentAttendance?.status === 'present' ? 1 : 0);
    }, 0);

    const attendancePercentage = attendanceRecords.length ? 
      (presentDays / attendanceRecords.length) * 100 : 0;

    // Calculate average marks
    const totalMarks = marksRecords.reduce((sum, record) => sum + (record.marks || 0), 0);
    const averageMarks = marksRecords.length ? totalMarks / marksRecords.length : 0;

    // Prepare performance data for AI insights
    const performanceData = {};
    marksRecords.forEach(record => {
      const subjectName = record.subject || 'Unknown';
      if (!performanceData[subjectName]) {
        performanceData[subjectName] = [];
      }
      const percentage = record.totalMarks ? (record.marks / record.totalMarks) * 100 : 0;
      performanceData[subjectName].push(percentage);
    });

    // Generate AI insights
    const insights = generateAIInsights(performanceData, attendancePercentage);

    res.json({
      success: true,
      insights,
      data: {
        student: {
          name: student.userId.name,
          rollNo: student.rollNo,
          className: student.className
        },
        metrics: {
          attendancePercentage: Math.round(attendancePercentage),
          averageMarks: Math.round(averageMarks),
          totalTests: marksRecords.length
        }
      }
    });
  } catch (error) {
    console.error('Error in student insights:', error);
    res.status(500).json({ success: false, message: 'Failed to load insights data' });
  }
};

// Get LLM-based learning assistance response
const getLLMResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Message is required', errors: errors.array() });
    }

    const { message, studentContext } = req.body;
    
    // Define sentiment analysis word arrays
    const positiveWords = ['good', 'great', 'excellent', 'awesome', 'wonderful', 'fantastic', 'amazing', 'love', 'like', 'happy', 'excited', 'confident', 'understand', 'clear', 'helpful', 'thanks', 'thank you'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'confused', 'difficult', 'hard', 'frustrated', 'stuck', 'problem', 'issue', 'error', 'wrong', 'fail', 'failed'];
    
    // Get student info
    const student = await Student.findById(req.user.studentId)
      .populate('userId', 'name')
      .select('rollNo className');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If studentContext was not provided in the request, fetch the performance data
    let performanceContext = studentContext?.performance;
    
    if (!performanceContext) {
      // Get recent performance data
      const marksRecords = await Marks.find({ studentId: student._id });

      // Prepare performance data for AI assistance
      const performanceData = {};
      marksRecords.forEach(record => {
        const subjectName = record.subject || 'Unknown';
        performanceData[subjectName] = record.totalMarks ? 
          (record.marks / record.totalMarks) * 100 : 0;
      });
      
      performanceContext = {
        subjectWiseMarks: performanceData
      };
    }

    // Create a combined context object
    const fullContext = {
      student: {
        name: student.userId.name,
        rollNo: student.rollNo,
        className: student.className
      },
      performance: performanceContext
    };

    // Generate LLM response
    const startTime = Date.now();
    const reply = await generateLLMResponse(message, fullContext);
    const responseTime = Date.now() - startTime;

    // Use query analyzer for more accurate category detection
    const { analyzeQuery } = require('../utils/queryAnalyzer');
    const queryAnalysis = analyzeQuery(message);
    
    // Determine category based on query analysis
    let category = 'general';
    const lowerMessage = message.toLowerCase();
    
    // If we detected a subject, use that as the category
    if (queryAnalysis.detectedSubject && queryAnalysis.subjectConfidence > 0.1) {
      category = queryAnalysis.detectedSubject.toLowerCase();
    }
    // If it's a study question without a specific subject, use 'study_skills'
    else if (queryAnalysis.isStudyQuestion) {
      category = 'study_skills';
    }
    // Fallback to the legacy category mapping
    else {
      const categoryMapping = {
        homework: ['homework', 'assignment', 'project', 'essay', 'report'],
        exam: ['exam', 'test', 'quiz', 'assessment', 'midterm', 'final'],
        concept: ['explain', 'understand', 'concept', 'theory', 'principle', 'definition'],
        practice: ['practice', 'exercise', 'problem', 'solve', 'calculate'],
        study: ['study', 'review', 'summarize', 'note', 'prepare']
      };
      
      // Determine the category based on keywords
      for (const [cat, keywords] of Object.entries(categoryMapping)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          category = cat;
          break;
        }
      }
    }
    let sentiment = 'neutral';
    if (positiveWords.some(word => lowerMessage.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => lowerMessage.includes(word))) {
      sentiment = 'negative';
    }
    
    // Log the interaction to database for analytics
    try {
      const analytics = new LLMAnalytics({
        userId: student.userId._id, // Use the actual student's user ID from the populated document
        userRole: 'student',
        query: message,
        response: reply,
        responseTime,
        sentiment,
        category,
        sessionId: req.headers['x-session-id'] || `session_${Date.now()}`,
        metadata: {
          browser: req.headers['user-agent'] || 'unknown',
          device: 'web', // Would need more sophisticated detection for accurate device info
          os: req.headers['sec-ch-ua-platform'] || 'unknown'
        }
      });
      
      await analytics.save();
    } catch (analyticsError) {
      console.error('Failed to save analytics data:', analyticsError);
      // Continue execution even if analytics logging fails
    }

    res.json({
      success: true,
      reply,
      studentName: student.userId.name
    });
  } catch (error) {
    console.error('Error in LLM tutor:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI response' });
  }
};

// Get personal analytics for a student
const getPersonalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id; // Use the actual user ObjectId
    
    // Get total interactions
    const totalInteractions = await LLMAnalytics.countDocuments({ 
      userId, 
      userRole: 'student' 
    });
    
    // Get category distribution
    const categoryDistribution = await LLMAnalytics.aggregate([
      { $match: { userId, userRole: 'student' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent activity (last 10 interactions)
    const recentActivity = await LLMAnalytics.find(
      { userId, userRole: 'student' },
      { query: 1, category: 1, createdAt: 1, _id: 0 }
    )
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get usage over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usageOverTime = await LLMAnalytics.aggregate([
      { 
        $match: { 
          userId, 
          userRole: 'student',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { 
        $group: { 
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get most common session times
    const sessionTimes = await LLMAnalytics.aggregate([
      { $match: { userId, userRole: 'student' } },
      { 
        $group: { 
          _id: { 
            $dateToString: { 
              format: '%H', 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalInteractions,
        categoryDistribution,
        recentActivity,
        usageOverTime,
        sessionTimes
      }
    });
  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal analytics' });
  }
};

module.exports = {
  studentLogin,
  getStudentDashboard,
  getStudentPerformance,
  getStudentAttendance,
  getStudentInsights,
  getLLMResponse,
  getPersonalAnalytics
};
