import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import api from '../../services/api';
import { messageApi } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import ConnectionErrorBanner from '../Common/ConnectionErrorBanner';
import LLMTutor from './LLMTutor';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { FaEnvelope, FaChartLine, FaTrophy, FaUserGraduate, FaCalendarCheck, FaBook, FaRobot, FaChartBar } from 'react-icons/fa';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [_attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isConnectionError, setIsConnectionError] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsConnectionError(false);
        
        // Fetch dashboard data
        const dashboardRes = await api.get('/student/dashboard');
        if (dashboardRes.data.success) {
          setStudentData(dashboardRes.data.student);
          // Set the leaderboard data from the dashboard response
          if (dashboardRes.data.leaderboard && Array.isArray(dashboardRes.data.leaderboard)) {
            setLeaderboard(dashboardRes.data.leaderboard);
            console.log('Leaderboard data:', dashboardRes.data.leaderboard);
          }
        }

        // Fetch performance data
        try {
          const performanceRes = await api.get('/student/performance');
          if (performanceRes.data.success) {
            setPerformanceData(performanceRes.data.data);
          }
        } catch (perfErr) {
          console.warn('Performance data not available:', perfErr);
        }

        // Fetch attendance data
        try {
          const attendanceRes = await api.get('/student/attendance');
          if (attendanceRes.data.success) {
            setAttendanceData(attendanceRes.data.data);
          }
        } catch (attErr) {
          console.warn('Attendance data not available:', attErr);
        }
        
        // Fetch unread message count
        try {
          const messagesRes = await messageApi.getUnreadCount();
          if (messagesRes.data.success) {
            setUnreadMessages(messagesRes.data.unreadCount);
          }
        } catch (msgErr) {
          console.warn('Message count not available:', msgErr);
        }

      } catch (err) {
        console.error('Error fetching student data:', err);
        if (err.isConnectionError) {
          setIsConnectionError(true);
          setError('Server connection issue. Please check your connection and try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load student data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Keep dashboard badge in sync when a message is viewed elsewhere
    const handleUnreadUpdate = (e) => {
      if (typeof e?.detail?.count === 'number') {
        setUnreadMessages(e.detail.count);
      } else {
        messageApi.getUnreadCount().then(r => {
          if (r.data?.success) setUnreadMessages(r.data.unreadCount);
        }).catch(() => {});
      }
    };
    window.addEventListener('unread-messages-updated', handleUnreadUpdate);
    return () => window.removeEventListener('unread-messages-updated', handleUnreadUpdate);
  }, []);

  if (loading) return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-4xl mx-auto w-full flex justify-center items-center">
          <LoadingSpinner text="Loading student data..." />
        </main>
      </div>
    </div>
  );
  
  if (error || !studentData) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-4xl mx-auto w-full">
            {isConnectionError ? (
              <ConnectionErrorBanner 
                message={error} 
                onRetry={() => window.location.reload()} 
              />
            ) : (
              <div className="bg-white rounded shadow p-6">
                <p className="text-red-500">{error || 'Failed to load student data. Please try logging in again.'}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  const { 
    name = 'Student',
    rollNo = 'N/A',
    className = 'N/A',
    overallPercentage = 0,
    attendancePercentage = 0,
    rank = 'N/A'
  } = studentData || {};

  // Prepare chart data
  const attendancePieData = [
    { name: 'Present', value: attendancePercentage, color: '#10B981' },
    { name: 'Absent', value: 100 - attendancePercentage, color: '#EF4444' }
  ];

  const performanceBarData = performanceData?.subjects?.map(subject => ({
    subject,
    marks: performanceData.subjectWiseMarks?.[subject] || 0,
    attendance: performanceData.attendanceBySubject?.[subject] || 0
  })) || [];

  // Removed unused overallStatsData to resolve ESLint warning

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        {studentData?.name && (
          <div className="bg-white bg-opacity-80 rounded-xl shadow-sm mx-8 mt-4 px-6 py-3 text-lg font-semibold text-blue-700">
            Welcome, {studentData.name}!
          </div>
        )}
        <main className="p-8 max-w-7xl mx-auto w-full">
          <BackButton customClass="mb-4" />
          
          {/* Hero section with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome, {name}</h2>
                <p className="text-blue-100">Roll No: {rollNo} | Class: {className}</p>
                {rank && rank !== 'N/A' && (
                  <div className="mt-2 inline-flex items-center bg-yellow-500 text-white px-3 py-1 rounded-full">
                    <FaTrophy className="mr-1" /> Rank #{rank} in class
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3 backdrop-filter backdrop-blur-sm">
                  <div className="text-3xl font-bold">{overallPercentage}%</div>
                  <div className="text-xs uppercase tracking-wide">Performance</div>
                </div>
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3 backdrop-filter backdrop-blur-sm">
                  <div className="text-3xl font-bold">{attendancePercentage}%</div>
                  <div className="text-xs uppercase tracking-wide">Attendance</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Messages notification */}
          {unreadMessages > 0 && (
            <Link to="/student/messages" 
              className="bg-white rounded-lg shadow-lg p-4 mb-8 flex items-center hover:bg-blue-50 transform hover:scale-102 transition duration-300 border-l-4 border-blue-500">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4 relative">
                <FaEnvelope className="text-xl" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">You have {unreadMessages} new message{unreadMessages !== 1 ? 's' : ''}</p>
                <p className="text-sm text-gray-600">Click to view your messages</p>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Leaderboard Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaTrophy className="mr-2" /> Class Leaderboard
                </h3>
                <p className="text-yellow-100 text-sm">Top performers in your class</p>
              </div>
              <div className="p-5">
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="divide-y">
                    {leaderboard.map((student, index) => (
                      <div 
                        key={student.id} 
                        className={`py-3 flex items-center justify-between ${
                          student.id === studentData?._id ? 'bg-yellow-50 border-l-4 border-yellow-500 pl-2' : ''
                        } hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500' : 
                            index === 1 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400' :
                            index === 2 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-gray-500">Roll No: {student.rollNo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{student.percentage.toFixed(1)}%</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              student.attendance >= 90 ? 'bg-green-500' :
                              student.attendance >= 75 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></span>
                            <span>Attendance: {student.attendance}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FaTrophy className="text-yellow-300 text-4xl mb-3" />
                    <p className="text-gray-500 text-center">No leaderboard data available yet</p>
                    <p className="text-xs text-gray-400 mt-1">Check back after exams are graded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all hover:shadow-xl">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaCalendarCheck className="mr-2" /> Attendance Overview
                </h3>
                <p className="text-green-100 text-sm">Your current attendance record</p>
              </div>
              <div className="p-5 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall Performance */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaChartLine className="mr-2" /> Performance Overview
                </h3>
              </div>
              <div className="p-5 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="30%" 
                    outerRadius="100%" 
                    data={[{name: 'Overall', value: overallPercentage, fill: '#3B82F6'}]} 
                    startAngle={90} 
                    endAngle={-270}
                  >
                    <RadialBar
                      background
                      dataKey="value"
                      angleAxisId={0}
                      fill="#3B82F6"
                      cornerRadius={10}
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600">Overall Performance</p>
                  <p className="text-3xl font-bold text-blue-600">{overallPercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Subject Chart */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaBook className="mr-2" /> Subject Performance
              </h3>
            </div>
            <div className="p-5">
              {performanceBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceBarData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px', 
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar name="Marks (%)" dataKey="marks" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar name="Attendance (%)" dataKey="attendance" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <FaChartLine className="text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500">No subject performance data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Link to="/student/attendance" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Attendance</h4>
                  <p className="text-sm text-gray-600">View your attendance records</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <FaCalendarCheck className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold text-green-600">{attendancePercentage}%</span>
                <span className="text-gray-500 text-sm ml-2">Present</span>
              </div>
            </Link>
            
            <Link to="/student/performance" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Performance</h4>
                  <p className="text-sm text-gray-600">View detailed performance</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaChartLine className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold text-blue-600">{overallPercentage}%</span>
                <span className="text-gray-500 text-sm ml-2">Overall</span>
              </div>
            </Link>
            
            <Link to="/student/report" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Report Card</h4>
                  <p className="text-sm text-gray-600">View your progress report</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                  <FaUserGraduate className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-purple-600">View detailed report</span>
              </div>
            </Link>
            
            <Link to="/student/messages" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Messages</h4>
                  <p className="text-sm text-gray-600">View your messages</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 relative">
                  <FaEnvelope className="text-xl" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-yellow-600">{unreadMessages} unread messages</span>
              </div>
            </Link>

            <Link to="/student/ai-insights" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">AI Insights</h4>
                  <p className="text-sm text-gray-600">Get personalized learning recommendations</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                  <FaRobot className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-indigo-600">AI learning assistant</span>
              </div>
            </Link>

            <Link to="/student/analytics" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Visualize Analytics</h4>
                  <p className="text-sm text-gray-600">View your learning patterns</p>
                </div>
                <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                  <FaChartBar className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-teal-600">Track your progress</span>
              </div>
            </Link>

            <Link to="/student/ai-insights" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">AI Insights</h4>
                  <p className="text-sm text-gray-600">Get personalized learning recommendations</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                  <FaRobot className="text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-indigo-600">Improve your skills</span>
              </div>
            </Link>
          </div>
        </main>
      </div>
      
      {/* Floating AI Chat Assistant */}
      <LLMTutor performanceData={performanceData} studentData={studentData} isFloating={true} />
    </div>
  );
};

export default StudentDashboard;
