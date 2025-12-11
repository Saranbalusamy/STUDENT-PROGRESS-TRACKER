import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../services/api';
import { FaArrowLeft, FaChartLine, FaChartPie, FaClock, FaList } from 'react-icons/fa';

const PersonalAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/analytics/personal');
        if (response.data.success) {
          setAnalytics(response.data.analytics);
        } else {
          setError('Failed to load your analytics data');
        }
      } catch (err) {
        console.error('Error fetching personal analytics:', err);
        setError('An error occurred while loading your analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  // Format data for charts
  const formatCategoryData = () => {
    if (!analytics?.categoryDistribution || !analytics.categoryDistribution.length) {
      return [];
    }
    
    return analytics.categoryDistribution.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  const formatTimeData = () => {
    if (!analytics?.usageOverTime || !analytics.usageOverTime.length) {
      return [];
    }
    
    return analytics.usageOverTime.map(item => ({
      date: item._id,
      interactions: item.count
    }));
  };

  const formatHourlyData = () => {
    if (!analytics?.sessionTimes || !analytics.sessionTimes.length) {
      return [];
    }
    
    // Create a 24-hour array with 0 counts
    const hourlyData = Array.from(Array(24).keys()).map(hour => ({
      hour: `${hour}:00`,
      interactions: 0
    }));
    
    // Fill in actual data
    analytics.sessionTimes.forEach(item => {
      const hourIndex = parseInt(item._id);
      if (hourIndex >= 0 && hourIndex < 24) {
        hourlyData[hourIndex].interactions = item.count;
      }
    });
    
    return hourlyData;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Learning Analytics</h1>
              <p className="text-gray-600">
                Track your AI learning assistant usage and patterns
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Usage Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Interactions</p>
                    <p className="text-2xl font-bold text-indigo-600">{analytics?.totalInteractions || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Different Topics</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics?.categoryDistribution?.length || 0}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Last Interaction</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics?.recentActivity && analytics.recentActivity.length > 0 
                        ? new Date(analytics.recentActivity[0].createdAt).toLocaleDateString() 
                        : 'None'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Main Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Usage Over Time */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <FaChartLine className="text-indigo-500 mr-2" />
                    <h2 className="text-lg font-semibold">Usage Over Time</h2>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatTimeData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="interactions" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Topic Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <FaChartPie className="text-indigo-500 mr-2" />
                    <h2 className="text-lg font-semibold">Topic Distribution</h2>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formatCategoryData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {formatCategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Time of Day Usage */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FaClock className="text-indigo-500 mr-2" />
                  <h2 className="text-lg font-semibold">Time of Day Usage</h2>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatHourlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="interactions" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FaList className="text-indigo-500 mr-2" />
                  <h2 className="text-lg font-semibold">Recent Questions</h2>
                </div>
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Question
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.recentActivity.map((activity, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                              {activity.query}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity found.</p>
                )}
              </div>
              
              {/* Learning Suggestions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Personalized Learning Insights</h2>
                {analytics?.categoryDistribution && analytics.categoryDistribution.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Based on your usage patterns, here are some insights to help you maximize your learning:
                    </p>
                    <ul className="space-y-2 ml-5 list-disc text-gray-700">
                      <li>
                        You've been most active in <span className="font-medium text-indigo-600">
                          {analytics.categoryDistribution[0]._id}
                        </span> topics.
                      </li>
                      {analytics.usageOverTime && analytics.usageOverTime.length > 1 && (
                        <li>
                          Your usage has {
                            analytics.usageOverTime[analytics.usageOverTime.length - 1].count > 
                            analytics.usageOverTime[0].count ? 'increased' : 'decreased'
                          } over time. {
                            analytics.usageOverTime[analytics.usageOverTime.length - 1].count > 
                            analytics.usageOverTime[0].count ? 
                            'Great job staying engaged!' : 
                            'Consider scheduling regular learning sessions.'
                          }
                        </li>
                      )}
                      {analytics.sessionTimes && analytics.sessionTimes.length > 0 && (
                        <li>
                          You tend to study most during the {
                            (() => {
                              const hour = parseInt(analytics.sessionTimes[0]._id);
                              if (hour >= 5 && hour < 12) return 'morning';
                              if (hour >= 12 && hour < 17) return 'afternoon';
                              if (hour >= 17 && hour < 22) return 'evening';
                              return 'night';
                            })()
                          } hours.
                        </li>
                      )}
                      {analytics.categoryDistribution.length > 1 && (
                        <li>
                          Consider exploring more topics in <span className="font-medium text-indigo-600">
                            {analytics.categoryDistribution.slice(-1)[0]._id}
                          </span> to diversify your knowledge.
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Start interacting with the AI learning assistant to receive personalized insights.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PersonalAnalytics;