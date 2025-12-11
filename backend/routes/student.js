 const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const { 
  studentLogin,
  getStudentDashboard,
  getStudentPerformance,
  getStudentAttendance,
  getStudentInsights,
  getLLMResponse
} = require('../controllers/studentController');

const router = express.Router();

// Public routes
router.post('/login',
  body('className').notEmpty(),
  body('rollNo').notEmpty(),
  body('password').notEmpty(),
  studentLogin
);

// Protected routes - require authentication
router.use(auth, authorize('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/performance', getStudentPerformance);
router.get('/attendance', getStudentAttendance);
router.get('/insights', getStudentInsights);
router.post('/llm-tutor', body('message').notEmpty(), getLLMResponse);

module.exports = router;
