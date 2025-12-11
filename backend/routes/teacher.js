 const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/teacherController');

const router = express.Router();

// Login route
router.post('/login',
  body('teacherId').notEmpty(),
  body('email').isEmail(),
  body('password').notEmpty(),
  teacherLogin
);

router.use(auth, authorize('teacher'));

// Protected routes
router.get('/dashboard', getTeacherDashboard);
router.get('/timetable', getTeacherTimetable);
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', markAttendance);
router.get('/students/:className', getClassStudents);
router.get('/students', getClassStudents); // Added endpoint for getting all students
router.get('/marks', getMarks);
router.post('/marks', updateMarks);
router.post('/assistant', getTeacherAssistantResponse);

// Timetable management routes
router.post('/timetable', addTimetableEntry);
router.put('/timetable/:entryId', updateTimetableEntry);
router.delete('/timetable/:entryId', deleteTimetableEntry);

module.exports = router;
