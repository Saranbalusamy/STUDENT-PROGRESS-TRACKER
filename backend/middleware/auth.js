 const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    // Convert MongoDB document to plain object and add additional properties
    const userObj = user.toObject();
    
    req.user = {
      ...userObj,
      // Add id as an alias for _id to maintain compatibility
      id: userObj._id,
      studentId: decoded.studentId,
      teacherId: decoded.teacherId
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { auth, authorize };
