const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Get active classes (public endpoint)
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .select('name')
      .sort('name');
    
    res.json({ 
      success: true, 
      classes: classes.map(c => ({ _id: c._id, name: c.name }))
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Failed to load classes' });
  }
});

module.exports = router;
