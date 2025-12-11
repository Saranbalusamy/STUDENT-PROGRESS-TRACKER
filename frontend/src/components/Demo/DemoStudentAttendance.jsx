import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { FaCheckCircle, FaTimesCircle, FaRegCalendarCheck, FaRegCalendarTimes } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Demo data
const demoAttendanceData = {
  'Mathematics': {
    subject: 'Mathematics',
    present: 45,
    absent: 3,
    total: 48,
    percentage: 94,
    records: [
      { date: '2025-09-01', status: 'present' },
      { date: '2025-09-03', status: 'present' },
      { date: '2025-09-05', status: 'present' },
      { date: '2025-09-08', status: 'present' },
      { date: '2025-09-10', status: 'present' },
      { date: '2025-09-12', status: 'absent' },
      { date: '2025-09-15', status: 'present' },
      { date: '2025-09-17', status: 'present' },
      { date: '2025-09-19', status: 'present' }
    ]
  },
  'Science': {
    subject: 'Science',
    present: 43,
    absent: 5,
    total: 48,
    percentage: 90,
    records: [
      { date: '2025-09-01', status: 'present' },
      { date: '2025-09-03', status: 'absent' },
      { date: '2025-09-05', status: 'present' },
      { date: '2025-09-08', status: 'present' },
      { date: '2025-09-10', status: 'present' },
      { date: '2025-09-12', status: 'present' },
      { date: '2025-09-15', status: 'present' },
      { date: '2025-09-17', status: 'absent' },
      { date: '2025-09-19', status: 'present' }
    ]
  },
  'English': {
    subject: 'English',
    present: 46,
    absent: 2,
    total: 48,
    percentage: 95,
    records: [
      { date: '2025-09-02', status: 'present' },
      { date: '2025-09-04', status: 'present' },
      { date: '2025-09-06', status: 'present' },
      { date: '2025-09-09', status: 'present' },
      { date: '2025-09-11', status: 'present' },
      { date: '2025-09-13', status: 'absent' },
      { date: '2025-09-16', status: 'present' },
      { date: '2025-09-18', status: 'present' },
      { date: '2025-09-20', status: 'present' }
    ]
  },
  'History': {
    subject: 'History',
    present: 43,
    absent: 5,
    total: 48,
    percentage: 89,
    records: [
      { date: '2025-09-02', status: 'present' },
      { date: '2025-09-04', status: 'absent' },
      { date: '2025-09-06', status: 'present' },
      { date: '2025-09-09', status: 'present' },
      { date: '2025-09-11', status: 'present' },
      { date: '2025-09-13', status: 'present' },
      { date: '2025-09-16', status: 'absent' },
      { date: '2025-09-18', status: 'present' },
      { date: '2025-09-20', status: 'present' }
    ]
  },
  'Computer Science': {
    subject: 'Computer Science',
    present: 44,
    absent: 4,
    total: 48,
    percentage: 92,
    records: [
      { date: '2025-09-02', status: 'present' },
      { date: '2025-09-04', status: 'present' },
      { date: '2025-09-06', status: 'absent' },
      { date: '2025-09-09', status: 'present' },
      { date: '2025-09-11', status: 'present' },
      { date: '2025-09-13', status: 'present' },
      { date: '2025-09-16', status: 'present' },
      { date: '2025-09-18', status: 'absent' },
      { date: '2025-09-20', status: 'present' }
    ]
  }
};

const DemoStudentAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [selectedYear, setSelectedYear] = useState(2025); // Demo year
  const [overallStats, setOverallStats] = useState({ present: 0, absent: 0, percentage: 0 });

  // Calculate overall stats
  useEffect(() => {
    // Check if this is a valid demo session
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
    if (!demoSession.isDemo || demoSession.demoRole !== 'student') {
      navigate('/demo');
      return;
    }
    
    // Calculate overall attendance stats
    let totalPresent = 0;
    let totalDays = 0;
    
    Object.values(demoAttendanceData).forEach(data => {
      totalPresent += data.present;
      totalDays += data.total;
    });
    
    setOverallStats({
      present: totalPresent,
      absent: totalDays - totalPresent,
      percentage: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0
    });
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const COLORS = ['#0088FE', '#FF8042'];
  
  const pieData = [
    { name: 'Present', value: overallStats.present },
    { name: 'Absent', value: overallStats.absent }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white text-center py-2">
          DEMO MODE - This is a demonstration with sample data. No changes will be saved.
        </div>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto mt-12">
          <Navbar demoMode={true} />
          <main className="p-8 max-w-6xl mx-auto w-full flex justify-center items-center">
            <LoadingSpinner text="Loading attendance data..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white text-center py-2">
        DEMO MODE - This is a demonstration with sample data. No changes will be saved.
      </div>
      <div className="w-64 mt-12">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-auto mt-12">
        <Navbar demoMode={true} />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Attendance Record (Demo)</h1>
            <div className="flex space-x-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Overall Attendance */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Overall Attendance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-4xl font-bold text-purple-600">{overallStats.percentage}%</div>
                  <div className="text-gray-500 mt-2">Attendance Rate</div>
                  <div className="mt-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-2" /> {overallStats.present} Present
                    </div>
                    <div className="flex items-center text-red-600 mt-1">
                      <FaTimesCircle className="mr-2" /> {overallStats.absent} Absent
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subject-wise Attendance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Subject-wise Attendance</h2>
            
            {Object.values(demoAttendanceData).map((subjectData) => (
              <div key={subjectData.subject} className="mb-8 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{subjectData.subject}</h3>
                  <div className="flex items-center">
                    <div className={`text-lg font-semibold ${subjectData.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {subjectData.percentage}%
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      ({subjectData.present}/{subjectData.total} classes)
                    </div>
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: `${subjectData.percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        subjectData.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">September 2025 Records</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subjectData.records.map((record, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 whitespace-nowrap">{record.date}</td>
                          <td className={`px-4 py-3 whitespace-nowrap capitalize ${
                            record.status === 'present' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.status === 'present' ? (
                              <div className="flex items-center">
                                <FaRegCalendarCheck className="mr-2" />
                                {record.status}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <FaRegCalendarTimes className="mr-2" />
                                {record.status}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoStudentAttendance;