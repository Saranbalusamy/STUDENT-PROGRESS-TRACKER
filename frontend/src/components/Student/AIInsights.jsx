import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { FaRobot, FaLightbulb, FaArrowUp, FaArrowDown, FaEquals, FaStar } from 'react-icons/fa';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/insights');
        if (res.data.success) {
          setInsights(res.data.insights);
        } else {
          setError('Failed to load insights');
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(err.response?.data?.message || 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Get icon based on insight type
  const getInsightIcon = (text) => {
    if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('low')) {
      return <FaArrowDown className="text-red-500 text-xl" />;
    } else if (text.toLowerCase().includes('good') || text.toLowerCase().includes('high') || text.toLowerCase().includes('excellent')) {
      return <FaArrowUp className="text-green-500 text-xl" />;
    } else if (text.toLowerCase().includes('average') || text.toLowerCase().includes('consistent')) {
      return <FaEquals className="text-yellow-500 text-xl" />;
    } else if (text.toLowerCase().includes('recommendation') || text.toLowerCase().includes('suggest')) {
      return <FaLightbulb className="text-yellow-400 text-xl" />;
    } else {
      return <FaStar className="text-blue-500 text-xl" />;
    }
  };

  // Format the insight to highlight key performance indicators
  const formatInsight = (text) => {
    return text
      .replace(/(\d+%)/g, '<span class="font-bold text-blue-600">$1</span>')
      .replace(/(excellent|good|great|outstanding)/gi, '<span class="font-bold text-green-600">$1</span>')
      .replace(/(low|poor|decrease|declining)/gi, '<span class="font-bold text-red-600">$1</span>')
      .replace(/(average|consistent)/gi, '<span class="font-bold text-yellow-600">$1</span>');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="p-8 max-w-4xl mx-auto w-full">
          <BackButton customClass="mb-4" />
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center">
              <FaRobot className="text-3xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Performance Insights</h2>
                <p className="text-indigo-200">Smart analysis of your academic performance</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center">
              <LoadingSpinner text="Analyzing your performance data..." />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : insights.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaRobot className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No insights available yet. Check back later as more data becomes available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((text, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
                      {getInsightIcon(text)}
                    </div>
                    <div>
                      <p 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatInsight(text) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center mb-3">
                  <FaLightbulb className="mr-2 text-yellow-400" /> How to Use These Insights
                </h3>
                <ul className="list-disc pl-6 text-blue-700 space-y-2">
                  <li>Review each insight to understand your strengths and areas for improvement</li>
                  <li>Focus on subjects with lower performance percentages</li>
                  <li>Discuss specific recommendations with your teachers</li>
                  <li>Track your progress over time to see improvements</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AIInsights;
