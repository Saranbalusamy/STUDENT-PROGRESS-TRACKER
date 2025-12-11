 import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaChalkboardTeacher, FaUserPlus, FaEdit, FaTrash, FaSave, FaTimes, FaIdCard, FaEnvelope, FaBook, FaSchool, FaEye, FaEyeSlash } from 'react-icons/fa';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ name: '', teacherId: '', email: '', password: '', subject: '', assignedClasses: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState({ name: '', teacherId: '', email: '', subject: '', assignedClasses: '' });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const subjects = [
    'Tamil',
    'English',
    'Mathematics',
    'Science',
    'Social Science',
    'Computer Science',
    'Botany',
    'Zoology',
    'Commerce',
    'Economics',
    'Accountancy',
    'Business Mathematics',
    'Computer Application'
  ];

  const fetchTeachers = () => {
    setLoading(true);
    api.get('/admin/teachers')
      .then(res => {
        if (res.data.success) setTeachers(res.data.teachers);
      })
      .catch(error => {
        console.error('Error fetching teachers:', error);
        alert('Failed to load teachers: ' + (error.response?.data?.message || error.message));
      })
      .finally(() => setLoading(false));
  };

  const fetchClasses = () => {
    api.get('/admin/classes')
      .then(res => {
        if (res.data.success) setClasses(res.data.classes.map(cls => cls.name));
      })
      .catch(error => {
        console.error('Error fetching classes:', error);
        alert('Failed to load classes: ' + (error.response?.data?.message || error.message));
      });
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const handleChange = (field, value) => {
    setNewTeacher(prev => ({ ...prev, [field]: value }));
  };

  const createTeacher = () => {
    try {
      const { name, teacherId, email, password, subject, assignedClasses } = newTeacher;
      
      // Validate required fields
      if (!name || !teacherId || !email || !password || !subject) {
        alert('All fields are required');
        return;
      }

      // Validate name (at least 3 characters)
      if (name.trim().length < 3) {
        alert('Name must be at least 3 characters long');
        return;
      }

      // Validate teacherId format (alphanumeric characters and hyphens)
      const teacherIdRegex = /^[a-zA-Z0-9-]+$/;
      if (!teacherIdRegex.test(teacherId)) {
        alert('Teacher ID should only contain letters, numbers, and hyphens');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Validate subject
      if (!subjects.includes(subject)) {
        alert('Please select a valid subject');
        return;
      }

      // Parse and validate assigned classes
      let assignedClassesArray = [];
      if (assignedClasses) {
        assignedClassesArray = assignedClasses.split(',')
          .map(c => c.trim())
          .filter(Boolean);
      }
    setLoading(true);
    api.post('/admin/teachers', { 
      name: name.trim(),
      teacherId: teacherId.trim(),
      email: email.trim(),
      password,
      subject,
      assignedClasses: assignedClassesArray 
    })
    .then(res => {
      if (res.data.success) {
        alert('Teacher added successfully');
        setNewTeacher({ name: '', teacherId: '', email: '', password: '', subject: '', assignedClasses: '' });
        fetchTeachers();
      } else {
        alert(res.data.message || 'Failed to add teacher');
      }
    })
    .catch(error => {
      console.error('Error creating teacher:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add teacher';
      alert(`Error: ${errorMessage}`);
    })
    .finally(() => {
      setLoading(false);
    });
  } catch (error) {
    console.error('Form validation error:', error);
    alert('Please check all fields and try again');
  }
  };

  const updateTeacher = () => {
    const { name, teacherId, email, subject, assignedClasses } = editTeacher;
    if (!name || !teacherId || !email || !subject) return alert('All fields are required');
    const assignedClassesArray = assignedClasses.split(',').map(c => c.trim()).filter(Boolean);
    
    api.put(`/admin/teachers/${editingTeacher._id}`, { ...editTeacher, assignedClasses: assignedClassesArray })
      .then(res => {
        if (res.data.success) {
          alert('Teacher updated');
          setEditingTeacher(null);
          setEditTeacher({ name: '', teacherId: '', email: '', subject: '', assignedClasses: '' });
          fetchTeachers();
        } else {
          alert(res.data.message || 'Failed to update teacher');
        }
      })
      .catch(() => alert('Failed to update teacher'));
  };

  const deleteTeacher = (id) => {
    if (window.confirm('Are you sure to delete this teacher?')) {
      api.delete(`/admin/teachers/${id}`)
        .then(res => {
          if (res.data.success) {
            alert('Teacher deleted');
            fetchTeachers();
          } else {
            alert(res.data.message || 'Failed to delete teacher');
          }
        })
        .catch(() => alert('Failed to delete teacher'));
    }
  };

  const startEdit = (teacher) => {
    setEditingTeacher(teacher);
    setEditTeacher({
      name: teacher.userId?.name || '',
      teacherId: teacher.teacherId,
      email: teacher.userId?.email || '',
      subject: teacher.subject,
      assignedClasses: (teacher.assignedClasses || []).join(', ')
    });
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setEditTeacher({ name: '', teacherId: '', email: '', subject: '', assignedClasses: '' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <FaChalkboardTeacher className="mr-4 text-green-600" />
                Teacher Management
              </h2>
              <p className="text-gray-600 text-lg">Manage faculty members and their assignments</p>
            </div>
            <BackButton customClass="mb-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md" />
          </div>

          {/* Add New Teacher Card */}
          <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
                <FaUserPlus className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 ml-4">Add New Teacher</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaChalkboardTeacher className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter teacher's full name"
                  value={newTeacher.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Teacher ID Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaIdCard className="inline mr-2" />
                  Teacher ID
                </label>
                <input
                  type="text"
                  placeholder="Unique teacher identifier"
                  value={newTeacher.teacherId}
                  onChange={e => handleChange('teacherId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="teacher@school.edu"
                  value={newTeacher.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create secure password"
                    value={newTeacher.password}
                    onChange={e => handleChange('password', e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subject Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBook className="inline mr-2" />
                  Subject
                </label>
                <select
                  value={newTeacher.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Classes */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSchool className="inline mr-2" />
                  Assigned Classes
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10-A, 11-B (comma separated)"
                  value={newTeacher.assignedClasses}
                  onChange={e => handleChange('assignedClasses', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>
            </div>

            {/* Class Checkboxes */}
            {classes.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <FaSchool className="inline mr-2" />
                  Available Classes (Select Multiple):
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {classes.map(className => (
                    <label key={className} className="flex items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeacher.assignedClasses.split(',').map(c => c.trim()).includes(className)}
                        onChange={e => {
                          const currentClasses = newTeacher.assignedClasses.split(',').map(c => c.trim()).filter(Boolean);
                          if (e.target.checked) {
                            if (!currentClasses.includes(className)) {
                              handleChange('assignedClasses', [...currentClasses, className].join(', '));
                            }
                          } else {
                            handleChange('assignedClasses', currentClasses.filter(c => c !== className).join(', '));
                          }
                        }}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{className}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={createTeacher}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                <FaUserPlus className="mr-2" />
                {loading ? 'Adding Teacher...' : 'Add Teacher'}
              </button>
            </div>
          </div>

          {/* Teachers List */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaChalkboardTeacher className="mr-3 text-green-600" />
                  Faculty Members ({teachers.length})
                </h3>
              </div>

              {teachers.map(teacher => (
                <div key={teacher._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-[1.01] transition-all duration-300">
                  {editingTeacher?._id === teacher._id ? (
                    /* Edit Mode */
                    <div className="space-y-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                          <FaEdit className="text-xl text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 ml-3">Edit Teacher</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Name"
                          value={editTeacher.name}
                          onChange={e => setEditTeacher(prev => ({ ...prev, name: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Teacher ID"
                          value={editTeacher.teacherId}
                          onChange={e => setEditTeacher(prev => ({ ...prev, teacherId: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={editTeacher.email}
                          onChange={e => setEditTeacher(prev => ({ ...prev, email: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={editTeacher.subject}
                          onChange={e => setEditTeacher(prev => ({ ...prev, subject: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Classes (comma separated)"
                          value={editTeacher.assignedClasses}
                          onChange={e => setEditTeacher(prev => ({ ...prev, assignedClasses: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                        />
                      </div>
                      
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={updateTeacher}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaSave className="mr-2" />
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaTimes className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                            <FaChalkboardTeacher className="text-xl text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-2xl font-bold text-gray-800">{teacher.userId?.name || 'Unknown'}</h4>
                            <p className="text-gray-600 flex items-center mt-1">
                              <FaIdCard className="mr-2" />
                              ID: {teacher.teacherId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="font-medium text-gray-800 flex items-center">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              {teacher.userId?.email || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Subject</p>
                            <p className="font-medium text-gray-800 flex items-center">
                              <FaBook className="mr-2 text-gray-400" />
                              {teacher.subject}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Assigned Classes</p>
                            <p className="font-medium text-gray-800 flex items-center">
                              <FaSchool className="mr-2 text-gray-400" />
                              {(teacher.assignedClasses || []).join(', ') || 'None assigned'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => startEdit(teacher)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTeacher(teacher._id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaTrash className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {!teachers.length && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaChalkboardTeacher className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Teachers Found</h3>
                  <p className="text-gray-600 text-lg mb-6">Get started by adding your first teacher above!</p>
                  <button
                    onClick={() => document.querySelector('input[placeholder="Enter teacher\'s full name"]')?.focus()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto"
                  >
                    <FaUserPlus className="mr-2" />
                    Add First Teacher
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherManagement;
