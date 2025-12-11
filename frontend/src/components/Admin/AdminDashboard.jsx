import React, { useEffect, useState } from 'react';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import BackButton from '../Common/BackButton';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaChalkboardTeacher, FaSchool, FaChartBar, FaUserGraduate, FaClipboardList, FaTasks } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        if (res.data.success) setStats(res.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!stats) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
                  <p className="text-gray-600">Manage your educational institution</p>
                </div>
                <BackButton customClass="mb-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300" />
              </div>
              <div className="bg-white p-8 shadow-lg rounded-xl border border-red-200">
                <div className="text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-red-600 text-lg font-medium">Failed to load dashboard data. Please try again.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reload Dashboard
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                  <FaChartBar className="mr-4 text-blue-600" />
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 text-lg">Welcome back! Here's what's happening at your institution today.</p>
              </div>
              <BackButton customClass="mb-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 shadow-xl rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 opacity-90">Total Students</h3>
                    <p className="text-4xl font-bold">{stats.totalStudents || 0}</p>
                    <p className="text-blue-100 text-sm mt-2">Active enrollments</p>
                  </div>
                  <FaUserGraduate className="text-5xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 shadow-xl rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 opacity-90">Total Teachers</h3>
                    <p className="text-4xl font-bold">{stats.totalTeachers || 0}</p>
                    <p className="text-green-100 text-sm mt-2">Faculty members</p>
                  </div>
                  <FaChalkboardTeacher className="text-5xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 shadow-xl rounded-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 opacity-90">Total Classes</h3>
                    <p className="text-4xl font-bold">{stats.totalClasses || 0}</p>
                    <p className="text-purple-100 text-sm mt-2">Active classes</p>
                  </div>
                  <FaSchool className="text-5xl opacity-80" />
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaTasks className="mr-3 text-indigo-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a 
                  href="/admin/classes" 
                  className="bg-white p-6 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FaSchool className="text-blue-600 text-xl" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Manage Classes</h4>
                  <p className="text-gray-600 text-sm mb-4">Create and organize class schedules</p>
                  <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                    Go to Classes →
                  </span>
                </a>

                <a 
                  href="/admin/students" 
                  className="bg-white p-6 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FaUserGraduate className="text-green-600 text-xl" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Student Records</h4>
                  <p className="text-gray-600 text-sm mb-4">Manage student enrollments</p>
                  <span className="text-green-600 text-sm font-medium group-hover:text-green-700">
                    View Students →
                  </span>
                </a>

                <a 
                  href="/admin/teachers" 
                  className="bg-white p-6 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <FaChalkboardTeacher className="text-purple-600 text-xl" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Faculty Management</h4>
                  <p className="text-gray-600 text-sm mb-4">Manage teacher accounts</p>
                  <span className="text-purple-600 text-sm font-medium group-hover:text-purple-700">
                    Manage Faculty →
                  </span>
                </a>

                <a 
                  href="/admin/timetable" 
                  className="bg-white p-6 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <FaClipboardList className="text-orange-600 text-xl" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Timetable</h4>
                  <p className="text-gray-600 text-sm mb-4">Organize class schedules</p>
                  <span className="text-orange-600 text-sm font-medium group-hover:text-orange-700">
                    Manage Schedule →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
