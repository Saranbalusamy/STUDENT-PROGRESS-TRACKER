import React from 'react';
import { useNavigate } from 'react-router-dom';

const DemoSelect = () => {
  const navigate = useNavigate();

  const handleDemoLogin = (role) => {
    // Create a demo session with temporary credentials that won't be stored in DB
    const demoCredentials = {
      isDemo: true,
      demoRole: role,
      token: `demo_token_${role}_${Date.now()}`, // Not a real token, just for session tracking
    };
    
    // Store demo credentials in sessionStorage (not localStorage) to be temporary
    sessionStorage.setItem('demoSession', JSON.stringify(demoCredentials));
    
    // Redirect to the appropriate demo dashboard
    if (role === 'student') {
      navigate('/demo/student');
    } else if (role === 'teacher') {
      navigate('/demo/teacher');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-4xl w-full p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Try Our <span className="text-purple-600">Demo</span>
          </h1>
          <p className="text-lg text-gray-600">
            Experience our platform without creating an account. Choose a role below to see how it works.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Note: Demo data is not stored in the database and will be reset when you leave the page.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Demo */}
          <div 
            className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-purple-300 transition-all cursor-pointer transform hover:scale-105 hover:shadow-xl"
            onClick={() => handleDemoLogin('student')}
          >
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Demo</h2>
            <p className="text-gray-600 mb-6">
              Experience the student portal with sample data showing grades, attendance, and AI learning assistant.
            </p>
            <div className="text-purple-600 font-semibold flex items-center">
              Try Student Demo
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Teacher Demo */}
          <div 
            className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-indigo-300 transition-all cursor-pointer transform hover:scale-105 hover:shadow-xl"
            onClick={() => handleDemoLogin('teacher')}
          >
            <div className="text-5xl mb-4">👩‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Demo</h2>
            <p className="text-gray-600 mb-6">
              Explore teacher features like marking attendance, entering grades, and using the teacher assistant.
            </p>
            <div className="text-indigo-600 font-semibold flex items-center">
              Try Teacher Demo
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoSelect;