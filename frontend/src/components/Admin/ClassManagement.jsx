 import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaSchool, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaChalkboardTeacher, FaBook, FaUserGraduate, FaEye, FaEyeSlash } from 'react-icons/fa';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStudents, setShowStudents] = useState(null);
  const [showTeachers, setShowTeachers] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

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

  const fetchClasses = () => {
    setLoading(true);
    api.get('/admin/classes')
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.classes);
        }
      })
      .catch(error => {
        console.error('Error fetching classes:', error);
        alert('Failed to load classes');
      })
      .finally(() => setLoading(false));
  };

  const fetchAllStudents = () => {
    api.get('/admin/classes/students')
      .then(res => {
        if (res.data.success) setAllStudents(res.data.students);
      })
      .catch(console.error);
  };

  const fetchAllTeachers = () => {
    api.get('/admin/classes/teachers')
      .then(res => {
        if (res.data.success) setAllTeachers(res.data.teachers);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
    fetchAllTeachers();
  }, []);

  const createClass = () => {
    if (!className.trim()) return alert('Class name is required');
    if (selectedSubjects.length === 0) return alert('Please select at least one subject');

    api.post('/admin/classes', { 
      name: className,
      subjects: selectedSubjects
    })
      .then(res => {
        if (res.data.success) {
          alert('Class created');
          setClassName('');
          setSelectedSubjects([]);
          fetchClasses();
        } else {
          alert(res.data.message || 'Failed to create class');
        }
      })
      .catch(() => alert('Failed to create class'));
  };

  const updateClass = () => {
    if (!editClassName.trim()) return alert('Class name is required');
    
    api.put(`/admin/classes/${editingClass._id}`, { name: editClassName })
      .then(res => {
        if (res.data.success) {
          alert('Class updated');
          setEditingClass(null);
          setEditClassName('');
          fetchClasses();
        } else {
          alert(res.data.message || 'Failed to update class');
        }
      })
      .catch(() => alert('Failed to update class'));
  };

  const deleteClass = (id) => {
    if (window.confirm('Are you sure to delete this class?')) {
      api.delete(`/admin/classes/${id}`)
        .then(res => {
          if (res.data.success) {
            alert('Class deleted');
            fetchClasses();
          } else alert(res.data.message);
        })
        .catch(() => alert('Failed to delete class'));
    }
  };

  const startEdit = (cls) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setEditClassName('');
  };

  const assignStudentToClass = (classId, className) => {
    if (!selectedStudent) return alert('Please select a student');
    
    const student = allStudents.find(s => s._id === selectedStudent);
    if (!student) return alert('Student not found');
    
    api.put(`/admin/students/${selectedStudent}`, {
      name: student.userId?.name,
      rollNo: student.rollNo,
      className: className
    })
    .then(res => {
      if (res.data.success) {
        alert('Student assigned to class');
        setSelectedStudent('');
        fetchClasses();
        fetchAllStudents();
      } else {
        alert(res.data.message || 'Failed to assign student');
      }
    })
    .catch(() => alert('Failed to assign student'));
  };

  const assignTeacherToClass = (classId, className) => {
    if (!selectedTeacher) return alert('Please select a teacher');
    
    const teacher = allTeachers.find(t => t._id === selectedTeacher);
    if (!teacher) return alert('Teacher not found');
    
    const currentClasses = teacher.assignedClasses || [];
    const newClasses = [...currentClasses, className];
    
    api.put(`/admin/teachers/${selectedTeacher}`, {
      name: teacher.userId?.name,
      teacherId: teacher.teacherId,
      email: teacher.userId?.email,
      subject: teacher.subject,
      assignedClasses: newClasses
    })
    .then(res => {
      if (res.data.success) {
        alert('Teacher assigned to class');
        setSelectedTeacher('');
        fetchClasses();
        fetchAllTeachers();
      } else {
        alert(res.data.message || 'Failed to assign teacher');
      }
    })
    .catch(() => alert('Failed to assign teacher'));
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
                <FaSchool className="mr-4 text-blue-600" />
                Class Management
              </h2>
              <p className="text-gray-600 text-lg">Organize classes, students, and teacher assignments</p>
            </div>
            <BackButton customClass="mb-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md" />
          </div>

          {/* Create Class Card */}
          <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <FaPlus className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 ml-4">Create New Class</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Name */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSchool className="inline mr-2" />
                  Class Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10-A, 11-B, 12-Science"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                />
              </div>

              {/* Subjects Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBook className="inline mr-2" />
                  Select Subjects
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-xl">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedSubjects([...selectedSubjects, subject]);
                          } else {
                            setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={createClass}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-2" />
                Create Class
              </button>
            </div>
          </div>

          {/* Classes List */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaSchool className="mr-3 text-blue-600" />
                  All Classes ({classes.length})
                </h3>
              </div>

              {classes.map(cls => (
                <div key={cls._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform hover:scale-[1.01] transition-all duration-300">
                  {/* Class Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                        <FaSchool className="text-xl text-white" />
                      </div>
                      <div className="ml-4">
                        {editingClass?._id === cls._id ? (
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={editClassName}
                              onChange={e => setEditClassName(e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                            />
                            <button
                              onClick={updateClass}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                            >
                              <FaSave className="mr-2" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                            >
                              <FaTimes className="mr-2" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{cls.name}</h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <FaBook className="mr-2" />
                              {cls.subjects ? `${cls.subjects.length} subjects` : 'No subjects assigned'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {editingClass?._id !== cls._id && (
                        <button
                          onClick={() => startEdit(cls)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteClass(cls._id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Class Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Students Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg shadow-md">
                            <FaUserGraduate className="text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 ml-3">
                            Students ({cls.strength || 0})
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowStudents(showStudents === cls._id ? null : cls._id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center text-sm"
                        >
                          {showStudents === cls._id ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                          {showStudents === cls._id ? 'Hide' : 'View'}
                        </button>
                      </div>
                      
                      {showStudents === cls._id && (
                        <div className="space-y-4">
                          {/* Add Student Form */}
                          <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                            <h5 className="font-bold mb-3 text-gray-800 flex items-center">
                              <FaPlus className="mr-2 text-green-600" />
                              Add Student to Class
                            </h5>
                            <div className="flex gap-3">
                              <select
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              >
                                <option value="">Select Student</option>
                                {allStudents
                                  .filter(s => s.className !== cls.name)
                                  .map(student => (
                                    <option key={student._id} value={student._id}>
                                      {student.userId?.name} (Roll: {student.rollNo})
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => assignStudentToClass(cls._id, cls.name)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                          
                          {/* Current Students */}
                          {cls.students && cls.students.length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="font-bold text-gray-800">Current Students:</h6>
                              {cls.students.map((student, index) => (
                                <div key={student._id || index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                                  <div className="flex items-center">
                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                      <FaUserGraduate className="text-green-600" />
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-800">{student.userId?.name || 'Unknown'}</span>
                                      <p className="text-sm text-gray-500">Roll: {student.rollNo}</p>
                                    </div>
                                  </div>
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {student.className}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">No students enrolled yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Teachers Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-lg shadow-md">
                            <FaChalkboardTeacher className="text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 ml-3">
                            Teachers ({cls.assignedTeachers?.length || 0})
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowTeachers(showTeachers === cls._id ? null : cls._id)}
                          className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center text-sm"
                        >
                          {showTeachers === cls._id ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                          {showTeachers === cls._id ? 'Hide' : 'View'}
                        </button>
                      </div>
                      
                      {showTeachers === cls._id && (
                        <div className="space-y-4">
                          {/* Add Teacher Form */}
                          <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                            <h5 className="font-bold mb-3 text-gray-800 flex items-center">
                              <FaPlus className="mr-2 text-purple-600" />
                              Add Teacher to Class
                            </h5>
                            <div className="flex gap-3">
                              <select
                                value={selectedTeacher}
                                onChange={e => setSelectedTeacher(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">Select Teacher</option>
                                {allTeachers
                                  .filter(t => !(t.assignedClasses || []).includes(cls.name))
                                  .map(teacher => (
                                    <option key={teacher._id} value={teacher._id}>
                                      {teacher.userId?.name} ({teacher.teacherId}) - {teacher.subject}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => assignTeacherToClass(cls._id, cls.name)}
                                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                          
                          {/* Current Teachers */}
                          {cls.assignedTeachers?.length > 0 ? (
                            <div className="space-y-2">
                              <h6 className="font-bold text-gray-800">Current Teachers:</h6>
                              {cls.assignedTeachers.map((teacher, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                                  <div className="flex items-center">
                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                      <FaChalkboardTeacher className="text-purple-600" />
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-800">{teacher.teacherId?.teacherId || 'Unknown'}</span>
                                      <p className="text-sm text-gray-500">{teacher.subject || 'No subject'}</p>
                                    </div>
                                  </div>
                                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {teacher.subject}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <FaChalkboardTeacher className="text-4xl text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">No teachers assigned yet</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {!classes.length && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaSchool className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Classes Found</h3>
                  <p className="text-gray-600 text-lg mb-6">Get started by creating your first class above!</p>
                  <button
                    onClick={() => document.querySelector('input[placeholder*="Class Name"]')?.focus()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" />
                    Create First Class
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

export default ClassManagement;
    