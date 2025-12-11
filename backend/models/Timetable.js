const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  className: { 
    type: String, 
    required: true 
  },
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  room: { 
    type: String, 
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);