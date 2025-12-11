import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import api from '../../services/api';
import exportToExcel from '../../utils/exportToExcel';
import { generatePDF } from '../../utils/pdfGenerator';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import { FaCalendarAlt, FaCheck, FaTimes, FaDownload, FaSave, FaUserCheck, FaFilePdf, FaWhatsapp } from 'react-icons/fa';

const TeacherAttendance = () => {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const attendanceReportRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!selectedClass || students.length === 0) {
      alert('Please select a class and load students first.');
      return;
    }

    try {
      const fileName = `Attendance_Report_${selectedClass}_${attendanceDate}.pdf`;
      await generatePDF(attendanceReportRef, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(res => {
        if (res.data.success) {
          setClassList(res.data.teacher.assignedClasses.map(c => typeof c === 'string' ? c : c.className));
        }
      })
      .catch(error => {
        console.error('Error fetching dashboard:', error);
        if (error.response?.status === 404) {
          alert('Server error: API endpoint not found. Please ensure the backend server is running.');
        } else if (error.response?.status === 401) {
          alert('Authentication error. Please login again.');
          window.location.href = '/teacher/login';
        } else {
          alert('Error loading dashboard: ' + (error.response?.data?.message || error.message));
        }
      });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get(`/teacher/students/${selectedClass}`)
        .then(res => {
          if (res.data.success) {
            const studentData = res.data.students.map(s => ({
              id: s._id,
              studentId: s._id, // Add studentId for API consistency
              rollNo: s.rollNo,
              name: s.userId?.name || 'Unknown',
              status: 'present'
            }));
            setStudents(studentData);
          }
        })
        .catch(error => {
          console.error('Error fetching students:', error);
          alert('Failed to load students: ' + (error.response?.data?.message || error.message));
        })
        .finally(() => setLoading(false));
    }
  }, [selectedClass]);

  const toggleAttendance = (id) => {
    setStudents(prev => prev.map(stu => 
      stu.id === id ? { ...stu, status: stu.status === 'present' ? 'absent' : 'present' } : stu
    ));
  };

  const [teacherData, setTeacherData] = useState({ subject: '' });

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(res => {
        if (res.data.success) {
          setClassList(res.data.teacher.assignedClasses.map(c => typeof c === 'string' ? c : c.className));
          setTeacherData({
            subject: res.data.teacher.subject,
            id: res.data.teacher._id
          });
        }
      })
      .catch(error => {
        console.error('Error fetching teacher data:', error);
        if (error.response?.status === 404) {
          alert('Server error: API endpoint not found. Please ensure the backend server is running.');
        } else if (error.response?.status === 401) {
          alert('Authentication error. Please login again.');
          window.location.href = '/teacher/login';
        } else {
          alert('Error loading teacher data: ' + (error.response?.data?.message || error.message));
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedClass || !attendanceDate) {
      alert('Please select both class and date');
      return;
    }

    try {
      // Calculate attendance counts
      const presentCount = students.filter(s => s.status === 'present').length;
      const absentCount = students.length - presentCount;

      // Format student data according to the model
      const formattedStudents = students.map(s => ({
        studentId: s.studentId,
        rollNo: s.rollNo,
        status: s.status
      }));

      const response = await api.post('/teacher/attendance', {
        date: attendanceDate,
        className: selectedClass,
        subject: teacherData.subject,
        students: formattedStudents,
        totalStudents: students.length,
        presentCount,
        absentCount
      });

      if (response.data.success) {
        alert('Attendance saved successfully');
      } else {
        throw new Error(response.data.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExport = () => {
    exportToExcel(students, `attendance-${selectedClass}-${attendanceDate}.xlsx`);
  };

  const handleWhatsAppShare = () => {
    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;
    const attendanceRate = students.length > 0 
      ? Math.round((presentCount / students.length) * 100) 
      : 0;

    // Get list of absent students
    const absentStudents = students
      .filter(s => s.status === 'absent')
      .map(s => `${s.rollNo} - ${s.name}`)
      .join('\n');

    // Create the message
    const message = `📋 *Attendance Report*\n\n` +
      `📚 *Class:* ${selectedClass}\n` +
      `📅 *Date:* ${new Date(attendanceDate).toLocaleDateString()}\n` +
      `👥 *Total Students:* ${students.length}\n\n` +
      `✅ *Present:* ${presentCount}\n` +
      `❌ *Absent:* ${absentCount}\n` +
      `📊 *Attendance Rate:* ${attendanceRate}%\n\n` +
      (absentStudents ? `*Absent Students:*\n${absentStudents}` : '*All students present!* 🎉');

    const encodedMessage = encodeURIComponent(message);
    
    // Use WhatsApp Web API to open group and send message
    const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
    
    // Also open the group link separately
    setTimeout(() => {
      window.open('https://chat.whatsapp.com/LwZceD4fngv06N3Z9yfNjd', '_blank');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <FaUserCheck className="mr-3 text-blue-600" /> Mark Attendance
              </h2>
              <p className="text-gray-600 mt-1">Record student attendance for your classes</p>
            </div>
            <BackButton customClass="mb-0" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Choose Class</option>
                  {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Subject</label>
                <div className="border border-gray-200 rounded-lg p-2.5 w-full bg-gray-50 text-gray-700">
                  {teacherData.subject || 'Loading...'}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Select Date
                </label>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={e => setAttendanceDate(e.target.value)} 
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                />
              </div>
            </div>

            <div>
              {loading ? (
                <LoadingSpinner text="Loading students..." />
              ) : students.length > 0 ? (
                <div ref={attendanceReportRef} className="mb-6">
                  {/* PDF Report Header */}
                  <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 print:bg-white print:border-gray-300">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <h3 className="text-2xl font-bold text-center mb-4 text-blue-800 border-b-2 border-blue-300 pb-2">
                        📋 Attendance Report
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg shadow-sm border border-blue-200">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Class</p>
                          <p className="text-lg font-bold text-blue-900">{selectedClass}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg shadow-sm border border-purple-200">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Date</p>
                          <p className="text-lg font-bold text-purple-900">{new Date(attendanceDate).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 p-3 rounded-lg shadow-sm border border-indigo-200">
                          <p className="text-xs text-indigo-600 font-semibold mb-1">Total Students</p>
                          <p className="text-lg font-bold text-indigo-900">{students.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg shadow-sm border border-green-200">
                          <p className="text-xs text-green-600 font-semibold mb-1">✓ Present</p>
                          <p className="text-lg font-bold text-green-900">{students.filter(s => s.status === 'present').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-lg shadow-sm border border-red-200">
                          <p className="text-xs text-red-600 font-semibold mb-1">✗ Absent</p>
                          <p className="text-lg font-bold text-red-900">{students.filter(s => s.status === 'absent').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-3 rounded-lg shadow-sm border border-yellow-200">
                          <p className="text-xs text-yellow-600 font-semibold mb-1">Attendance Rate</p>
                          <p className="text-lg font-bold text-yellow-900">
                            {students.length > 0 ? Math.round((students.filter(s => s.status === 'present').length / students.length) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-auto max-h-[calc(100vh-400px)] border rounded-lg shadow-sm">
                    <table className="table-auto w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800">
                          <th className="px-4 py-3 border-b">Roll No</th>
                        <th className="px-4 py-3 border-b">Name</th>
                        <th className="px-4 py-3 border-b text-center">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, index) => (
                        <tr key={s.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 border-b">{s.rollNo}</td>
                          <td className="px-4 py-3 border-b font-medium">{s.name}</td>
                          <td className="px-4 py-3 border-b">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => toggleAttendance(s.id)}
                                className={`flex items-center justify-center w-28 py-1.5 px-4 rounded-full font-medium transition-all ${
                                  s.status === 'present' 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {s.status === 'present' ? (
                                  <>
                                    <FaCheck className="mr-2" /> Present
                                  </>
                                ) : (
                                  <>
                                    <FaTimes className="mr-2" /> Absent
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              ) : selectedClass ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded-md mb-6">
                  No students found in this class.
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 rounded-md mb-6">
                  Please select a class to view students.
                </div>
              )}

              <div className="flex space-x-4">
              <button 
                onClick={handleSubmit} 
                disabled={!selectedClass || students.length === 0} 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md flex items-center"
              >
                <FaSave className="mr-2" /> Save Attendance
              </button>
              <button 
                onClick={handleExport} 
                disabled={!selectedClass || students.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 hover:from-green-700 hover:to-emerald-800 transition-all shadow-md flex items-center"
              >
                <FaDownload className="mr-2" /> Export to Excel
              </button>
              <button 
                onClick={handleWhatsAppShare} 
                disabled={!selectedClass || students.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center"
              >
                <FaWhatsapp className="mr-2 text-xl" /> Share to WhatsApp
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={!selectedClass || students.length === 0}
                className="bg-gradient-to-r from-red-600 to-pink-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 hover:from-red-700 hover:to-pink-800 transition-all shadow-md flex items-center"
              >
                <FaFilePdf className="mr-2" /> Download PDF
              </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherAttendance;
