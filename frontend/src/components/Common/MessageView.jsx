import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const response = await messageApi.getMessage(id);
        setMessage(response.data.message);
        
        // After viewing a message, refresh the unread count
        // This will update the notification count in the sidebar
        try {
          await messageApi.refreshUnreadCount();
        } catch (err) {
          console.error('Error refreshing unread count:', err);
        }
      } catch (err) {
        console.error('Error fetching message:', err);
        setError('Failed to load message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      setLoading(true);
      await messageApi.deleteMessage(id);
      navigate(-1);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine recipient based on current user role
      const user = JSON.parse(localStorage.getItem('user'));
      const isTeacher = user && user.role === 'teacher';
      
      // For replies, we need to use the opposite party of the original message
      // If current user is teacher → recipient should be the student (original sender)
      // If student → recipient should be the teacher (original sender)
      
      // Use the correct ID (User ID) for the recipient
      let recipientId;
      let recipientModel;
      
      // Enhanced ID extraction to handle different ID formats
      const extractUserId = (entity) => {
        if (!entity) {
          console.error('Entity is null or undefined');
          return null;
        }
        
        // Try various ways to extract the userId
        if (typeof entity === 'string') {
          return entity;
        }
        
        if (entity.userId) {
          if (typeof entity.userId === 'string') {
            return entity.userId;
          }
          if (typeof entity.userId === 'object' && entity.userId._id) {
            return entity.userId._id;
          }
        }
        
        return entity._id || entity.id;
      };
      
      if (isTeacher) {
        // Teacher replying to student
        // Student's userId should be used as the recipient
        recipientId = extractUserId(message.sender);
        recipientModel = 'Student';
      } else {
        // Student replying to teacher
        // Teacher's userId should be used as the recipient
        recipientId = extractUserId(message.sender);
        recipientModel = 'Teacher';
      }
      
      // Log detailed information about message and recipient
      console.log('DETAILED MESSAGE INFO:', {
        originalMessage: message,
        senderDetails: {
          ...message.sender,
          extractedId: extractUserId(message.sender)
        },
        recipientDetails: {
          ...message.recipient,
          extractedId: extractUserId(message.recipient)
        },
        currentUser: user,
        isTeacher,
        selectedRecipientId: recipientId,
        selectedRecipientModel: recipientModel
      });
      
      // Check if the ID is actually a valid MongoDB ObjectId
      // MongoDB ObjectIds are typically 24 character hex strings
      const isValidObjectId = (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
      };
      
      if (!isValidObjectId(recipientId)) {
        console.error('Invalid recipient ID:', recipientId);
        setError('Cannot send message: Invalid recipient ID');
        setLoading(false);
        return;
      }
      
      const messageData = {
        recipientId,
        recipientModel,
        subject: `Re: ${message.subject}`,
        content: replyContent
      };
      
      console.log('Sending message with data:', messageData);
      
      try {
        const response = await messageApi.sendMessage(messageData);
        console.log('Message sent successfully:', response.data);
        alert('Reply sent successfully');
        navigate('/student/messages');
      } catch (err) {
        console.error('Error response:', err.response?.data);
        throw err;
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      // Provide more specific error messages based on the error response
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to send reply: ${err.response.data.message}`);
      } else if (err.isConnectionError) {
        setError('Network error: Please check your internet connection and try again');
      } else {
        setError('Failed to send reply. Please try again later.');
      }
      setLoading(false);
    }
  };

  if (loading && !message) {
    return <LoadingSpinner />;
  }

  if (error && !message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Message not found
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{message.subject}</h1>
          
          <div className="flex justify-between text-gray-600 mb-4">
            <div>
              <span className="font-semibold">From:</span> {message.sender.name}
            </div>
            <div>
              <span className="font-semibold">To:</span> {message.recipient.name}
            </div>
            <div>
              <span className="font-semibold">Date:</span> {formatDate(message.createdAt)}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
          
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
        </div>
        
        {showReplyForm && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-xl font-bold mb-4">Reply</h2>
            
            <form onSubmit={handleReply}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Message:
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageView;