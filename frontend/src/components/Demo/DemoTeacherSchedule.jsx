import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo data - not connected to database
const demoSchedule = [
  { 
    day: "Monday", 
    periods: [
      { time: "9:00 - 10:00", class: "10A", subject: "Mathematics", room: "Room 101" },
      { time: "11:00 - 12:00", class: "9A", subject: "Mathematics", room: "Room 105" }
    ]
  },
  { 
    day: "Tuesday", 
    periods: [
      { time: "9:00 - 10:00", class: "10B", subject: "Mathematics", room: "Room 102" }
    ]
  },
  { 
    day: "Wednesday", 
    periods: [
      { time: "10:00 - 11:00", class: "10A", subject: "Mathematics", room: "Room 101" },
      { time: "2:00 - 3:00", class: "10B", subject: "Mathematics", room: "Room 102" }
    ]
  },
  { 
    day: "Thursday", 
    periods: [
      { time: "11:00 - 12:00", class: "9A", subject: "Mathematics", room: "Room 105" }
    ]
  },
  { 
    day: "Friday", 
    periods: [
      { time: "9:00 - 10:00", class: "10A", subject: "Mathematics", room: "Room 101" },
      { time: "1:00 - 2:00", class: "10B", subject: "Mathematics", room: "Room 102" }
    ]
  }
];

// days of week inferred from demoSchedule; no separate constant needed

const DemoTeacherSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(demoSchedule);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [newClass, setNewClass] = useState({
    time: "9:00 - 10:00",
    class: "10A",
    subject: "Mathematics",
    room: "Room 101"
  });

  // Ensure demo session exists
  useEffect(() => {
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || 'null');
    if (!demoSession || demoSession.demoRole !== 'teacher') {
      navigate('/demo');
    }

    // Set initial schedule
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [navigate]);

  const handleAddClass = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add the new class to the schedule
      const updatedSchedule = schedule.map(daySchedule => {
        if (daySchedule.day === selectedDay) {
          return {
            ...daySchedule,
            periods: [...daySchedule.periods, { ...newClass }]
          };
        }
        return daySchedule;
      });
      
      setSchedule(updatedSchedule);
      setShowModal(false);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Schedule</h1>
            
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {schedule.map((daySchedule) => (
                  <div key={daySchedule.day} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{daySchedule.day}</h2>
                      <button 
                        onClick={() => handleAddClass(daySchedule.day)} 
                        className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Add
                      </button>
                    </div>
                    
                    {daySchedule.periods.length > 0 ? (
                      <ul className="space-y-3">
                        {daySchedule.periods.map((period, idx) => (
                          <li key={idx} className="border p-3 rounded shadow-sm">
                            <p className="font-medium">{period.time}</p>
                            <p>Class: {period.class}</p>
                            <p>Subject: {period.subject}</p>
                            <p>Room: {period.room}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No classes</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Class Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold mb-4">Add Class to {selectedDay}</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="text"
                      name="time"
                      value={newClass.time}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      name="class"
                      value={newClass.class}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    >
                      <option value="10A">10A</option>
                      <option value="10B">10B</option>
                      <option value="9A">9A</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={newClass.subject}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input
                      type="text"
                      name="room"
                      value={newClass.room}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Class
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoTeacherSchedule;