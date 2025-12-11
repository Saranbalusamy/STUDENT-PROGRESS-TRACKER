import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';
import { 
  FaChartBar, FaChartLine, FaChartPie, FaChartArea, 
  FaDownload
} from 'react-icons/fa';

// Demo data
const demoPerformanceData = {
  subjects: ['Mathematics', 'Science', 'English', 'History', 'Computer Science'],
  subjectWiseMarks: {
    'Mathematics': 92,
    'Science': 88,
    'English': 85,
    'History': 78,
    'Computer Science': 95,
  },
  attendanceBySubject: {
    'Mathematics': 94,
    'Science': 90,
    'English': 95,
    'History': 89,
    'Computer Science': 92,
  },
  weeklyPerformance: [
    { week: 'Week 1', marks: 82 },
    { week: 'Week 2', marks: 85 },
    { week: 'Week 3', marks: 83 },
    { week: 'Week 4', marks: 87 },
    { week: 'Week 5', marks: 89 },
    { week: 'Week 6', marks: 88 },
    { week: 'Week 7', marks: 91 },
    { week: 'Week 8', marks: 87 },
  ],
  examScores: [
    { name: 'Mid Term', score: 83 },
    { name: 'Project', score: 90 },
    { name: 'Assignment', score: 87 },
    { name: 'Finals', score: 88 },
  ],
  classAverage: {
    'Mathematics': 80,
    'Science': 78,
    'English': 82,
    'History': 76,
    'Computer Science': 85,
  },
  skillsRadar: [
    { subject: 'Problem Solving', student: 85, classAvg: 75 },
    { subject: 'Communication', student: 78, classAvg: 80 },
    { subject: 'Critical Thinking', student: 90, classAvg: 78 },
    { subject: 'Creativity', student: 82, classAvg: 75 },
    { subject: 'Teamwork', student: 88, classAvg: 82 },
  ]
};

const DemoStudentPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('bar');
  
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

  // Function to export data to CSV (demo only)
  const exportToCSV = () => {
    alert('In the actual application, this would download a CSV file with your performance data.');
  };
  
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
            <LoadingSpinner text="Loading performance data..." />
          </main>
        </div>
      </div>
    );
  }
  
  // Prepare chart data
  const barData = demoPerformanceData.subjects.map(subject => ({
    name: subject,
    Marks: demoPerformanceData.subjectWiseMarks[subject],
    Attendance: demoPerformanceData.attendanceBySubject[subject],
    'Class Average': demoPerformanceData.classAverage[subject]
  }));

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
            <h1 className="text-2xl font-bold">Performance Analysis (Demo)</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedView('bar')}
                className={`p-2 rounded ${selectedView === 'bar' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                title="Bar Chart"
              >
                <FaChartBar />
              </button>
              <button 
                onClick={() => setSelectedView('line')}
                className={`p-2 rounded ${selectedView === 'line' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                title="Line Chart"
              >
                <FaChartLine />
              </button>
              <button 
                onClick={() => setSelectedView('radar')}
                className={`p-2 rounded ${selectedView === 'radar' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                title="Radar Chart"
              >
                <FaChartPie />
              </button>
              <button 
                onClick={() => setSelectedView('area')}
                className={`p-2 rounded ${selectedView === 'area' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                title="Area Chart"
              >
                <FaChartArea />
              </button>
              <button 
                onClick={exportToCSV}
                className="p-2 rounded bg-green-600 text-white"
                title="Export Data"
              >
                <FaDownload />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {selectedView === 'bar' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Subject Performance Comparison</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Marks" fill="#8884d8" name="Your Marks (%)" />
                      <Bar dataKey="Class Average" fill="#82ca9d" name="Class Average (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {selectedView === 'line' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Weekly Performance Trend</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={demoPerformanceData.weeklyPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="marks" stroke="#8884d8" name="Weekly Marks (%)" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {selectedView === 'radar' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={demoPerformanceData.skillsRadar}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Your Skills" dataKey="student" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Class Average" dataKey="classAvg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {selectedView === 'area' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Exam Performance</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demoPerformanceData.examScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" name="Score (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Attendance" fill="#82ca9d" name="Your Attendance (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoStudentPerformance;