import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import { FaRobot, FaLightbulb, FaArrowUp, FaArrowDown, FaEquals, FaStar, FaBrain } from 'react-icons/fa';

// Demo insights data
const demoInsights = [
  "Your performance in Mathematics is excellent. You've consistently scored above 90% in recent assessments.",
  "Your attendance in Science classes has improved by 5% this semester. Keep up the good work!",
  "You're showing consistent performance in English. Consider participating in more writing activities to improve further.",
  "History remains an area for improvement. Recommendation: Create flashcards for important dates and events.",
  "You're excelling in Computer Science with scores consistently above class average. Consider exploring advanced topics.",
  "Your overall performance trend shows improvement since the beginning of the semester.",
  "You've been particularly strong in problem-solving tasks across subjects.",
  "Recommendation: To improve retention, review class materials within 24 hours of each lesson.",
  "Your test preparation strategy appears effective. Continue with your current approach.",
  "Analysis shows you perform better on morning assessments compared to afternoon sessions.",
  "Your participation in group activities correlates positively with your academic performance.",
  "Consider allocating more study time for History to bring it up to the level of your other subjects."
];

const DemoStudentAIInsights = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Check if this is a valid demo session
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
    if (!demoSession.isDemo || demoSession.demoRole !== 'student') {
      navigate('/demo');
      return;
    }
    
    // Set the demo insights
    setInsights(demoInsights);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Get icon based on insight type
  const getInsightIcon = (text) => {
    if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('low')) {
      return <FaArrowDown className="text-red-500 text-xl" />;
    } else if (text.toLowerCase().includes('good') || text.toLowerCase().includes('high') || text.toLowerCase().includes('excellent')) {
      return <FaArrowUp className="text-green-500 text-xl" />;
    } else if (text.toLowerCase().includes('average') || text.toLowerCase().includes('consistent')) {
      return <FaEquals className="text-yellow-500 text-xl" />;
    } else if (text.toLowerCase().includes('recommendation') || text.toLowerCase().includes('suggest') || text.toLowerCase().includes('consider')) {
      return <FaLightbulb className="text-yellow-400 text-xl" />;
    } else {
      return <FaStar className="text-blue-500 text-xl" />;
    }
  };

  // Format the insight to highlight key performance indicators
  const formatInsight = (text) => {
    return text.replace(
      /(excellent|good|improved|improvement|consistent|above|strong|effective|better)/gi, 
      match => `<span class="text-green-600 font-medium">${match}</span>`
    ).replace(
      /(low|lower|below|weakness|area for improvement|remains)/gi,
      match => `<span class="text-red-600 font-medium">${match}</span>`
    ).replace(
      /(Mathematics|Science|English|History|Computer Science)/gi,
      match => `<span class="text-purple-600 font-medium">${match}</span>`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white text-center py-2">
          DEMO MODE - This is a demonstration with sample data. No changes will be saved.
        </div>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto mt-12">
          <Navbar demoMode={true} />
          <main className="p-8 max-w-6xl mx-auto w-full flex justify-center items-center">
            <LoadingSpinner text="Loading AI insights..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white text-center py-2">
        DEMO MODE - This is a demonstration with sample data. No changes will be saved.
      </div>
      <div className="w-64 mt-12">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-auto mt-12">
        <Navbar demoMode={true} />
        <main className="p-8 max-w-6xl mx-auto w-full">
          <h2 className="text-3xl font-bold mb-6">AI-Powered Insights (Demo)</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <FaBrain className="text-purple-500 mr-3 text-2xl" />
              <h3 className="text-xl font-semibold">Personalized Performance Analysis</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Our AI system analyzes your academic performance across all subjects, attendance patterns, 
              and learning behaviors to provide personalized insights and recommendations.
            </p>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> This is a demonstration with sample insights. In the full version,
                the AI system continuously learns from your performance to provide increasingly accurate insights.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <FaRobot className="text-purple-500 mr-2" />
              Your Personalized Insights
            </h3>
            
            {insights.length === 0 ? (
              <p className="text-gray-600">No insights available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="mr-3 mt-1">{getInsightIcon(insight)}</div>
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: formatInsight(insight) }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-4 border border-dashed border-purple-300 rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center">
                <FaLightbulb className="text-yellow-500 mr-2" />
                How to Use These Insights
              </h4>
              <ul className="list-disc pl-6 text-sm text-purple-800 space-y-1">
                <li>Review your strengths and areas for improvement</li>
                <li>Focus your study time on subjects that need more attention</li>
                <li>Apply the recommended learning strategies</li>
                <li>Track your progress over time to see improvements</li>
                <li>Discuss these insights with your teachers for further guidance</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoStudentAIInsights;