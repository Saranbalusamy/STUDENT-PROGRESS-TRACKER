import React, { useState, useEffect } from 'react';
import { messageApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import { FaEnvelope, FaPaperPlane, FaTrash, FaInbox, FaEye } from 'react-icons/fa';

const StudentMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const navigate = useNavigate();

  // Function to fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getMessages();
      console.log('Fetched messages:', response.data.messages);
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages on component mount and active tab change
  useEffect(() => {
    fetchMessages();
    
    // Refresh messages every 30 seconds
    const intervalId = setInterval(fetchMessages, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeTab]);

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      setLoading(true);
      await messageApi.deleteMessage(messageId);
      
      // Update messages list
      setMessages(messages.filter(message => message._id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on active tab
  const filteredMessages = messages.filter(message => {
    const user = JSON.parse(localStorage.getItem('user'));
    const studentId = user && (user.id || user._id);
    
    // Enhanced debugging for message filtering
    console.log('Filtering message:', {
      messageId: message._id,
      subject: message.subject,
      tab: activeTab,
      senderModel: message.senderModel,
      recipientModel: message.recipientModel,
    });
    
    // Convert IDs to strings for reliable comparison
    const studentIdStr = String(studentId);
    
    // Get all possible IDs for this message's sender and recipient
    // This handles the various ways IDs can be stored
    const getSenderIds = () => {
      const ids = new Set();
      
      // Add raw sender ID if it exists
      if (message.sender) {
        if (typeof message.sender === 'string') {
          ids.add(String(message.sender));
        } else if (typeof message.sender === 'object') {
          // Add sender._id if it exists
          if (message.sender._id) {
            ids.add(String(message.sender._id));
          }
          
          // Add sender.userId if it exists
          if (message.sender.userId) {
            if (typeof message.sender.userId === 'string') {
              ids.add(String(message.sender.userId));
            } else if (typeof message.sender.userId === 'object' && message.sender.userId._id) {
              ids.add(String(message.sender.userId._id));
            }
          }
        }
      }
      
      return Array.from(ids);
    };
    
    const getRecipientIds = () => {
      const ids = new Set();
      
      // Add raw recipient ID if it exists
      if (message.recipient) {
        if (typeof message.recipient === 'string') {
          ids.add(String(message.recipient));
        } else if (typeof message.recipient === 'object') {
          // Add recipient._id if it exists
          if (message.recipient._id) {
            ids.add(String(message.recipient._id));
          }
          
          // Add recipient.userId if it exists
          if (message.recipient.userId) {
            if (typeof message.recipient.userId === 'string') {
              ids.add(String(message.recipient.userId));
            } else if (typeof message.recipient.userId === 'object' && message.recipient.userId._id) {
              ids.add(String(message.recipient.userId._id));
            }
          }
        }
      }
      
      return Array.from(ids);
    };
    
    // Get all IDs for comparison
    const senderIds = getSenderIds();
    const recipientIds = getRecipientIds();
    
    console.log('ID comparison:', {
      studentId: studentIdStr,
      senderIds,
      recipientIds
    });
    
    if (activeTab === 'inbox') {
      // For inbox, show all messages where:
      // 1. This student is the recipient
      // 2. OR it's sent to a student model and one of the recipient IDs matches this student
      
      const isRecipient = recipientIds.includes(studentIdStr);
      const isStudentRecipient = message.recipientModel === 'Student';
      
      const shouldShow = isStudentRecipient && isRecipient;
      
      console.log(`Message ${message._id} inbox decision:`, {
        isStudentRecipient,
        isRecipient,
        shouldShow
      });
      
      return shouldShow;
    } else if (activeTab === 'sent') {
      // For sent, show all messages where:
      // 1. This student is the sender
      // 2. OR it's sent from a student model and one of the sender IDs matches this student
      
      const isSender = senderIds.includes(studentIdStr);
      const isStudentSender = message.senderModel === 'Student';
      
      const shouldShow = isStudentSender && isSender;
      
      console.log(`Message ${message._id} sent decision:`, {
        isStudentSender,
        isSender, 
        shouldShow
      });
      
      return shouldShow;
    }
    
    return false; // Default to not showing if tab is unknown
  });

  // View a message with notification update
  const handleViewMessage = async (messageId) => {
    try {
      // Navigate to message view
      navigate(`/student/message/${messageId}`);
      
      // Refresh unread count to update notifications
      await messageApi.refreshUnreadCount();
    } catch (err) {
      console.error('Error handling message view:', err);
    }
  };

  if (loading && messages.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton customClass="mb-4" />
      
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaEnvelope className="mr-3" /> Student Messaging Portal
            </h1>
            <p className="text-green-100 mt-2">Stay connected with your teachers</p>
          </div>
          <button 
            onClick={fetchMessages} 
            className="bg-white text-green-700 px-4 py-2 rounded-lg shadow hover:bg-green-50 transition-all flex items-center"
            disabled={loading}
          >
            <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Messages'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold">Error</p>
          </div>
          <p className="mt-1">{error}</p>
          <button 
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1 shadow-md">
        <button
          className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
            activeTab === 'inbox'
              ? 'bg-white text-green-600 shadow-md font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('inbox')}
        >
          <FaInbox className="mr-2" /> Inbox
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
            activeTab === 'sent'
              ? 'bg-white text-green-600 shadow-md font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <FaPaperPlane className="mr-2" /> Sent
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-10">
            <FaEnvelope className="mx-auto text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No messages found</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeTab === 'inbox' 
                ? 'You have no new messages from your teachers' 
                : 'You haven\'t sent any messages yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {activeTab === 'inbox' ? 'From' : 'To'}
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Subject
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr
                    key={message._id}
                    className={`hover:bg-gray-50 transition duration-150 ${
                      !message.isRead && activeTab === 'inbox'
                        ? 'font-medium bg-green-50'
                        : ''
                    }`}
                  >
                    <td 
                      className="py-3 px-4 border-b"
                      onClick={() => handleViewMessage(message._id)}
                    >
                      <div className="flex items-center cursor-pointer">
                        {activeTab === 'inbox' && !message.isRead && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        )}
                        {activeTab === 'inbox'
                          ? (message.sender?.name || 'Unknown')
                          : (message.recipient?.name || 'Unknown')}
                      </div>
                    </td>
                    <td 
                      className="py-3 px-4 border-b cursor-pointer"
                      onClick={() => handleViewMessage(message._id)}
                    >
                      {message.subject}
                    </td>
                    <td 
                      className="py-3 px-4 border-b cursor-pointer"
                      onClick={() => handleViewMessage(message._id)}
                    >
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewMessage(message._id)}
                          className="text-green-600 hover:text-green-800 transition duration-150 flex items-center"
                          title="View message"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-red-600 hover:text-red-800 transition duration-150 flex items-center"
                          title="Delete message"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessaging;