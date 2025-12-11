 import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import api from '../../services/api';
import { messageApi } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ConnectionErrorBanner from '../Common/ConnectionErrorBanner';
import TeacherAssistant from './TeacherAssistant';
import { FaUserGraduate, FaBook, FaCalendarAlt, FaChalkboardTeacher, FaExclamationTriangle, FaClock, FaEnvelope } from 'react-icons/fa';

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isConnectionError, setIsConnectionError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsConnectionError(false);
        
        const [dashboardRes, messagesRes] = await Promise.all([
          api.get('/teacher/dashboard'),
          messageApi.getUnreadCount()
        ]);
        
        if (dashboardRes.data.success) {
          setTeacherData(dashboardRes.data.teacher);
        }
        
        if (messagesRes.data.success) {
          setUnreadMessages(messagesRes.data.unreadCount);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.isConnectionError) {
          setIsConnectionError(true);
          setError('Server connection issue. Please check your connection and try again.');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for unread count updates triggered by MessageView
    const handleUnreadUpdate = (e) => {
      if (typeof e?.detail?.count === 'number') {
        setUnreadMessages(e.detail.count);
      } else {
        // Fallback: refetch count
        messageApi.getUnreadCount().then(r => {
          if (r.data?.success) setUnreadMessages(r.data.unreadCount);
        }).catch(() => {});
      }
    };
    window.addEventListener('unread-messages-updated', handleUnreadUpdate);
    return () => window.removeEventListener('unread-messages-updated', handleUnreadUpdate);
  }, []);

  if (loading) return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-full">
          {isConnectionError ? (
            <ConnectionErrorBanner 
              message={error} 
              onRetry={() => window.location.reload()} 
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
              <p className="text-gray-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const { 
    name, 
    subject, 
    totalStudents, 
    todayClasses, 
    assignedClasses = [],
    lowMarksStudents = [],
    lowAttendanceStudents = []
  } = teacherData || {};

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        {teacherData?.name && (
          <div className="bg-white bg-opacity-80 rounded-xl shadow-sm mx-8 mt-4 px-6 py-3 text-lg font-semibold text-blue-700">
            Welcome, {teacherData.name}!
          </div>
        )}
        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h2>
              <p className="text-lg text-gray-600 mt-1">Welcome, {name}</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white py-2 px-4 rounded-full shadow-sm">
              <span className="font-medium text-indigo-600">Subject: {subject}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaUserGraduate className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <FaBook className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Assigned Classes</p>
                  <p className="text-2xl font-bold text-gray-800">{assignedClasses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Today's Classes</p>
                  <p className="text-2xl font-bold text-gray-800">{todayClasses}</p>
                </div>
              </div>
            </div>

            <Link to="/teacher/messages" className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4 relative">
                  <FaEnvelope className="text-xl" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Messages</p>
                  <p className="text-2xl font-bold text-gray-800">{unreadMessages > 0 ? `${unreadMessages} new` : 'Inbox'}</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assigned Classes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaChalkboardTeacher className="text-indigo-600 mr-2 text-xl" />
                <h3 className="text-xl font-semibold text-gray-800">Assigned Classes</h3>
              </div>
              <div className="overflow-auto max-h-60">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedClasses.map((cls, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {typeof cls === 'string' ? cls : (cls.className || cls.name || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof cls === 'object' ? (cls.studentCount || cls.studentsCount || 0) : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students with Low Attendance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaClock className="text-amber-600 mr-2 text-xl" />
                <h3 className="text-xl font-semibold text-gray-800">Students with Low Attendance</h3>
              </div>
              <div className="overflow-auto max-h-60">
                {lowAttendanceStudents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowAttendanceStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.className}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.attendance < 75 ? 'bg-red-100 text-red-800' : 
                                  student.attendance < 85 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {student.attendance}%
                                </span>
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    student.attendance < 75 ? 'bg-red-600' : 
                                    student.attendance < 85 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  }`} 
                                  style={{ width: `${student.attendance}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No attendance data available</p>
                )}
              </div>
            </div>

            {/* Students with Low Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-red-600 mr-2 text-xl" />
                <h3 className="text-xl font-semibold text-gray-800">Students with Low Performance</h3>
              </div>
              <div className="overflow-auto max-h-60">
                {lowMarksStudents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Marks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowMarksStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.className}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.avgMarks < 35 ? 'bg-red-100 text-red-800' : 
                              student.avgMarks < 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {student.avgMarks}/100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No performance data available</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href="/teacher/attendance" 
                  className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition duration-200"
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Take Attendance</p>
                    <p className="text-sm text-gray-500">Record student attendance for today</p>
                  </div>
                </a>
                
                <a 
                  href="/teacher/marks" 
                  className="flex items-center p-4 border rounded-lg hover:bg-green-50 transition duration-200"
                >
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FaBook className="text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Enter Marks</p>
                    <p className="text-sm text-gray-500">Update student performance records</p>
                  </div>
                </a>
                
                <a 
                  href="/teacher/timetable" 
                  className="flex items-center p-4 border rounded-lg hover:bg-purple-50 transition duration-200"
                >
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Timetable</p>
                    <p className="text-sm text-gray-500">Check your teaching schedule</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating AI Assistant */}
      <TeacherAssistant teacherData={teacherData} isFloating={true} />
    </div>
  );
};

export default TeacherDashboard;
