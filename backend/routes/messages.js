const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// Get all messages for the authenticated user
router.get('/', auth, messageController.getMessages);

// Get unread message count
router.get('/unread', auth, messageController.getUnreadCount);

// Get a specific message by ID
router.get('/:id', auth, messageController.getMessage);

// Send a new message
router.post('/', auth, messageController.sendMessage);

// Delete a message
router.delete('/:id', auth, messageController.deleteMessage);

module.exports = router;