// Timetable Management Functions

// Get all timetable entries
const getTimetable = async (req, res) => {
  try {
    // Get all timetable entries and populate teacher info
    const timetableEntries = await Timetable.find().populate('teacherId', 'name teacherId');
    
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
    const { teacherId, className, day, subject, time, room } = req.body;
    
    // Validate required fields
    if (!teacherId || !className || !day || !subject || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher, class, day, subject, and time are required fields' 
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
    
    // Create new timetable entry
    const newEntry = new Timetable({
      teacherId,
      className,
      day,
      subject,
      time,
      room: room || ''
    });
    
    await newEntry.save();
    
    // Populate teacher info before returning
    await newEntry.populate('teacherId', 'name teacherId');
    
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
    const { teacherId, className, day, subject, time, room } = req.body;
    
    // Validate required fields
    if (!teacherId || !className || !day || !subject || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher, class, day, subject, and time are required fields' 
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
    
    // Update the entry
    entry.teacherId = teacherId;
    entry.className = className;
    entry.day = day;
    entry.subject = subject;
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