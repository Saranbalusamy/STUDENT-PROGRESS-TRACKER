import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { generatePDF, formatFilename } from '../../utils/pdfGenerator';
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
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts';
import { 
  FaUserGraduate, 
  FaDownload, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaChartLine, 
  FaCalendarCheck,
  FaInfoCircle,
  FaLightbulb,
  FaPrint,
  FaRedo
} from 'react-icons/fa';

const ProgressReportCard = () => {
  const [studentData, setStudentData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  // Removed unused attendanceData state to resolve ESLint warning
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [dashboardRes, performanceRes, , insightsRes] = await Promise.allSettled([
          api.get('/student/dashboard'),
          api.get('/student/performance'),
          api.get('/student/attendance'),
          api.get('/student/insights')
        ]);

        if (dashboardRes.status === 'fulfilled' && dashboardRes.value.data.success) {
          setStudentData(dashboardRes.value.data.student);
        }

        if (performanceRes.status === 'fulfilled' && performanceRes.value.data.success) {
          setPerformanceData(performanceRes.value.data.data);
        }

        // Removed setAttendanceData call since attendanceData state was removed

        if (insightsRes.status === 'fulfilled' && insightsRes.value.data.success) {
          setInsightsData(insightsRes.value.data);
        }

      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    setGeneratingPDF(true);
    try {
      const filename = formatFilename(studentData?.name);
      await generatePDF(reportRef, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#10B981', description: 'Outstanding' };
    if (percentage >= 80) return { grade: 'A', color: '#10B981', description: 'Excellent' };
    if (percentage >= 70) return { grade: 'B', color: '#3B82F6', description: 'Very Good' };
    if (percentage >= 60) return { grade: 'C', color: '#F59E0B', description: 'Good' };
    if (percentage >= 50) return { grade: 'D', color: '#EF4444', description: 'Satisfactory' };
    return { grade: 'F', color: '#EF4444', description: 'Needs Improvement' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-6xl mx-auto w-full flex justify-center items-center">
            <LoadingSpinner text="Generating your progress report..." />
          </main>
        </div>
      </div>
    );
  }
  
  if (error || !studentData) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8 max-w-6xl mx-auto w-full">
            <BackButton customClass="mb-4" />
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error || 'Failed to load report data'}</p>
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

  const { name, rollNo, className, overallPercentage, attendancePercentage } = studentData;

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

  const radarData = performanceData?.subjects?.map(subject => ({
    subject,
    marks: performanceData.subjectWiseMarks?.[subject] || 0,
    attendance: performanceData.attendanceBySubject?.[subject] || 0
  })) || [];

  const overallGrade = getGrade(overallPercentage);
  const attendanceGrade = getGrade(attendancePercentage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <BackButton customClass="mb-4" />
          
          <div className="flex justify-between items-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white flex-grow mr-4">
              <div className="flex items-center">
                <FaUserGraduate className="text-3xl mr-4" />
                <div>
                  <h2 className="text-2xl font-bold">Progress Report Card</h2>
                  <p className="text-purple-200">Complete academic performance overview</p>
                </div>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              disabled={generatingPDF}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg h-16"
            >
              {generatingPDF ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" /> Download PDF
                </>
              )}
            </button>
          </div>

          <div ref={reportRef} className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">PROGRESS REPORT CARD</h1>
                <p className="text-xl opacity-90">Academic Year {new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Student Information */}
            <div className="p-8 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <FaInfoCircle className="mr-2 text-purple-600" /> Student Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-800">{name}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">Roll Number:</span>
                      <span className="font-semibold text-gray-800">{rollNo}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">Class:</span>
                      <span className="font-semibold text-gray-800">{className}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-600">Report Date:</span>
                      <span className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <FaChartLine className="mr-2 text-purple-600" /> Overall Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200">
                      <div className="text-5xl font-bold mb-1" style={{ color: overallGrade.color }}>
                        {overallGrade.grade}
                      </div>
                      <div className="text-lg font-medium text-gray-700">Overall Grade</div>
                      <div className="mt-2 bg-white px-3 py-1 rounded-full inline-block shadow-sm">
                        <span className="font-semibold">{overallPercentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{overallGrade.description}</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200">
                      <div className="text-5xl font-bold mb-1" style={{ color: attendanceGrade.color }}>
                        {attendanceGrade.grade}
                      </div>
                      <div className="text-lg font-medium text-gray-700">Attendance</div>
                      <div className="mt-2 bg-white px-3 py-1 rounded-full inline-block shadow-sm">
                        <span className="font-semibold">{attendancePercentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{attendanceGrade.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="p-8 border-b">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                <FaChartLine className="mr-2 text-purple-600" /> Performance Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Pie Chart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                    <FaCalendarCheck className="mr-2 text-green-600" /> Attendance Overview
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px', 
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance by Subject */}
                {performanceBarData.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                      <FaChartLine className="mr-2 text-blue-600" /> Subject Performance
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
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
                          formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend />
                        <Bar name="Marks (%)" dataKey="marks" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar name="Attendance (%)" dataKey="attendance" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-8">
                  <h4 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                    <FaChartLine className="mr-2 text-purple-600" /> Performance Radar
                  </h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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
                </div>
              )}
            </div>

            {/* Subject-wise Details */}
            {performanceBarData.length > 0 && (
              <div className="p-8 border-b">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                  <FaInfoCircle className="mr-2 text-purple-600" /> Subject-wise Details
                </h3>
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left font-semibold text-gray-600">Subject</th>
                        <th className="p-4 text-center font-semibold text-gray-600">Marks (%)</th>
                        <th className="p-4 text-center font-semibold text-gray-600">Attendance (%)</th>
                        <th className="p-4 text-center font-semibold text-gray-600">Grade</th>
                        <th className="p-4 text-center font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {performanceBarData.map((subject, index) => {
                        const subjectGrade = getGrade(subject.marks);
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-800">{subject.subject}</td>
                            <td className="p-4 text-center">
                              <span className="font-semibold" style={{ color: subjectGrade.color }}>
                                {subject.marks.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-semibold ${subject.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                {subject.attendance.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span 
                                className="font-bold px-3 py-1 rounded-full text-sm"
                                style={{ 
                                  color: subjectGrade.color,
                                  backgroundColor: `${subjectGrade.color}20`
                                }}
                              >
                                {subjectGrade.grade}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-sm text-gray-600">
                                {subjectGrade.description}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insightsData?.insights && insightsData.insights.length > 0 && (
              <div className="p-8 border-b">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                  <FaLightbulb className="mr-2 text-yellow-500" /> AI-Powered Insights
                </h3>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
                  <ul className="space-y-4">
                    {insightsData.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-yellow-500 mt-1">
                          <FaLightbulb />
                        </span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-8 bg-gray-50">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                <FaInfoCircle className="mr-2 text-purple-600" /> Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{overallPercentage}%</div>
                  <div className="text-gray-600 font-medium">Overall Performance</div>
                  <div className="mt-2 text-sm text-gray-500">{overallGrade.description}</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-green-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-green-600 mb-1">{attendancePercentage}%</div>
                  <div className="text-gray-600 font-medium">Attendance Rate</div>
                  <div className="mt-2 text-sm text-gray-500">{attendanceGrade.description}</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-purple-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{performanceBarData.length}</div>
                  <div className="text-gray-600 font-medium">Subjects Tracked</div>
                  <div className="mt-2 text-sm text-gray-500">Complete curriculum coverage</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gradient-to-r from-purple-800 to-indigo-800 text-white text-center">
              <div className="flex justify-center items-center mb-3">
                <FaPrint className="mr-2" /> 
                <span>Click the "Download PDF" button to save or print this report</span>
              </div>
              <p className="text-sm opacity-75">
                This report was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
              <p className="text-xs opacity-50 mt-2">
                Student Progress Tracker System - Academic Year {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProgressReportCard;
