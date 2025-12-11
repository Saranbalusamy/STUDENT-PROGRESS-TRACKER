 import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageApi } from '../../services/api';
import { FaEnvelope } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [demoSession, setDemoSession] = useState(null);
  
  useEffect(() => {
    // Check if in demo mode
    const savedDemoSession = JSON.parse(sessionStorage.getItem('demoSession') || 'null');
    if (savedDemoSession && savedDemoSession.isDemo) {
      setDemoSession(savedDemoSession);
      return;
    }
    
    // Only fetch message count if user is logged in
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await messageApi.getUnreadCount();
          if (response.data.success) {
            setUnreadMessages(response.data.unreadCount);
          }
        } catch (error) {
          console.warn('Failed to fetch unread messages count:', error);
        }
      };
      
      fetchUnreadCount();
      
      // Listen for updates to unread count from other components
      const handleUnreadUpdate = (event) => {
        setUnreadMessages(event.detail.count);
      };
      
      window.addEventListener('unread-messages-updated', handleUnreadUpdate);
      
      // Set up polling to check for new messages every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('unread-messages-updated', handleUnreadUpdate);
      };
    }
  }, [user]);

  // Demo menu items - simplified versions for demo mode
  const demoMenuItems = {
    student: [
      { name: 'Dashboard', path: '/demo/student' },
      { name: 'Performance', path: '/demo/student/performance' },
      { name: 'Attendance', path: '/demo/student/attendance' },
      { name: 'AI Tutor', path: '/demo/student/tutor' },
    ],
    teacher: [
      { name: 'Dashboard', path: '/demo/teacher' },
      { name: 'Attendance', path: '/demo/teacher/attendance' },
      { name: 'Marks Entry', path: '/demo/teacher/marks' },
      { name: 'Schedule', path: '/demo/teacher/schedule' },
    ]
  };
  
  // Regular menu items for authenticated users
  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Class Management', path: '/admin/classes' },
      { name: 'Student Management', path: '/admin/students' },
      { name: 'Teacher Management', path: '/admin/teachers' },
      { name: 'Timetable Management', path: '/admin/timetable' },
    ],
    teacher: [
      { name: 'Dashboard', path: '/teacher/dashboard' },
      { name: 'Attendance', path: '/teacher/attendance' },
      { name: 'Marks Entry', path: '/teacher/marks' },
      { name: 'Timetable', path: '/teacher/timetable' },
      { 
        name: 'Messages', 
        path: '/teacher/messages', 
        badge: unreadMessages > 0 ? unreadMessages : null,
        icon: <FaEnvelope />
      },
    ],
    student: [
      { name: 'Dashboard', path: '/student/dashboard' },
      { name: 'Performance', path: '/student/performance' },
      { name: 'Attendance', path: '/student/attendance' },
      { name: 'AI Insights', path: '/student/insights' },
      { name: 'Progress Report', path: '/student/report' },
      { 
        name: 'Messages', 
        path: '/student/messages', 
        badge: unreadMessages > 0 ? unreadMessages : null,
        icon: <FaEnvelope />
      },
    ]
  };

  // Determine which routes to display based on user role or demo session
  let routes = [];
  if (demoSession?.isDemo) {
    routes = demoMenuItems[demoSession.demoRole] || [];
  } else {
    routes = menuItems[user?.role] || [];
  }

  return (
    <aside className="bg-gray-200 w-56 p-4 min-h-screen">
      <nav className="flex flex-col space-y-2">
        {routes.map(({ name, path, badge, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `block p-2 rounded flex items-center justify-between ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'}`
            }
          >
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <span>{name}</span>
            </div>
            {badge && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
