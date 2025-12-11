import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableManagement = () => {
  const { user } = useAuth();
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    className: '',
    day: 'Monday',
    time: '',
    room: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Fetch timetable, teachers, and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all timetable entries
        const timetableRes = await api.get('/admin/timetable');
        if (timetableRes.data.success) {
          console.log('Raw timetable data:', timetableRes.data.timetable); // Debug log
          const entries = timetableRes.data.timetable || [];
          console.log('Number of timetable entries loaded:', entries.length); // Debug log
          setTimetableEntries(entries);
          
          // Organize entries by day
          const organizedTimetable = organizeTimetableByDay(entries);
          setTimetable(organizedTimetable);
        }
        
        // Get all teachers with their subjects and assigned classes
        const teachersRes = await api.get('/admin/teachers');
        if (teachersRes.data.success) {
          console.log('Raw teachers data:', teachersRes.data.teachers); // Debug log
          console.log('Number of teachers loaded:', teachersRes.data.teachers.length); // Debug log
          setTeachers(teachersRes.data.teachers || []);
        }
        
        // Get all classes
        const classesRes = await api.get('/admin/classes');
        if (classesRes.data.success) {
          setClasses(classesRes.data.classes || []);
        }
      } catch (err) {
        console.error('Error fetching timetable data:', err);
        if (err.response?.status === 403) {
          setError('Access denied. Please ensure you are logged in as an admin and try refreshing the page.');
        } else if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Failed to load timetable data. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update timetable when teacher selection changes
  useEffect(() => {
    if (selectedTeacher) {
      console.log('Filtering for teacher:', selectedTeacher);
      console.log('Available entries:', timetableEntries);
      
      const filteredEntries = timetableEntries.filter(entry => {
        console.log('Checking entry:', entry);
        console.log('Entry teacherId:', entry.teacherId);
        
        // Handle both populated and non-populated teacher references
        if (typeof entry.teacherId === 'object' && entry.teacherId !== null) {
          // If teacherId is populated object
          const match = entry.teacherId._id === selectedTeacher;
          console.log('Object teacherId match:', match, entry.teacherId._id, 'vs', selectedTeacher);
          return match;
        } else if (typeof entry.teacherId === 'string') {
          // If teacherId is just a string ID
          const match = entry.teacherId === selectedTeacher;
          console.log('String teacherId match:', match, entry.teacherId, 'vs', selectedTeacher);
          return match;
        }
        return false;
      });
      
      console.log('Filtered entries:', filteredEntries);
      const organizedTimetable = organizeTimetableByDay(filteredEntries);
      setTimetable(organizedTimetable);
    } else {
      // If no teacher is selected, show all entries
      const organizedTimetable = organizeTimetableByDay(timetableEntries);
      setTimetable(organizedTimetable);
    }
  }, [selectedTeacher, timetableEntries]);

  // Helper function to organize timetable entries by day
  const organizeTimetableByDay = (entries) => {
    const organized = {};
    
    // Initialize days
    daysOfWeek.forEach(day => {
      organized[day] = [];
    });
    
    // Add entries to their respective days
    entries.forEach(entry => {
      console.log('Processing entry:', entry); // Debug log
      if (organized[entry.day]) {
        // Simplified teacher name extraction
        let teacherName = 'Unknown Teacher';
        let teacherId = null;
        
        console.log('Entry teacherId structure:', JSON.stringify(entry.teacherId, null, 2));
        
        // Try multiple ways to get teacher name
        if (entry.teacherId) {
          if (typeof entry.teacherId === 'object') {
            // If teacherId is populated object
            teacherId = entry.teacherId._id;
            console.log('Teacher object found, _id:', teacherId);
            console.log('Teacher userId:', entry.teacherId.userId);
            console.log('Teacher direct name:', entry.teacherId.name);
            
            if (entry.teacherId.userId && entry.teacherId.userId.name) {
              teacherName = entry.teacherId.userId.name;
              console.log('Got name from userId.name:', teacherName);
            } else if (entry.teacherId.name) {
              teacherName = entry.teacherId.name;
              console.log('Got name from direct name:', teacherName);
            } else if (entry.teacherId.userId && entry.teacherId.userId.email) {
              teacherName = entry.teacherId.userId.email;
              console.log('Got name from userId.email:', teacherName);
            } else {
              teacherName = 'Teacher: ' + teacherId;
              console.log('Using teacher ID as name:', teacherName);
            }
          } else {
            // If teacherId is just an ID string
            teacherId = entry.teacherId;
            teacherName = 'Teacher ID: ' + entry.teacherId;
            console.log('Teacher ID string:', teacherId);
          }
        }
        
        console.log('Teacher ID:', teacherId, 'Teacher Name:', teacherName); // Debug log
        
        organized[entry.day].push({
          id: entry._id,
          teacherId: teacherId,
          teacherName: teacherName,
          subject: entry.subject,
          className: entry.className,
          day: entry.day,
          time: entry.time,
          room: entry.room
        });
      }
    });
    
    return organized;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When a class is selected, clear the teacher selection to force reselection
    if (name === 'className') {
      setFormData(prev => ({ ...prev, className: value, teacherId: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      teacherId: '',
      className: '',
      day: 'Monday',
      time: '',
      room: ''
    });
    setCurrentEntry(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleShowForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleEditEntry = (entry) => {
    setFormData({
      teacherId: entry.teacherId,
      className: entry.className,
      day: entry.day,
      time: entry.time,
      room: entry.room || ''
    });
    setCurrentEntry(entry);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.delete(`/admin/timetable/${entryId}`);
      
      if (res.data.success) {
        // Update the timetableEntries state by removing the deleted entry
        const updatedEntries = timetableEntries.filter(entry => entry._id !== entryId);
        setTimetableEntries(updatedEntries);
        
        // Also update the organized timetable
        const updatedTimetable = { ...timetable };
        for (const day of daysOfWeek) {
          updatedTimetable[day] = updatedTimetable[day].filter(entry => entry.id !== entryId);
        }
        setTimetable(updatedTimetable);
        
        setSuccess('Timetable entry deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting timetable entry:', err);
      setError(err.response?.data?.message || 'Failed to delete timetable entry');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Submitting form data:', formData);
      
      if (isEditing && currentEntry) {
        // Update existing entry
        const res = await api.put(`/admin/timetable/${currentEntry.id}`, formData);
        
        if (res.data.success) {
          // Get the updated entry from response
          const updatedEntry = res.data.entry;
          
          // Update the entry in the timetableEntries state
          const updatedEntries = timetableEntries.map(entry => 
            entry._id === currentEntry.id ? updatedEntry : entry
          );
          setTimetableEntries(updatedEntries);
          
          // Also update the organized timetable
          const updatedTimetable = organizeTimetableByDay(updatedEntries);
          setTimetable(updatedTimetable);
          
          setSuccess('Timetable entry updated successfully');
          handleCloseForm();
        }
      } else {
        // Add new entry
        const res = await api.post('/admin/timetable', formData);
        
        if (res.data.success) {
          const newEntry = res.data.entry;
          
          // Add the new entry to the timetableEntries state
          const updatedEntries = [...timetableEntries, newEntry];
          setTimetableEntries(updatedEntries);
          
          // Also update the organized timetable
          const updatedTimetable = organizeTimetableByDay(updatedEntries);
          setTimetable(updatedTimetable);
          
          setSuccess('Timetable entry added successfully');
          handleCloseForm();
        }
      }
    } catch (err) {
      console.error('Error saving timetable entry:', err);
      
      // Check for specific error types
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you are logged in as an admin.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to save timetable entry');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  if (loading && Object.keys(timetable).length === 0) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-6 lg:p-8">
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-100 text-xs">
              User: {user?.name} | Role: {user?.role} | Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Timetable Management</h2>
              <p className="text-gray-500 mt-1">Create, edit and organize your institution's schedule</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <div className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{teachers.length}</span> teachers</div>
                <span className="w-px h-5 bg-gray-200"/>
                <div className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{classes.length}</span> classes</div>
              </div>
              <button
                onClick={handleShowForm}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Add Timetable Entry
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Teacher Filter */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Teacher
                </label>
                <select
                  id="teacherFilter"
                  value={selectedTeacher}
                  onChange={handleTeacherChange}
                  className="w-full md:w-80 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.userId?.name || teacher.name || 'Unknown Teacher'}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTeacher && (
                <button
                  onClick={() => setSelectedTeacher('')}
                  className="h-10 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"/>
                <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditing ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Class</label>
                    <select 
                      name="className"
                      value={formData.className}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map(classItem => (
                        <option key={classItem._id} value={classItem.name}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Teacher</label>
                    <select 
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a teacher</option>
                      {(() => {
                        let availableTeachers = teachers;
                        if (formData.className && teachers.length > 0) {
                          const filteredTeachers = teachers.filter(teacher => {
                            return teacher.assignedClasses && 
                                   Array.isArray(teacher.assignedClasses) && 
                                   teacher.assignedClasses.includes(formData.className);
                          });
                          availableTeachers = filteredTeachers.length === 0 ? teachers : filteredTeachers;
                        }
                        return availableTeachers.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.userId?.name || teacher.name || 'Unknown Teacher'}
                          </option>
                        ));
                      })()}
                    </select>
                    {formData.className && teachers.length > 0 && teachers.filter(teacher => 
                      teacher.assignedClasses && 
                      Array.isArray(teacher.assignedClasses) && 
                      teacher.assignedClasses.includes(formData.className)
                    ).length === 0 && (
                      <small className="text-orange-500">No teachers specifically assigned to this class. Showing all teachers.</small>
                    )}
                    {teachers.length === 0 && (
                      <small className="text-red-500">No teachers available. Please add teachers first.</small>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Day</label>
                    <select 
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Time</label>
                    <input 
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="e.g., 09:00-10:00 or 9:00 AM - 10:00 AM"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <small className="text-gray-500">Enter time in any format (e.g., 09:00-10:00, 9:00 AM - 10:00 AM)</small>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Room (Optional)</label>
                    <input 
                      type="text"
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-md hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isEditing ? 'Update' : 'Add'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {daysOfWeek.map(day => (
              <div key={day} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow border border-gray-200 max-h-[70vh] overflow-auto hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-4 border-b pb-2 flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-sm -mx-4 px-4 py-2 z-10">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  {day}
                </h3>
                {timetable[day]?.length > 0 ? (
                  <ul className="space-y-3">
                    {timetable[day].map((slot) => (
                      <li key={slot.id} className="border border-gray-200 p-3 rounded-xl shadow-sm relative group bg-white/90 hover:border-blue-300 hover:bg-blue-50/40 transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Teacher</span>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">{slot.className || '—'}</span>
                            {slot.room && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">Room {slot.room}</span>}
                          </div>
                        </div>
                        <p className="font-medium text-gray-800">{slot.teacherName}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Subject</div>
                            <div className="font-medium text-gray-800">{slot.subject}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Time</div>
                            <div className="font-medium text-gray-800">{slot.time}</div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditEntry(slot)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit entry"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(slot.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete entry"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    No classes
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TimetableManagement;