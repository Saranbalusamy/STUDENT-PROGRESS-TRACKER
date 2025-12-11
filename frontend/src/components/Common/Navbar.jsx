 import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ demoMode = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [demoUser, setDemoUser] = useState(null);
  
  useEffect(() => {
    if (demoMode) {
      const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
      if (demoSession.isDemo) {
        setDemoUser({
          name: demoSession.demoRole === 'student' ? 'Demo Student' : 'Demo Teacher',
          role: demoSession.demoRole
        });
      }
    }
  }, [demoMode]);
  
  const handleLogout = () => {
    if (demoMode) {
      sessionStorage.removeItem('demoSession');
      navigate('/demo');
    } else {
      logout();
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-200 shadow rounded-b-xl px-8 py-4 flex justify-between items-center border-b border-blue-200">
      <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 shadow-sm flex items-center">
        <h1 className="text-xl font-bold text-blue-700 tracking-wide">Student Progress Tracker</h1>
      </div>
      {(user || demoUser) && (
        <div className="flex items-center space-x-4">
          <span className="text-blue-700 font-medium bg-blue-100 bg-opacity-60 px-4 py-2 rounded-lg shadow-sm">{`Logged in as: ${demoUser?.name || user?.name} (${demoUser?.role || user?.role})`}</span>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-200 transition-all border border-red-200"
          >
            {demoMode ? 'Exit Demo' : 'Logout'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
