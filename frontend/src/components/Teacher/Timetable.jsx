 import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success] = useState('');

  // Fetch timetable and teacher classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get timetable
        const timetableRes = await api.get('/teacher/timetable');
        if (timetableRes.data.success) {
          setTimetable(timetableRes.data.timetable);
        }
      } catch (err) {
        console.error('Error fetching timetable data:', err);
        setError('Failed to load timetable data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading && Object.keys(timetable).length === 0) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Timetable</h2>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="bg-white p-4 rounded shadow max-h-[70vh] overflow-auto">
                <h3 className="font-semibold mb-4 border-b pb-2">{day}</h3>
                {timetable[day]?.length > 0 ? (
                  <ul className="space-y-3">
                    {timetable[day].map((slot) => (
                      <li key={slot.id} className="border p-3 rounded shadow-sm">
                        <p><strong>Subject:</strong> {slot.subject}</p>
                        <p><strong>Time:</strong> {slot.time}</p>
                        <p><strong>Class:</strong> {slot.className || ''}</p>
                        {slot.room && <p><strong>Room:</strong> {slot.room}</p>}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-500">No classes</p>}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Timetable;
