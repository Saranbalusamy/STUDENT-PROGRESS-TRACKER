import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo data - not connected to database
const demoData = {
  teacher: {
    name: "Demo Teacher",
    teacherId: "DEMO001",
    subject: "Mathematics",
    assignedClasses: ["10A", "10B", "9A"]
  },
  students: [
    { id: 1, name: "John Smith", rollNo: "101", className: "10A", attendance: 98, marks: 92 },
    { id: 2, name: "Sarah Johnson", rollNo: "102", className: "10A", attendance: 95, marks: 89 },
    { id: 3, name: "Demo Student", rollNo: "DEMO101", className: "10A", attendance: 92, marks: 87 },
    { id: 4, name: "Mike Thompson", rollNo: "103", className: "10A", attendance: 88, marks: 85 },
    { id: 5, name: "Emily Davis", rollNo: "104", className: "10A", attendance: 90, marks: 82 },
    { id: 6, name: "Daniel Wilson", rollNo: "105", className: "10B", attendance: 94, marks: 90 },
    { id: 7, name: "Olivia Brown", rollNo: "106", className: "10B", attendance: 96, marks: 94 },
    { id: 8, name: "Ethan Martin", rollNo: "107", className: "10B", attendance: 91, marks: 88 },
    { id: 9, name: "Sophia Garcia", rollNo: "108", className: "9A", attendance: 93, marks: 86 },
    { id: 10, name: "James Rodriguez", rollNo: "109", className: "9A", attendance: 89, marks: 83 }
  ],
  recentActivity: [
    { date: "2025-09-18", class: "10A", activity: "Marked attendance" },
    { date: "2025-09-17", class: "10B", activity: "Graded test papers" },
    { date: "2025-09-15", class: "9A", activity: "Created weekly assignment" }
  ],
  schedule: [
    { day: "Monday", periods: [
      { time: "9:00 - 10:00", class: "10A", subject: "Mathematics" },
      { time: "11:00 - 12:00", class: "9A", subject: "Mathematics" }
    ]},
    { day: "Tuesday", periods: [
      { time: "9:00 - 10:00", class: "10B", subject: "Mathematics" }
    ]},
    { day: "Wednesday", periods: [
      { time: "10:00 - 11:00", class: "10A", subject: "Mathematics" },
      { time: "2:00 - 3:00", class: "10B", subject: "Mathematics" }
    ]},
    { day: "Thursday", periods: [
      { time: "11:00 - 12:00", class: "9A", subject: "Mathematics" }
    ]},
    { day: "Friday", periods: [
      { time: "9:00 - 10:00", class: "10A", subject: "Mathematics" },
      { time: "1:00 - 2:00", class: "10B", subject: "Mathematics" }
    ]}
  ]
};

const DemoTeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if this is a valid demo session
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
    if (!demoSession.isDemo || demoSession.demoRole !== 'teacher') {
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

  // (removed unused filteredStudents)

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white text-center py-2">
        DEMO MODE - This is a demonstration with sample data. No changes will be saved.
      </div>
      
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar demoMode={true} />
        
        <main className="p-8 max-w-7xl mx-auto w-full mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Teacher Dashboard (Demo)</h2>
              <p className="text-lg text-gray-600 mt-1">Welcome, {demoData.teacher.name}</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white py-2 px-4 rounded-full shadow-sm">
              <span className="font-medium text-indigo-600">Subject: {demoData.teacher.subject}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <div className="text-xl">👥</div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {demoData.students.filter(s => demoData.teacher.assignedClasses.includes(s.className)).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <div className="text-xl">📚</div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Assigned Classes</p>
                  <p className="text-2xl font-bold text-gray-800">{demoData.teacher.assignedClasses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <div className="text-xl">📅</div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Today's Classes</p>
                  <p className="text-2xl font-bold text-gray-800">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition transform hover:scale-105 duration-300 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <div className="text-xl">📧</div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Messages</p>
                  <p className="text-2xl font-bold text-gray-800">5 new</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assigned Classes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-indigo-600 mr-2 text-xl">👨‍🏫</div>
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
                    {demoData.teacher.assignedClasses.map((cls, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cls}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {demoData.students.filter(s => s.className === cls).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students Needing Attention */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-red-600 mr-2 text-xl">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800">Students Needing Attention</h3>
              </div>
              <div className="overflow-auto max-h-60">
                <div className="space-y-3">
                  {demoData.students
                    .filter(student => student.marks < 85 || student.attendance < 90)
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.className} - Roll No: {student.rollNo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600">
                            Marks: {student.marks}% | Attendance: {student.attendance}%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Schedule */}
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Weekly Schedule</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Day</th>
                      <th className="text-left py-2">Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.schedule.map((day, index) => (
                      <tr key={index}>
                        <td className="py-3 font-medium">{day.day}</td>
                        <td className="py-3">
                          {day.periods.map((period, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                              <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md mr-2">
                                {period.time}
                              </span>
                              <span className="text-gray-700">
                                Class {period.class} - {period.subject}
                              </span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center p-4">
            <button 
              onClick={() => { sessionStorage.removeItem('demoSession'); navigate('/demo'); }}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all"
            >
              Exit Demo
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoTeacherDashboard;