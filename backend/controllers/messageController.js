const Message = require('../models/Message');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all messages for a user (teacher or student)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    
    console.log('====== GET MESSAGES DEBUG ======');
    console.log('getMessages request from:', {
      userId,
      userRole,
      userObject: req.user
    });
    
    let modelType;
    if (userRole === 'teacher') {
      modelType = 'Teacher';
    } else if (userRole === 'student') {
      modelType = 'Student';
    } else {
      modelType = 'User';
    }

    console.log('Looking for messages with query:', {
      '$or': [
        { recipient: userId, recipientModel: modelType },
        { sender: userId, senderModel: modelType }
      ]
    });

    // Since we're querying by User ID, not Student/Teacher ID, we need to check both:
    // 1. Direct ID match
    // 2. Querying by User ID in Teacher/Student collection
    
    // First, check if there's a corresponding Teacher/Student document for this user
    let query;
    
    if (modelType === 'Student') {
      const student = await Student.findOne({ userId });
      console.log('Found student:', student ? { id: student._id, userId: student.userId } : 'none');
      
      // Construct an OR query to check both IDs
      query = {
        $or: [
          // Check if either sender or recipient is the user ID
          { recipient: userId, recipientModel: modelType },
          { sender: userId, senderModel: modelType },
          
          // Check if either sender or recipient is the Student/Teacher ID (if found)
          ...(student ? [
            { recipient: student._id, recipientModel: modelType },
            { sender: student._id, senderModel: modelType }
          ] : [])
        ]
      };
    } else if (modelType === 'Teacher') {
      const teacher = await Teacher.findOne({ userId });
      console.log('Found teacher:', teacher ? { id: teacher._id, userId: teacher.userId } : 'none');
      
      // Construct an OR query to check both IDs
      query = {
        $or: [
          // Check if either sender or recipient is the user ID
          { recipient: userId, recipientModel: modelType },
          { sender: userId, senderModel: modelType },
          
          // Check if either sender or recipient is the Student/Teacher ID (if found)
          ...(teacher ? [
            { recipient: teacher._id, recipientModel: modelType },
            { sender: teacher._id, senderModel: modelType }
          ] : [])
        ]
      };
    } else {
      // For admin users, just use the user ID
      query = {
        $or: [
          { recipient: userId, recipientModel: modelType },
          { sender: userId, senderModel: modelType }
        ]
      };
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Get messages with the constructed query
    const messages = await Message.find(query).sort({ createdAt: -1 });
    
    console.log('Found messages for user:', {
      userId,
      modelType,
      messageCount: messages.length,
      sampleMessage: messages[0] ? {
        id: messages[0]._id,
        subject: messages[0].subject,
        sender: messages[0].sender,
        recipient: messages[0].recipient,
        senderModel: messages[0].senderModel,
        recipientModel: messages[0].recipientModel,
        isRead: messages[0].isRead
      } : null
    });

    // Manually populate sender and recipient based on their model types
    const populatedMessages = await Promise.all(messages.map(async (message) => {
      let populatedSender = null;
      let populatedRecipient = null;

      // Populate sender - find the actual Teacher/Student record using the User ID
      if (message.senderModel === 'Teacher') {
        const teacher = await Teacher.findOne({ userId: message.sender }).populate('userId', 'name email');
        populatedSender = teacher ? {
          _id: teacher._id,
          name: teacher.userId.name,
          email: teacher.userId.email,
          userId: message.sender // Add the original User ID for proper identification
        } : null;
      } else if (message.senderModel === 'Student') {
        const student = await Student.findOne({ userId: message.sender }).populate('userId', 'name email');
        populatedSender = student ? {
          _id: student._id,
          name: student.userId.name,
          email: student.userId.email,
          userId: message.sender // Add the original User ID for proper identification
        } : null;
      } else {
        populatedSender = await User.findById(message.sender).select('name email');
      }

      // Populate recipient - find the actual Teacher/Student record using the User ID
      if (message.recipientModel === 'Teacher') {
        const teacher = await Teacher.findOne({ userId: message.recipient }).populate('userId', 'name email');
        populatedRecipient = teacher ? {
          _id: teacher._id,
          name: teacher.userId.name,
          email: teacher.userId.email,
          userId: message.recipient // Add the original User ID for proper identification
        } : null;
      } else if (message.recipientModel === 'Student') {
        const student = await Student.findOne({ userId: message.recipient }).populate('userId', 'name email');
        populatedRecipient = student ? {
          _id: student._id,
          name: student.userId.name,
          email: student.userId.email,
          userId: message.recipient // Add the original User ID for proper identification
        } : null;
      } else {
        populatedRecipient = await User.findById(message.recipient).select('name email');
      }

      return {
        ...message.toObject(),
        sender: populatedSender,
        recipient: populatedRecipient
      };
    }));

    // Debug log a sample populated message
    if (populatedMessages.length > 0) {
      console.log('Sample populated message:', {
        id: populatedMessages[0]._id,
        subject: populatedMessages[0].subject,
        sender: {
          id: populatedMessages[0].sender?._id,
          name: populatedMessages[0].sender?.name,
          userId: populatedMessages[0].sender?.userId
        },
        recipient: {
          id: populatedMessages[0].recipient?._id,
          name: populatedMessages[0].recipient?.name,
          userId: populatedMessages[0].recipient?.userId
        },
        isRead: populatedMessages[0].isRead
      });
    } else {
      console.log('No messages found for user:', userId);
    }

    res.json({ success: true, messages: populatedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Get a specific message by ID
exports.getMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if the requesting user is either the sender or recipient
    // Convert both to strings for comparison to handle ObjectId vs string differences
    const senderId = message.sender.toString();
    const recipientId = message.recipient.toString();
    const currentUserId = userId.toString();
    
    console.log('Authorization check:', {
      messageId,
      senderId,
      recipientId,
      currentUserId,
      senderMatch: senderId === currentUserId,
      recipientMatch: recipientId === currentUserId
    });
    
    if (senderId !== currentUserId && recipientId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this message' });
    }
    
    // Manually populate sender and recipient
    let populatedSender = null;
    let populatedRecipient = null;

    // Populate sender - find the actual Teacher/Student record using the User ID
    if (message.senderModel === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: message.sender }).populate('userId', 'name email');
      populatedSender = teacher ? {
        _id: teacher._id,
        name: teacher.userId.name,
        email: teacher.userId.email,
        userId: message.sender // Include the original user ID for proper identification
      } : null;
    } else if (message.senderModel === 'Student') {
      const student = await Student.findOne({ userId: message.sender }).populate('userId', 'name email');
      populatedSender = student ? {
        _id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        userId: message.sender // Include the original user ID for proper identification
      } : null;
    } else {
      populatedSender = await User.findById(message.sender).select('name email');
    }

    // Populate recipient - find the actual Teacher/Student record using the User ID
    if (message.recipientModel === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: message.recipient }).populate('userId', 'name email');
      populatedRecipient = teacher ? {
        _id: teacher._id,
        name: teacher.userId.name,
        email: teacher.userId.email,
        userId: message.recipient // Include the original user ID for proper identification
      } : null;
    } else if (message.recipientModel === 'Student') {
      const student = await Student.findOne({ userId: message.recipient }).populate('userId', 'name email');
      populatedRecipient = student ? {
        _id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        userId: message.recipient // Include the original user ID for proper identification
      } : null;
    } else {
      populatedRecipient = await User.findById(message.recipient).select('name email');
    }

    const populatedMessage = {
      ...message.toObject(),
      sender: populatedSender,
      recipient: populatedRecipient
    };
    
    // Mark as read if the current authenticated user is the recipient
    if (message.recipient.toString() === String(userId) && !message.isRead) {
      message.isRead = true;
      await message.save();
      populatedMessage.isRead = true;
      console.log('Message marked as read:', messageId);
    }
    
    console.log('Returning populated message:', {
      id: populatedMessage._id,
      subject: populatedMessage.subject,
      sender: {
        id: populatedMessage.sender?._id,
        name: populatedMessage.sender?.name,
        userId: populatedMessage.sender?.userId
      },
      recipient: {
        id: populatedMessage.recipient?._id,
        name: populatedMessage.recipient?.name,
        userId: populatedMessage.recipient?.userId
      },
      isRead: populatedMessage.isRead
    });
    
    res.json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch message', error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    // DEBUG: Print incoming user and body for troubleshooting
    console.log('[DEBUG] sendMessage req.user:', req.user);
    console.log('[DEBUG] sendMessage req.body:', req.body);
    
    const { recipientId, recipientModel, subject, content } = req.body;
    const senderId = req.user._id || req.user.id;
    const senderRole = req.user.role;
    
    // Verify sender ID
    if (!senderId) {
      console.error('Missing sender ID in request user object:', req.user);
      return res.status(400).json({
        success: false,
        message: 'Authentication error: Missing sender ID',
        details: 'The user ID is missing from the authenticated user information'
      });
    }
    
    // Validate required fields
    if (!recipientId || !recipientModel || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: {
          recipientId: !recipientId,
          recipientModel: !recipientModel,
          subject: !subject,
          content: !content
        }
      });
    }
    
    // Validate recipient ID format
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID format',
        details: 'The recipient ID must be a valid MongoDB ObjectId'
      });
    }
    
    let senderModel;
    if (senderRole === 'teacher') {
      senderModel = 'Teacher';
    } else if (senderRole === 'student') {
      senderModel = 'Student';
    } else {
      senderModel = 'User';
    }
    
    // Since we're storing User IDs in the message, we need to find the User record
    // The recipientId should be a User ID, not a Teacher/Student ID
    const recipientUser = await User.findById(recipientId);
    
    if (!recipientUser) {
      console.error(`[ERROR] Recipient user not found with ID: ${recipientId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found',
        details: `Could not find a user with ID ${recipientId}`
      });
    }
    
    console.log(`[DEBUG] Found recipient:`, {
      id: recipientUser._id,
      name: recipientUser.name,
      email: recipientUser.email,
      role: recipientUser.role
    });
    
    // Verify that the recipient user has the correct role
    if (recipientModel === 'Student' && recipientUser.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient role',
        details: `Expected student role but found ${recipientUser.role}`
      });
    }
    
    if (recipientModel === 'Teacher' && recipientUser.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient role',
        details: `Expected teacher role but found ${recipientUser.role}`
      });
    }
    
    console.log('[DEBUG] About to save message:', {
      sender: senderId,
      senderModel,
      recipient: recipientId,
      recipientModel,
      subject,
      content: content.substring(0, 30) + (content.length > 30 ? '...' : '')
    });
    
    // Create and save the message using the User ID directly
    const newMessage = new Message({
      sender: senderId,
      senderModel,
      recipient: recipientId,
      recipientModel,
      subject,
      content
    });
    
    // Extra validation step to ensure we're saving IDs correctly
    console.log('[DEBUG] Saving message with:', {
      'sender.constructor': newMessage.sender.constructor.name,
      'sender': String(newMessage.sender),
      'recipient.constructor': newMessage.recipient.constructor.name,
      'recipient': String(newMessage.recipient),
      'senderModel': newMessage.senderModel,
      'recipientModel': newMessage.recipientModel
    });
    
    await newMessage.save();
    
    // Retrieve the saved message to confirm it was saved correctly
    const savedMessage = await Message.findById(newMessage._id);
    console.log('[DEBUG] Saved message:', {
      id: savedMessage._id,
      sender: String(savedMessage.sender),
      senderModel: savedMessage.senderModel,
      recipient: String(savedMessage.recipient),
      recipientModel: savedMessage.recipientModel
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully', 
      data: newMessage 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send message', 
      error: error.message 
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Check if the requesting user is either the sender or recipient
    // Convert both to strings for comparison to handle ObjectId vs string differences
    const senderId = message.sender.toString();
    const recipientId = message.recipient.toString();
    const currentUserId = userId.toString();
    
    if (senderId !== currentUserId && recipientId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message', error: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    
    let modelType;
    if (userRole === 'teacher') {
      modelType = 'Teacher';
    } else if (userRole === 'student') {
      modelType = 'Student';
    } else {
      modelType = 'User';
    }
    
    const count = await Message.countDocuments({
      recipient: userId,
      recipientModel: modelType,
      isRead: false
    });
    
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count', error: error.message });
  }
};