 import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaUserGraduate, FaUserPlus, FaEdit, FaTrash, FaSave, FaTimes, FaIdCard, FaSchool, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', password: '', className: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudent, setEditStudent] = useState({ name: '', rollNo: '', className: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    api.get('/admin/students')
      .then(res => {
        if (res.data.success) setStudents(res.data.students);
      })
      .finally(() => setLoading(false));
  };

  const fetchClasses = () => {
    api.get('/admin/classes').then(res => {
      if (res.data.success) setClasses(res.data.classes.map(cls => cls.name));
    });
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleChange = (field, value) => {
    setNewStudent(prev => ({ ...prev, [field]: value }));
  };

  const createStudent = () => {
    const { name, rollNo, password, className } = newStudent;
    if (!name || !rollNo || !password || !className) return alert('All fields are required');
    api.post('/admin/students', newStudent)
      .then(res => {
        if (res.data.success) {
          alert('Student added');
          setNewStudent({ name: '', rollNo: '', password: '', className: '' });
          fetchStudents();
        } else {
          alert(res.data.message || 'Failed to add student');
        }
      })
      .catch(() => alert('Failed to add student'));
  };

  const updateStudent = () => {
    const { name, rollNo, className } = editStudent;
    if (!name || !rollNo || !className) return alert('All fields are required');
    
    api.put(`/admin/students/${editingStudent._id}`, editStudent)
      .then(res => {
        if (res.data.success) {
          alert('Student updated');
          setEditingStudent(null);
          setEditStudent({ name: '', rollNo: '', className: '' });
          fetchStudents();
        } else {
          alert(res.data.message || 'Failed to update student');
        }
      })
      .catch(() => alert('Failed to update student'));
  };

  const deleteStudent = (id) => {
    if (window.confirm('Are you sure to delete this student?')) {
      api.delete(`/admin/students/${id}`)
        .then(res => {
          if (res.data.success) {
            alert('Student deleted');
            fetchStudents();
          } else {
            alert(res.data.message || 'Failed to delete student');
          }
        })
        .catch(() => alert('Failed to delete student'));
    }
  };

  const startEdit = (student) => {
    setEditingStudent(student);
    setEditStudent({
      name: student.userId?.name || '',
      rollNo: student.rollNo,
      className: student.className
    });
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setEditStudent({ name: '', rollNo: '', className: '' });
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
                <FaUserGraduate className="mr-4 text-purple-600" />
                Student Management
              </h2>
              <p className="text-gray-600 text-lg">Manage student records and enrollments</p>
            </div>
            <BackButton customClass="mb-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md" />
          </div>

          {/* Add New Student Card */}
          <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-xl shadow-lg">
                <FaUserPlus className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 ml-4">Add New Student</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUserGraduate className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter student's full name"
                  value={newStudent.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Roll Number Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaIdCard className="inline mr-2" />
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter unique roll number"
                  value={newStudent.rollNo}
                  onChange={e => handleChange('rollNo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLock className="inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create secure password"
                    value={newStudent.password}
                    onChange={e => handleChange('password', e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
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

              {/* Class Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSchool className="inline mr-2" />
                  Assign to Class
                </label>
                <select
                  value={newStudent.className}
                  onChange={e => handleChange('className', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none mt-8">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={createStudent}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                <FaUserPlus className="mr-2" />
                {loading ? 'Adding Student...' : 'Add Student'}
              </button>
            </div>
          </div>

          {/* Students List */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaUserGraduate className="mr-3 text-purple-600" />
                  Enrolled Students ({students.length})
                </h3>
              </div>

              {students.map(student => (
                <div key={student._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-[1.01] transition-all duration-300">
                  {editingStudent?._id === student._id ? (
                    /* Edit Mode */
                    <div className="space-y-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                          <FaEdit className="text-xl text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 ml-3">Edit Student</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            placeholder="Name"
                            value={editStudent.name}
                            onChange={e => setEditStudent(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                          <input
                            type="text"
                            placeholder="Roll No"
                            value={editStudent.rollNo}
                            onChange={e => setEditStudent(prev => ({ ...prev, rollNo: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                          <select
                            value={editStudent.className}
                            onChange={e => setEditStudent(prev => ({ ...prev, className: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Class</option>
                            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={updateStudent}
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
                          <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 rounded-xl shadow-lg">
                            <FaUserGraduate className="text-xl text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-2xl font-bold text-gray-800">{student.userId?.name || 'Unknown'}</h4>
                            <p className="text-gray-600 flex items-center mt-1">
                              <FaIdCard className="mr-2" />
                              Roll No: {student.rollNo}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Class Assignment</p>
                            <p className="font-medium text-gray-800 flex items-center">
                              <FaSchool className="mr-2 text-gray-400" />
                              {student.className || 'Not assigned'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Student Status</p>
                            <p className="font-medium text-gray-800 flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Active Student
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => startEdit(student)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStudent(student._id)}
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
              
              {!students.length && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserGraduate className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Students Found</h3>
                  <p className="text-gray-600 text-lg mb-6">Get started by adding your first student above!</p>
                  <button
                    onClick={() => document.querySelector('input[placeholder="Enter student\'s full name"]')?.focus()}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto"
                  >
                    <FaUserPlus className="mr-2" />
                    Add First Student
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

export default StudentManagement;
