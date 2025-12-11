import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo data - not connected to database
const demoStudents = [
  { id: 1, name: "John Smith", rollNo: "101", className: "10A", midterm: 85, finals: 90, project: 95, total: 90 },
  { id: 2, name: "Sarah Johnson", rollNo: "102", className: "10A", midterm: 78, finals: 88, project: 92, total: 86 },
  { id: 3, name: "Demo Student", rollNo: "DEMO101", className: "10A", midterm: 82, finals: 85, project: 90, total: 86 },
  { id: 4, name: "Mike Thompson", rollNo: "103", className: "10A", midterm: 75, finals: 80, project: 85, total: 80 },
  { id: 5, name: "Emily Davis", rollNo: "104", className: "10A", midterm: 90, finals: 92, project: 88, total: 90 },
  { id: 6, name: "Daniel Wilson", rollNo: "105", className: "10B", midterm: 85, finals: 90, project: 95, total: 90 },
  { id: 7, name: "Olivia Brown", rollNo: "106", className: "10B", midterm: 78, finals: 88, project: 92, total: 86 },
  { id: 8, name: "Ethan Martin", rollNo: "107", className: "10B", midterm: 82, finals: 85, project: 90, total: 86 },
  { id: 9, name: "Sophia Garcia", rollNo: "108", className: "9A", midterm: 75, finals: 80, project: 85, total: 80 },
  { id: 10, name: "James Rodriguez", rollNo: "109", className: "9A", midterm: 90, finals: 92, project: 88, total: 90 }
];

const demoClasses = ["10A", "10B", "9A"];
const demoExams = ["Midterm", "Finals", "Project"];

const DemoTeacherMarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("10A");
  const [selectedExam, setSelectedExam] = useState("Midterm");
  const [students, setStudents] = useState(demoStudents);
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Ensure demo session exists
  useEffect(() => {
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || 'null');
    if (!demoSession || demoSession.demoRole !== 'teacher') {
      navigate('/demo');
    }
  }, [navigate]);

  const handleMarkChange = (studentId, value) => {
    // Ensure value is between 0 and 100
    const newValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          const examField = selectedExam.toLowerCase();
          return { 
            ...student, 
            [examField]: newValue,
            // Recalculate total (average of the three exams)
            total: Math.round((student.midterm + student.finals + student.project) / 3)
          };
        }
        return student;
      })
    );
  };

  const handleSaveMarks = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      setSuccessMessage(`Marks for ${selectedClass} - ${selectedExam} saved successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 800);
  };

  const filteredStudents = students.filter(
    student => student.className === selectedClass
  );

  const getExamValue = (student) => {
    switch(selectedExam) {
      case "Midterm": return student.midterm;
      case "Finals": return student.finals;
      case "Project": return student.project;
      default: return 0;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Marks Entry</h1>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Marks
                </button>
              )}
            </div>
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                  <select
                    className="border border-gray-300 rounded-md p-2 w-full md:w-48"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {demoClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                  <select
                    className="border border-gray-300 rounded-md p-2 w-full md:w-48"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                  >
                    {demoExams.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {selectedExam} Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.rollNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editMode ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={getExamValue(student)}
                                  onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                  className="border border-gray-300 rounded-md p-1 w-20"
                                />
                              ) : (
                                getExamValue(student)
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {editMode && (
                    <div className="mt-6 text-right">
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMarks}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save Marks
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoTeacherMarks;