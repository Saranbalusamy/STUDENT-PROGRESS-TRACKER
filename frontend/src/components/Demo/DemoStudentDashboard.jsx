import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo data - not connected to database
const demoData = {
  student: {
    name: "Demo Student",
    rollNo: "DEMO101",
    className: "10A",
    attendancePercentage: 92,
    overallPercentage: 87,
    rank: 3
  },
  leaderboard: [
    { name: "John Smith", rollNo: "101", percentage: 94, attendance: 98 },
    { name: "Sarah Johnson", rollNo: "102", percentage: 91, attendance: 95 },
    { name: "Demo Student", rollNo: "DEMO101", percentage: 87, attendance: 92 },
    { name: "Mike Thompson", rollNo: "103", percentage: 85, attendance: 88 },
    { name: "Emily Davis", rollNo: "104", percentage: 82, attendance: 90 }
  ],
  recentActivity: [
    { date: "2025-09-18", subject: "Mathematics", activity: "Test score: 92/100" },
    { date: "2025-09-17", subject: "Science", activity: "Assignment submitted" },
    { date: "2025-09-15", subject: "English", activity: "Attendance marked present" }
  ],
  subjects: [
    { name: "Mathematics", marks: 92, attendance: 94 },
    { name: "Science", marks: 88, attendance: 90 },
    { name: "English", marks: 85, attendance: 95 },
    { name: "History", marks: 78, attendance: 89 },
    { name: "Computer Science", marks: 95, attendance: 92 }
  ]
};

const DemoStudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if this is a valid demo session
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
    if (!demoSession.isDemo || demoSession.demoRole !== 'student') {
      navigate('/demo');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white text-center py-2">
        DEMO MODE - This is a demonstration with sample data. No changes will be saved.
      </div>
      
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar demoMode={true} />
        
        <main className="p-8 max-w-7xl mx-auto w-full mt-12">
          {/* Hero section with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome, {demoData.student.name}</h2>
                <p className="text-blue-100">Roll No: {demoData.student.rollNo} | Class: {demoData.student.className}</p>
                <div className="mt-2 inline-flex items-center bg-yellow-500 text-white px-3 py-1 rounded-full">
                  <div className="mr-1">🏆</div> Rank #{demoData.student.rank} in class
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3 backdrop-filter backdrop-blur-sm">
                  <div className="text-3xl font-bold">{demoData.student.overallPercentage}%</div>
                  <div className="text-xs uppercase tracking-wide">Performance</div>
                </div>
                <div className="text-center bg-white bg-opacity-20 rounded-lg p-3 backdrop-filter backdrop-blur-sm">
                  <div className="text-3xl font-bold">{demoData.student.attendancePercentage}%</div>
                  <div className="text-xs uppercase tracking-wide">Attendance</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-800">Performance</h3>
                <p className="text-sm text-gray-600">View detailed performance analytics</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-800">Attendance</h3>
                <p className="text-sm text-gray-600">Track your attendance record</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-800">AI Tutor</h3>
                <p className="text-sm text-gray-600">Get personalized learning help</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="font-semibold text-gray-800">AI Insights</h3>
                <p className="text-sm text-gray-600">Discover learning insights</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Class Leaderboard */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-600 mr-2 text-xl">🏆</div>
                <h3 className="text-xl font-semibold text-gray-800">Class Leaderboard</h3>
              </div>
              <div className="overflow-auto max-h-60">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demoData.leaderboard.map((student, index) => (
                      <tr key={index} className={`${student.rollNo === "DEMO101" ? "bg-yellow-50 border-l-4 border-yellow-400" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">Roll: {student.rollNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.percentage}%</div>
                          <div className="text-sm text-gray-500">{student.attendance}% attendance</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-blue-600 mr-2 text-xl">📚</div>
                <h3 className="text-xl font-semibold text-gray-800">Subject Performance</h3>
              </div>
              <div className="space-y-4">
                {demoData.subjects.map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <span className="text-sm text-gray-500">{subject.marks}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.marks}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Attendance: {subject.attendance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center p-4">
            <button 
              onClick={() => { sessionStorage.removeItem('demoSession'); navigate('/demo'); }}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all"
            >
              Exit Demo
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoStudentDashboard;