 const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const { 
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
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} = require('../controllers/adminController');

const router = express.Router();

router.post('/login',
  body('adminId').notEmpty(),
  body('password').notEmpty(),
  adminLogin
);

router.use(auth, authorize('admin'));

router.get('/dashboard', getDashboardStats);

// Class Management Routes
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/classes/students', getAllStudentsForClass);
router.get('/classes/teachers', getAllTeachersForClass);

// Student Management Routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Teacher Management Routes
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);
router.post('/assign-teacher', assignTeacherToClass);

// Timetable Management Routes
router.get('/timetable', getTimetable);
router.post('/timetable', createTimetableEntry);
router.put('/timetable/:id', updateTimetableEntry);
router.delete('/timetable/:id', deleteTimetableEntry);

module.exports = router;
