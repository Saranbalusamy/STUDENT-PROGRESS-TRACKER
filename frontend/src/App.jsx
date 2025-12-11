 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminLogin from './components/Auth/AdminLogin';
import TeacherLogin from './components/Auth/TeacherLogin';
import StudentLogin from './components/Auth/StudentLogin';
import LearnMore from './components/LearnMore';
import DemoSelect from './components/Demo/DemoSelect';
import DemoStudentDashboard from './components/Demo/DemoStudentDashboard';
import DemoStudentPerformance from './components/Demo/DemoStudentPerformance';
import DemoStudentAttendance from './components/Demo/DemoStudentAttendance';
import DemoStudentLLMTutor from './components/Demo/DemoStudentLLMTutor';
import DemoStudentAIInsights from './components/Demo/DemoStudentAIInsights';
import DemoTeacherDashboard from './components/Demo/DemoTeacherDashboard';
import DemoTeacherAttendance from './components/Demo/DemoTeacherAttendance';
import DemoTeacherMarks from './components/Demo/DemoTeacherMarks';
import DemoTeacherSchedule from './components/Demo/DemoTeacherSchedule';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClassManagement from './components/Admin/ClassManagement';
import StudentManagement from './components/Admin/StudentManagement';
import TeacherManagement from './components/Admin/TeacherManagement';
import TimetableManagement from './components/Admin/TimetableManagement';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import TeacherAttendance from './components/Teacher/Attendance';
import TeacherMarksEntry from './components/Teacher/MarksEntry';
import TeacherTimetable from './components/Teacher/Timetable';
import TeacherMessaging from './components/Teacher/Messaging';
import StudentDashboard from './components/Student/StudentDashboard';
import StudentPerformanceGraphs from './components/Student/PerformanceGraphs';
import StudentAttendanceView from './components/Student/AttendanceView';
import StudentMessaging from './components/Student/Messaging';
import AIInsights from './components/Student/AIInsights';
import ProgressReportCard from './components/Student/ProgressReportCard';
import PersonalAnalytics from './components/Student/PersonalAnalytics';
import MessageView from './components/Common/MessageView';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          
          {/* Demo Routes */}
          <Route path="/demo" element={<DemoSelect />} />
          <Route path="/demo/student" element={<DemoStudentDashboard />} />
          <Route path="/demo/student/performance" element={<DemoStudentPerformance />} />
          <Route path="/demo/student/attendance" element={<DemoStudentAttendance />} />
          <Route path="/demo/student/tutor" element={<DemoStudentLLMTutor />} />
          <Route path="/demo/student/insights" element={<DemoStudentAIInsights />} />
          <Route path="/demo/teacher" element={<DemoTeacherDashboard />} />
          <Route path="/demo/teacher/attendance" element={<DemoTeacherAttendance />} />
          <Route path="/demo/teacher/marks" element={<DemoTeacherMarks />} />
          <Route path="/demo/teacher/schedule" element={<DemoTeacherSchedule />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute role="admin"><ClassManagement /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentManagement /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><TeacherManagement /></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute role="admin"><TimetableManagement /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/teacher/marks" element={<ProtectedRoute role="teacher"><TeacherMarksEntry /></ProtectedRoute>} />
          <Route path="/teacher/timetable" element={<ProtectedRoute role="teacher"><TeacherTimetable /></ProtectedRoute>} />
          <Route path="/teacher/messages" element={<ProtectedRoute role="teacher"><TeacherMessaging /></ProtectedRoute>} />
          <Route path="/teacher/message/:id" element={<ProtectedRoute role="teacher"><MessageView /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/performance" element={<ProtectedRoute role="student"><StudentPerformanceGraphs /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute role="student"><StudentAttendanceView /></ProtectedRoute>} />
          <Route path="/student/insights" element={<ProtectedRoute role="student"><AIInsights /></ProtectedRoute>} />
          <Route path="/student/report" element={<ProtectedRoute role="student"><ProgressReportCard /></ProtectedRoute>} />
          <Route path="/student/messages" element={<ProtectedRoute role="student"><StudentMessaging /></ProtectedRoute>} />
          <Route path="/student/message/:id" element={<ProtectedRoute role="student"><MessageView /></ProtectedRoute>} />
          <Route path="/student/analytics" element={<ProtectedRoute role="student"><PersonalAnalytics /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
