import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo data - not connected to database
const demoStudents = [
  { id: 1, name: "John Smith", rollNo: "101", className: "10A", present: true, date: "2025-09-19" },
  { id: 2, name: "Sarah Johnson", rollNo: "102", className: "10A", present: false, date: "2025-09-19" },
  { id: 3, name: "Demo Student", rollNo: "DEMO101", className: "10A", present: true, date: "2025-09-19" },
  { id: 4, name: "Mike Thompson", rollNo: "103", className: "10A", present: true, date: "2025-09-19" },
  { id: 5, name: "Emily Davis", rollNo: "104", className: "10A", present: true, date: "2025-09-19" },
  { id: 6, name: "Daniel Wilson", rollNo: "105", className: "10B", present: true, date: "2025-09-19" },
  { id: 7, name: "Olivia Brown", rollNo: "106", className: "10B", present: false, date: "2025-09-19" },
  { id: 8, name: "Ethan Martin", rollNo: "107", className: "10B", present: true, date: "2025-09-19" },
  { id: 9, name: "Sophia Garcia", rollNo: "108", className: "9A", present: true, date: "2025-09-19" },
  { id: 10, name: "James Rodriguez", rollNo: "109", className: "9A", present: false, date: "2025-09-19" }
];

const demoClasses = ["10A", "10B", "9A"];

const DemoTeacherAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("10A");
  const [selectedDate, setSelectedDate] = useState("2025-09-19");
  const [students, setStudents] = useState(demoStudents);
  const [successMessage, setSuccessMessage] = useState("");

  // Ensure demo session exists
  React.useEffect(() => {
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || 'null');
    if (!demoSession || demoSession.demoRole !== 'teacher') {
      navigate('/demo');
    }
  }, [navigate]);

  const handleAttendanceChange = (studentId, isPresent) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, present: isPresent } : student
      )
    );
  };

  const handleSaveAttendance = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Attendance for ${selectedClass} on ${selectedDate} saved successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 800);
  };

  const filteredStudents = students.filter(
    student => student.className === selectedClass
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h1>
            
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md p-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
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
                            Present
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Absent
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
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={student.present}
                                onChange={() => handleAttendanceChange(student.id, true)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={!student.present}
                                onChange={() => handleAttendanceChange(student.id, false)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 text-right">
                    <button
                      onClick={handleSaveAttendance}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Attendance
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoTeacherAttendance;