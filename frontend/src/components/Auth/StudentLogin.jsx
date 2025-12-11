 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../Common/BackButton';
import LoadingSpinner from '../Common/LoadingSpinner';
import api from '../../services/api';
import { FaUserGraduate, FaSchool, FaIdCard, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const StudentLogin = () => {
  const [className, setClassName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        if (response.data.success) {
          setClasses(response.data.classes);
        } else {
          setError('Failed to load classes. Please refresh the page.');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const onSubmit = async e => {
    e.preventDefault();
    setLoggingIn(true);
    setError('');
    
    try {
      const res = await login({ className, rollNo, password }, 'student');
      if (res.success) {
        navigate('/student/dashboard');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <LoadingSpinner text="Loading classes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton customClass="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border border-gray-200 shadow-lg" />
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaUserGraduate className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Portal</h1>
            <p className="text-gray-600">Access your learning dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 mr-2">⚠️</div>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Class Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Class
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSchool className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                  required
                  disabled={loggingIn}
                >
                  <option value="">Choose your class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Roll Number Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your roll number"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  required
                  disabled={loggingIn}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  required
                  disabled={loggingIn}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loggingIn}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loggingIn ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaUserGraduate className="h-5 w-5 mr-2" />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help with your account?{' '}
              <button 
                onClick={() => navigate('/#contact')}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors underline bg-transparent border-none cursor-pointer"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Secure student access portal for your educational journey
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
