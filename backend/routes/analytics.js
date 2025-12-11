const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { 
  getPersonalAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// Protected routes - require authentication
router.use(auth);

// Personal analytics - available to all authenticated users
router.get('/personal', getPersonalAnalytics);

module.exports = router;