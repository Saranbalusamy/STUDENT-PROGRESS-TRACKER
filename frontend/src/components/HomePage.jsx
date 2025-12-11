import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      title: 'Admin Portal',
      description: 'Manage classes, students, teachers with comprehensive analytics',
      icon: '👨‍💼',
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-400 to-cyan-400',
      route: '/admin/login',
      neonColor: 'shadow-blue-500/50'
    },
    {
      title: 'Teacher Portal',
      description: 'Enter marks, track attendance, monitor student progress',
      icon: '👩‍🏫',
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'from-green-400 to-emerald-400',
      route: '/teacher/login',
      neonColor: 'shadow-green-500/50'
    },
    {
      title: 'Student Portal',
      description: 'View marks, attendance, and AI-powered insights',
      icon: '🎓',
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-400 to-pink-400',
      route: '/student/login',
      neonColor: 'shadow-purple-500/50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-gradient-to-r from-yellow-100 to-blue-100 backdrop-blur-md border-b border-yellow-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-800">
                📊 Student Progress Tracker
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-yellow-600 transition-colors font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-yellow-600 transition-colors font-medium">About</a>
              <a href="#features" className="text-gray-700 hover:text-yellow-600 transition-colors font-medium">Features</a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">Home</a>
                <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">About</a>
                <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className={`space-y-8 transform transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                  Track Your
                  <br />
                  <span className="text-yellow-600">
                    Academic Progress
                  </span>
                  <br />
                  <span className="text-blue-600">
                    Effortlessly
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  A modern platform for students, teachers, and admins to manage academic records, 
                  attendance, and performance with AI-powered insights and beautiful visualizations.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/demo')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Try Demo
                </button>
                
                <button 
                  className="px-8 py-4 border-2 border-blue-300 text-blue-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  onClick={() => navigate('/learn-more')}
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Professional Illustration */}
            <div className={`transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Professional Card Stack */}
                <div className="relative w-full h-96">
                  {/* Back Card */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 transform rotate-2"></div>
                  
                  {/* Middle Card */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 transform -rotate-1"></div>
                  
                  {/* Front Card */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                    <img
                      src={require('../assets/image123.jpg')}
                      alt="Students collaborating in a classroom with a teacher"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Subtle Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-100 rounded-full shadow-sm"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-100 rounded-full shadow-sm"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-200 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-yellow-600">Portal</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access powerful tools designed specifically for your role in the educational ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                onClick={() => navigate(feature.route)}
                className={`group relative p-8 rounded-2xl bg-white cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200 hover:border-yellow-300`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  opacity: isLoaded ? 1 : 0
                }}
              >
                {/* Content */}
                <div className="text-center space-y-6">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="pt-4">
                    <div className="inline-flex items-center px-6 py-3 bg-yellow-50 rounded-full text-yellow-600 font-semibold group-hover:bg-yellow-100 transition-all duration-300">
                      Access Portal
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              About <span className="text-yellow-600">Our Platform</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing education management with cutting-edge technology and AI-powered insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Technology</h3>
              <p className="text-gray-600">Built with the latest web technologies for optimal performance and user experience</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Get personalized recommendations and performance analytics powered by artificial intelligence</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Track progress with beautiful visualizations and comprehensive reporting tools</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Communication</h3>
              <p className="text-gray-600">Built-in messaging system for teachers and students to communicate effectively and stay connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="relative z-10 py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              📝 Share Your Feedback
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us improve! Share your experience and suggestions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Feedback */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="text-5xl mb-3">🎓</div>
                <h3 className="text-2xl font-bold">Student Feedback</h3>
                <p className="text-blue-100 mt-2">Share your learning experience</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Tell us about your experience with attendance tracking, performance monitoring, and the AI tutor features.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf7nXZB-MOFkoNXfUfO8239xobW7QepjBHlvgFOp29TtwK9gA/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Submit Student Feedback →
                </a>
              </div>
            </div>

            {/* Teacher Feedback */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <div className="text-5xl mb-3">👨‍🏫</div>
                <h3 className="text-2xl font-bold">Teacher Feedback</h3>
                <p className="text-purple-100 mt-2">Help us enhance teaching tools</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Share your thoughts on class management, attendance marking, grade entry, and analytics features.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdLBSElAc8HLEx2R-1SDo3AYCbNdq2FEecRiN8O8bm531cjvw/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Submit Teacher Feedback →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                📊 Student Progress Tracker
              </div>
              <p className="text-gray-300">
                Empowering education through technology and innovation.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#home" className="block text-gray-300 hover:text-yellow-400 transition-colors">Home</a>
                <a href="#features" className="block text-gray-300 hover:text-yellow-400 transition-colors">Features</a>
                <a href="#about" className="block text-gray-300 hover:text-yellow-400 transition-colors">About</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>📧 saranvenkatesh2005@gmail.com</p>
                <p>📞 +91 9787773436</p>
                <p>📍 Chennai, Tamil Nadu, India</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Student Progress Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
