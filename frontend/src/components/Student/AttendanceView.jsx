import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaRegCalendarCheck, FaRegCalendarTimes, FaCalendarCheck } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AttendanceView = () => {
  const [attendance, setAttendance] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallStats, setOverallStats] = useState({ present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get('/student/attendance', {
          params: { month: selectedMonth, year: selectedYear }
        });
        
        if (res.data.success) {
          setAttendance(res.data.attendance);
          
          // Calculate overall stats
          let totalPresent = 0;
          let totalDays = 0;
          
          Object.values(res.data.attendance).forEach(data => {
            totalPresent += data.present;
            totalDays += data.total;
          });
          
          setOverallStats({
            present: totalPresent,
            absent: totalDays - totalPresent,
            percentage: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0
          });
        } else {
          setError('Failed to load attendance data');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError(err.response?.data?.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const months = [...Array(12)].map((_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Chart data
  const attendancePieData = [
    { name: 'Present', value: overallStats.present, color: '#10B981' },
    { name: 'Absent', value: overallStats.absent, color: '#EF4444' }
  ];
  
  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'present') {
      return <FaCheckCircle className="text-green-500 text-lg" />;
    } else {
      return <FaTimesCircle className="text-red-500 text-lg" />;
    }
  };
  
  // Get color based on attendance percentage
  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <BackButton customClass="mb-4" />
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center">
              <FaCalendarCheck className="text-3xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold">Attendance Records</h2>
                <p className="text-green-200">Track your class presence and absences</p>
              </div>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="text-lg font-semibold mb-4 md:mb-0 flex items-center">
                <FaCalendarAlt className="mr-2 text-green-600" /> Select Period
              </h3>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  aria-label="Select month"
                >
                  {months.map(m => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  aria-label="Select year"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center">
              <LoadingSpinner text="Loading attendance records..." />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : attendance && Object.keys(attendance).length > 0 ? (
            <>
              {/* Overall Statistics */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaRegCalendarCheck className="mr-2" /> Overall Attendance
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={attendancePieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {attendancePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 uppercase font-semibold">Present</p>
                      <p className="text-2xl font-bold text-green-700">{overallStats.present} days</p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600 uppercase font-semibold">Absent</p>
                      <p className="text-2xl font-bold text-red-700">{overallStats.absent} days</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 uppercase font-semibold">Percentage</p>
                      <p className={`text-2xl font-bold ${getPercentageColor(overallStats.percentage)}`}>
                        {overallStats.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subject-wise attendance */}
              <div className="space-y-6">
                {Object.entries(attendance).map(([subject, data]) => (
                  <div key={subject} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{subject}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPercentageColor(data.percentage)}`}>
                        {data.percentage}% Attendance
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2 px-2">
                        <span>Present: {data.present} days</span>
                        <span>Total: {data.total} days</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {data.records.map((r, idx) => (
                              <tr key={idx} className={r.status === 'present' ? 'bg-green-50' : 'bg-red-50'}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(r.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getStatusIcon(r.status)}
                                    <span className="ml-2 text-sm capitalize">
                                      {r.status}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaRegCalendarTimes className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found for the selected period.</p>
              <p className="text-sm text-gray-500 mt-2">Try selecting a different month or year.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendanceView;
