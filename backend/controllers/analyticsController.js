const LLMAnalytics = require('../models/LLMAnalytics');

// Get personal analytics for a user
const getPersonalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id; // Use the actual user ObjectId
    const userRole = req.user.role;
    
    // Get total interactions
    const totalInteractions = await LLMAnalytics.countDocuments({ 
      userId, 
      userRole 
    });
    
    // Get category distribution
    const categoryDistribution = await LLMAnalytics.aggregate([
      { $match: { userId, userRole } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent activity (last 10 interactions)
    const recentActivity = await LLMAnalytics.find(
      { userId, userRole },
      { query: 1, category: 1, createdAt: 1, _id: 0 }
    )
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get usage over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const usageOverTime = await LLMAnalytics.aggregate([
      { 
        $match: { 
          userId, 
          userRole,
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { 
        $group: { 
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get most common session times
    const sessionTimes = await LLMAnalytics.aggregate([
      { $match: { userId, userRole } },
      { 
        $group: { 
          _id: { 
            $dateToString: { 
              format: '%H', 
              date: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalInteractions,
        categoryDistribution,
        recentActivity,
        usageOverTime,
        sessionTimes
      }
    });
  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal analytics' });
  }
};

module.exports = {
  getPersonalAnalytics
};