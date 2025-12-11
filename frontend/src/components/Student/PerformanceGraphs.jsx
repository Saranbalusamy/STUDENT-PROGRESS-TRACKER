import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { 
  FaChartBar, FaChartLine, FaChartPie, FaChartArea, 
  FaDownload, FaRedo, FaExclamationTriangle
} from 'react-icons/fa';

const PerformanceGraphs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('bar');
  
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get('/student/performance');
        
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError('Failed to load performance data');
        }
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err.response?.data?.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // Function to export data to CSV
  const exportToCSV = () => {
    if (!data || !data.subjects) return;
    
    const headers = ['Subject', 'Marks (%)', 'Attendance (%)'];
    const rows = data.subjects.map(subject => [
      subject,
      data.subjectWiseMarks[subject] || 0,
      data.attendanceBySubject[subject] || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'performance_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!data && loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-6xl mx-auto w-full flex justify-center items-center">
            <LoadingSpinner text="Loading performance data..." />
          </main>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-6xl mx-auto w-full">
            <BackButton customClass="mb-4" />
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
              >
                <FaRedo className="mr-2" /> Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data || !data.subjects || data.subjects.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-6xl mx-auto w-full">
            <BackButton customClass="mb-4" />
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaChartBar className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No performance data available</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { subjectWiseMarks = {}, subjects = [], attendanceBySubject = {} } = data;

  // Get grade from percentage
  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // Prepare chart data
  const chartData = subjects.map(sub => ({
    subject: sub,
    marks: subjectWiseMarks[sub] || 0,
    attendance: attendanceBySubject[sub] || 0,
    grade: getGradeFromPercentage(subjectWiseMarks[sub] || 0)
  }));

  // Render different chart types based on selection
  const renderChart = () => {
    switch (selectedView) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
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
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend />
              <Bar name="Marks (%)" dataKey="marks" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar name="Attendance (%)" dataKey="attendance" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Marks (%)" dataKey="marks" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Attendance (%)" dataKey="attendance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
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
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend />
              <Line type="monotone" name="Marks (%)" dataKey="marks" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" name="Attendance (%)" dataKey="attendance" stroke="#82ca9d" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
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
                formatter={(value, name) => [`${value}%`, name]}
              />
              <Legend />
              <Area type="monotone" name="Marks (%)" dataKey="marks" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" name="Attendance (%)" dataKey="attendance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <BackButton customClass="mb-4" />
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center">
              <FaChartLine className="text-3xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold">Performance Analysis</h2>
                <p className="text-blue-200">Visual representation of your academic performance</p>
              </div>
            </div>
          </div>
          
          {/* Chart Type Selector and Export Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h3 className="text-lg font-semibold mb-4 md:mb-0">Chart Type</h3>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedView('bar')} 
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedView === 'bar' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaChartBar className="mr-2" /> Bar
                </button>
                
                <button 
                  onClick={() => setSelectedView('radar')} 
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedView === 'radar' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaChartPie className="mr-2" /> Radar
                </button>
                
                <button 
                  onClick={() => setSelectedView('line')} 
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedView === 'line' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaChartLine className="mr-2" /> Line
                </button>
                
                <button 
                  onClick={() => setSelectedView('area')} 
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedView === 'area' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaChartArea className="mr-2" /> Area
                </button>
                
                <button 
                  onClick={exportToCSV} 
                  className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 ml-2"
                >
                  <FaDownload className="mr-2" /> Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {renderChart()}
          </div>
          
          {/* Subject Performance Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Subject Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks (%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance (%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chartData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.marks.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.marks >= 90 ? 'bg-green-100 text-green-800' : 
                            item.marks >= 80 ? 'bg-blue-100 text-blue-800' : 
                            item.marks >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                            item.marks >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.attendance.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.attendance >= 90 ? 'bg-green-100 text-green-800' : 
                            item.attendance >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                          {item.attendance >= 90 ? 'Excellent' : 
                            item.attendance >= 75 ? 'Good' : 
                            'Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PerformanceGraphs;
