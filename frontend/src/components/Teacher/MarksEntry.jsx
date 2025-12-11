import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import api from '../../services/api';
import exportToExcel from '../../utils/exportToExcel';
import { generatePDF } from '../../utils/pdfGenerator';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import { FaGraduationCap, FaSave, FaBook, FaChartLine, FaFilePdf, FaWhatsapp, FaDownload } from 'react-icons/fa';

const examTypes = [
  { value: 'unit1', label: 'Unit 1' },
  { value: 'unit2', label: 'Unit 2' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual', label: 'Annual' },
];

const MarksEntry = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('Mathematics');
  const [examType, setExamType] = useState('unit1');
  const [loading, setLoading] = useState(false);
  const marksReportRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!selectedClass || students.length === 0) {
      alert('Please select a class and load students first.');
      return;
    }

    try {
      const fileName = `Marks_Report_${selectedClass}_${subject}_${examType}.pdf`;
      await generatePDF(marksReportRef, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.teacher.assignedClasses.map(c => typeof c === 'string' ? c : c.className));
          setSubject(res.data.teacher.subject); // Get the subject assigned to the teacher
        }
      });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get(`/teacher/students/${selectedClass}`)
        .then(res => {
          if (res.data.success) {
            // Map students with their IDs and initialize marks
            const studentData = res.data.students.map(student => ({
              id: student._id,
              studentId: student._id,
              rollNo: student.rollNo,
              name: student.userId?.name || 'Unknown',
              marks: ''
            }));
            setStudents(studentData);
          }
        })
        .catch(error => {
          console.error('Error fetching students:', error);
          alert('Failed to load students: ' + (error.response?.data?.message || error.message));
        })
        .finally(() => setLoading(false));
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleInputChange = (id, value) => {
    setStudents(students.map(s => (s.id === id ? { ...s, marks: value } : s)));
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    // Validate marks
    const studentsWithMarks = students.filter(s => s.marks !== '');
    const invalidMarks = studentsWithMarks.some(s => {
      const marks = parseFloat(s.marks);
      return isNaN(marks) || marks < 0 || marks > 100;
    });
    
    if (invalidMarks) {
      alert('Please enter valid marks between 0 and 100');
      return;
    }

    if (studentsWithMarks.length === 0) {
      alert('Please enter marks for at least one student');
      return;
    }

    try {
      // Format the marks data with all required fields
      const marksData = studentsWithMarks.map(s => ({
        studentId: s.studentId,
        marks: Number(s.marks),
        rollNo: s.rollNo
      }));

      // Submit all marks in one request
      const response = await api.post('/teacher/marks', {
        className: selectedClass,
        subject,
        examType,
        totalMarks: 100,
        marksData
      });

      if (response.data.success) {
        alert('Marks saved successfully');
        // Clear marks after successful save
        setStudents(students.map(s => ({ ...s, marks: '' })));
      } else {
        throw new Error(response.data.message || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleWhatsAppShare = () => {
    const marksEntered = students.filter(s => s.marks && s.marks !== '').length;
    const pendingCount = students.filter(s => !s.marks || s.marks === '').length;
    
    // Calculate class average
    const validMarks = students.filter(s => s.marks && s.marks !== '');
    const classAverage = validMarks.length > 0
      ? (validMarks.reduce((acc, s) => acc + parseFloat(s.marks || 0), 0) / validMarks.length).toFixed(2)
      : 'N/A';
    
    const completionRate = students.length > 0
      ? Math.round((marksEntered / students.length) * 100)
      : 0;

    // Get top 5 performers
    const topPerformers = [...students]
      .filter(s => s.marks && s.marks !== '')
      .sort((a, b) => parseFloat(b.marks) - parseFloat(a.marks))
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s.name} - ${s.marks}%`)
      .join('\n');

    // Create the message
    const examLabel = examTypes.find(e => e.value === examType)?.label || examType;
    const message = `📝 *Marks Report*\n\n` +
      `📚 *Class:* ${selectedClass}\n` +
      `📖 *Subject:* ${subject}\n` +
      `📋 *Exam:* ${examLabel}\n` +
      `👥 *Total Students:* ${students.length}\n\n` +
      `✅ *Marks Entered:* ${marksEntered}\n` +
      `⏳ *Pending:* ${pendingCount}\n` +
      `📊 *Class Average:* ${classAverage}%\n` +
      `📈 *Completion Rate:* ${completionRate}%\n\n` +
      (topPerformers ? `*Top 5 Performers:* 🏆\n${topPerformers}` : '');

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

  const handleExport = () => {
    const examLabel = examTypes.find(e => e.value === examType)?.label || examType;
    const exportData = students.map(s => ({
      'Roll No': s.rollNo,
      'Name': s.name,
      'Marks': s.marks || 'Not Entered'
    }));
    exportToExcel(exportData, `marks-${selectedClass}-${subject}-${examLabel}-${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <FaGraduationCap className="mr-3 text-indigo-600" /> Marks Entry
              </h2>
              <p className="text-gray-600 mt-1">Record academic performance for your students</p>
            </div>
            <BackButton customClass="mb-0" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                  <FaGraduationCap className="mr-2 text-indigo-600" /> Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                  <FaBook className="mr-2 text-indigo-600" /> Subject
                </label>
                <div className="border border-gray-200 rounded-lg p-2.5 w-full bg-gray-50 text-gray-700">
                  {subject || 'Loading...'}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 flex items-center">
                  <FaChartLine className="mr-2 text-indigo-600" /> Exam Type
                </label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {examTypes.map(exam => (
                    <option key={exam.value} value={exam.value}>{exam.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              {loading ? (
                <LoadingSpinner text="Loading students..." />
              ) : students.length > 0 ? (
                <div ref={marksReportRef} className="mb-6">
                  {/* PDF Report Header */}
                  <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-xl shadow-lg border-2 border-purple-200 print:bg-white print:border-gray-300">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <h3 className="text-2xl font-bold text-center mb-4 text-purple-800 border-b-2 border-purple-300 pb-2">
                        📝 Marks Report
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg shadow-sm border border-purple-200">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Class</p>
                          <p className="text-lg font-bold text-purple-900">{selectedClass}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg shadow-sm border border-blue-200">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Subject</p>
                          <p className="text-lg font-bold text-blue-900">{subject}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 p-3 rounded-lg shadow-sm border border-indigo-200">
                          <p className="text-xs text-indigo-600 font-semibold mb-1">Exam Type</p>
                          <p className="text-lg font-bold text-indigo-900">{examTypes.find(e => e.value === examType)?.label}</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 p-3 rounded-lg shadow-sm border border-cyan-200">
                          <p className="text-xs text-cyan-600 font-semibold mb-1">Total Students</p>
                          <p className="text-lg font-bold text-cyan-900">{students.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg shadow-sm border border-green-200">
                          <p className="text-xs text-green-600 font-semibold mb-1">✓ Marks Entered</p>
                          <p className="text-lg font-bold text-green-900">{students.filter(s => s.marks && s.marks !== '').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-lg shadow-sm border border-orange-200">
                          <p className="text-xs text-orange-600 font-semibold mb-1">⏳ Pending</p>
                          <p className="text-lg font-bold text-orange-900">{students.filter(s => !s.marks || s.marks === '').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-3 rounded-lg shadow-sm border border-yellow-200 col-span-2 md:col-span-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-yellow-600 font-semibold mb-1">Class Average</p>
                              <p className="text-lg font-bold text-yellow-900">
                                {students.filter(s => s.marks && s.marks !== '').length > 0
                                  ? (students
                                      .filter(s => s.marks && s.marks !== '')
                                      .reduce((acc, s) => acc + parseFloat(s.marks || 0), 0) /
                                      students.filter(s => s.marks && s.marks !== '').length
                                    ).toFixed(2)
                                  : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-yellow-600 font-semibold mb-1">Completion Rate</p>
                              <p className="text-lg font-bold text-yellow-900">
                                {students.length > 0
                                  ? Math.round((students.filter(s => s.marks && s.marks !== '').length / students.length) * 100)
                                  : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-auto max-h-[calc(100vh-400px)] border rounded-lg shadow-sm">
                    <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800">
                        <th className="px-4 py-3 border-b">Roll No</th>
                        <th className="px-4 py-3 border-b">Name</th>
                        <th className="px-4 py-3 border-b text-center">Marks (0-100)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, index) => (
                        <tr key={s.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 border-b">{s.rollNo}</td>
                          <td className="px-4 py-3 border-b font-medium">{s.name}</td>
                          <td className="px-4 py-3 border-b text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={s.marks}
                              onChange={e => handleInputChange(s.id, e.target.value)}
                              className="w-24 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
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
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 text-indigo-700 rounded-md mb-6">
                  Please select a class to view students.
                </div>
              )}

              <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={!selectedClass || students.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-2.5 rounded-lg disabled:opacity-60 hover:from-indigo-700 hover:to-purple-800 transition-all shadow-md flex items-center"
              >
                <FaSave className="mr-2" /> Save Marks
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

export default MarksEntry;
