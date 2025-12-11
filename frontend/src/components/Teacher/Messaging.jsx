import React, { useState, useEffect } from 'react';
import api, { messageApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Common/LoadingSpinner';
import BackButton from '../Common/BackButton';
import { FaEnvelope, FaPaperPlane, FaTrash, FaInbox, FaPencilAlt, FaEye, FaUserPlus, FaTimesCircle, FaUsers } from 'react-icons/fa';

const TeacherMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectMode, setSelectMode] = useState('single'); // 'single' or 'multiple'
  const navigate = useNavigate();

  // Function to fetch messages and students
  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesRes, studentsRes] = await Promise.all([
        messageApi.getMessages(),
        api.get('/teacher/students')
      ]);
      
      console.log('Fetched teacher messages:', messagesRes.data.messages);
      setMessages(messagesRes.data.messages);
      setStudents(studentsRes.data.students);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load messages or students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages and students on component mount and active tab change
  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeTab]);

  // Add student to selected list
  const handleAddStudent = (studentId) => {
    const student = students.find(s => s._id === studentId);
    
    if (student) {
      // Check if student has a valid userId
      if (
        !(
          (typeof student.userId === 'object' && student.userId && student.userId._id) || 
          (typeof student.userId === 'string' && student.userId)
        )
      ) {
        console.error('Student missing userId:', student);
        setError(`Cannot add student ${student.rollNo || 'unknown'}: Missing or invalid user information`);
        return;
      }
      
      if (!selectedStudents.some(s => s._id === studentId)) {
        setSelectedStudents([...selectedStudents, student]);
      }
    }
  };

  // Remove student from selected list
  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0 || !subject || !content) {
      setError('Please select at least one student and fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if students have proper userId objects
      const validStudents = selectedStudents.filter(student => 
        student && 
        ((typeof student.userId === 'object' && student.userId && student.userId._id) || 
         (typeof student.userId === 'string' && student.userId))
      );
      
      if (validStudents.length === 0) {
        throw new Error('No valid student recipients found. Students might be missing User IDs.');
      }
      
      if (validStudents.length < selectedStudents.length) {
        console.warn(`${selectedStudents.length - validStudents.length} students were skipped due to missing user IDs`);
      }
      
      // Send message to each selected student
      const sendPromises = validStudents.map(async (student) => {
        try {
          // Determine the correct recipientId based on userId format
          let recipientId;
          
          if (typeof student.userId === 'object' && student.userId && student.userId._id) {
            recipientId = student.userId._id;
          } else if (typeof student.userId === 'string') {
            recipientId = student.userId;
          } else {
            console.error('Invalid userId format for student:', student);
            throw new Error(`Invalid userId format for student ${student._id}`);
          }
          
          console.log('Sending message to student:', {
            studentId: student._id,
            studentName: student.name || 'Unknown',
            recipientId: recipientId,
            recipientModel: 'Student'
          });
          
          // Send the message with the determined recipientId
          return messageApi.sendMessage({
            recipientId,
            recipientModel: 'Student',
            subject,
            content
          });
        } catch (sendErr) {
          console.error(`Error sending to student ${student._id}:`, sendErr);
          return { error: sendErr, studentId: student._id };
        }
      });
      
      const results = await Promise.all(sendPromises);
      
      // Check if any messages failed to send
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Some messages failed to send:', errors);
        setError(`${errors.length} out of ${results.length} messages failed to send.`);
      } else {
        // Reset form only on complete success
        setSelectedStudents([]);
        setSubject('');
        setContent('');
        
        // Fetch updated messages
        const response = await messageApi.getMessages();
        setMessages(response.data.messages);
        
        setActiveTab('inbox');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        setError('Failed to send message: ' + (err.response.data.message || err.response.statusText));
      } else {
        setError('Failed to send message: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
    const teacherId = user && (user.id || user._id);
    
    // Enhanced debugging for message filtering
    console.log('Filtering teacher message:', {
      messageId: message._id,
      subject: message.subject,
      sender: message.sender,
      recipient: message.recipient,
      senderModel: message.senderModel,
      recipientModel: message.recipientModel,
      currentTab: activeTab,
      currentUserId: teacherId
    });
    
    // Handle both populated objects and raw IDs
    const getRefId = (ref) => {
      if (!ref) return null;
      if (typeof ref === 'object') {
        return ref.userId || ref._id || ref.id;
      }
      return ref;
    };
    
    // Get the actual teacher User ID from the teacher object or directly
    const currentUserIdStr = String(teacherId);
    
    // Convert IDs to strings for comparison to avoid type mismatches
    const recipientId = getRefId(message.recipient);
    const recipientIdStr = recipientId ? String(recipientId) : '';
    
    const senderId = getRefId(message.sender);
    const senderIdStr = senderId ? String(senderId) : '';
    
    // Enhanced comparison logic with complete checking
    if (activeTab === 'inbox') {
      // For inbox, we need to check:
      // 1. If this message is intended for a teacher (recipientModel)
      // 2. If the recipient ID matches this teacher's ID
      
      // First, check if the message is sent to a teacher
      const isTeacherRecipient = message.recipientModel === 'Teacher';
      
      // Then, check if the recipient ID matches this teacher's ID
      // We must check all possible ways the ID could be stored
      const matchesDirectId = recipientIdStr === currentUserIdStr;
      
      // Also check if recipient is an object with userId that matches
      const hasMatchingUserId = message.recipient && 
                               message.recipient.userId && 
                               String(message.recipient.userId) === currentUserIdStr;
      
      // Check if raw recipient matches (stored as plain ID)
      const rawRecipientMatches = message.recipient && 
                                 String(message.recipient) === currentUserIdStr;
      
      const shouldShowInInbox = isTeacherRecipient && 
                               (matchesDirectId || hasMatchingUserId || rawRecipientMatches);
      
      return shouldShowInInbox;
    } else if (activeTab === 'sent') {
      // For sent, we need to check:
      // 1. If this message was sent by a teacher (senderModel)
      // 2. If the sender ID matches this teacher's ID
      
      // First, check if the message was sent by a teacher
      const isTeacherSender = message.senderModel === 'Teacher';
      
      // Then, check if the sender ID matches this teacher's ID
      // We must check all possible ways the ID could be stored
      const matchesDirectId = senderIdStr === currentUserIdStr;
      
      // Also check if sender is an object with userId that matches
      const hasMatchingUserId = message.sender && 
                               message.sender.userId && 
                               String(message.sender.userId) === currentUserIdStr;
      
      // Check if raw sender matches (stored as plain ID)
      const rawSenderMatches = message.sender && 
                              String(message.sender) === currentUserIdStr;
      
      const shouldShowInSent = isTeacherSender && 
                              (matchesDirectId || hasMatchingUserId || rawSenderMatches);
      
      return shouldShowInSent;
    }
    return true;
  });

  if (loading && messages.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton customClass="mb-4" />
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaEnvelope className="mr-3" /> Teacher Messaging Portal
            </h1>
            <p className="text-blue-100 mt-2">Communicate with your students efficiently</p>
          </div>
          <button 
            onClick={fetchData} 
            className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition-all flex items-center"
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
          {error.includes('Failed to send message') && (
            <div className="mt-2 text-sm bg-white p-3 rounded border border-red-200">
              <p className="font-semibold">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Check if the selected students have proper user accounts linked</li>
                <li>Try refreshing the page to reload student data</li>
                <li>Try sending to one student at a time to identify problematic recipients</li>
                <li>Check the browser console for more detailed error information</li>
                <li>If the problem persists, contact the system administrator</li>
              </ul>
              <div className="flex justify-between mt-3">
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  onClick={() => {
                    // Refresh student data
                    setLoading(true);
                    api.get('/teacher/students')
                      .then(res => {
                        setStudents(res.data.students);
                        setSelectedStudents([]);
                        setLoading(false);
                        setError(null);
                      })
                      .catch(err => {
                        console.error('Error refreshing students:', err);
                        setLoading(false);
                      });
                  }}
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Student Data
                </button>
                <button 
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1 shadow-md">
        <button
          className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
            activeTab === 'inbox'
              ? 'bg-white text-blue-600 shadow-md font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('inbox')}
        >
          <FaInbox className="mr-2" /> Inbox
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
            activeTab === 'sent'
              ? 'bg-white text-blue-600 shadow-md font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <FaPaperPlane className="mr-2" /> Sent
        </button>
        <button
          className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
            activeTab === 'compose'
              ? 'bg-white text-blue-600 shadow-md font-semibold'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('compose')}
        >
          <FaPencilAlt className="mr-2" /> Compose
        </button>
      </div>
      
      {activeTab === 'compose' ? (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">New Message</h2>
          <form onSubmit={handleSendMessage}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Recipients:
              </label>
              
              {/* Toggle between single and multiple selection modes */}
              <div className="flex justify-end mb-2">
                <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      selectMode === 'single' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectMode('single')}
                  >
                    <FaUserPlus className="mr-1" /> Single Student
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
                      selectMode === 'multiple' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectMode('multiple')}
                  >
                    <FaUsers className="mr-1" /> Multiple Students
                  </button>
                </div>
              </div>
              
              {/* Selected students display */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedStudents.map(student => {
                    // Get the student name based on userId format
                    const studentName = typeof student.userId === 'object' ? 
                      (student.userId.name || 'Unknown') : 
                      `Student ${student.rollNo || ''}`;
                      
                    return (
                      <div 
                        key={student._id}
                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {studentName} {student.className ? `(${student.className})` : ''}
                        <button 
                          type="button"
                          onClick={() => handleRemoveStudent(student._id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Student selector */}
              {selectMode === 'single' ? (
                <div className="flex">
                  <select
                    className="shadow-sm border border-gray-300 rounded-l-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    onChange={(e) => e.target.value && handleAddStudent(e.target.value)}
                    value=""
                  >
                    <option value="">Select a student...</option>
                    {students
                      .filter(student => student && (
                        (typeof student.userId === 'object' && student.userId && student.userId._id) || 
                        (typeof student.userId === 'string' && student.userId)
                      ))
                      .filter(student => !selectedStudents.some(s => s._id === student._id))
                      .map((student) => {
                        // Get the student name based on userId format
                        const studentName = typeof student.userId === 'object' ? 
                          (student.userId.name || 'Unknown') : 
                          `Student ${student.rollNo || ''}`;
                          
                        return (
                          <option key={student._id} value={student._id}>
                            {studentName} {student.className ? `(${student.className})` : ''}
                          </option>
                        );
                      })
                    }
                  </select>
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg flex items-center justify-center"
                    onClick={() => {
                      const select = document.querySelector('select');
                      if (select.value) handleAddStudent(select.value);
                    }}
                  >
                    <FaUserPlus />
                  </button>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {students
                      .filter(student => student && (
                        (typeof student.userId === 'object' && student.userId && student.userId._id) || 
                        (typeof student.userId === 'string' && student.userId)
                      ))
                      .filter(student => !selectedStudents.some(s => s._id === student._id))
                      .map(student => {
                        // Get the student name based on userId format
                        const studentName = typeof student.userId === 'object' ? 
                          (student.userId.name || 'Unknown') : 
                          `Student ${student.rollNo || ''}`;
                          
                        return (
                          <div key={student._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`student-${student._id}`}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleAddStudent(student._id);
                                } else {
                                  handleRemoveStudent(student._id);
                                }
                              }}
                            />
                            <label htmlFor={`student-${student._id}`} className="text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                              {studentName} {student.className ? `(${student.className})` : ''}
                            </label>
                          </div>
                        );
                      })
                    }
                    {students.filter(student => 
                      student && (
                        (typeof student.userId === 'object' && student.userId && student.userId._id) || 
                        (typeof student.userId === 'string' && student.userId)
                      ) && 
                      !selectedStudents.some(s => s._id === student._id)
                    ).length === 0 && (
                      <p className="text-gray-500 text-sm p-2">No more students available</p>
                    )}
                  </div>
                  {students.filter(student => 
                    student && (
                      (typeof student.userId === 'object' && student.userId && student.userId._id) || 
                      (typeof student.userId === 'string' && student.userId)
                    ) && 
                    !selectedStudents.some(s => s._id === student._id)
                  ).length > 0 && (
                    <button
                      type="button"
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md flex items-center"
                      onClick={() => {
                        // Add all remaining students with valid userId
                        const remainingStudents = students.filter(
                          student => student && (
                            (typeof student.userId === 'object' && student.userId && student.userId._id) || 
                            (typeof student.userId === 'string' && student.userId)
                          ) &&
                          !selectedStudents.some(s => s._id === student._id)
                        );
                        setSelectedStudents([...selectedStudents, ...remainingStudents]);
                      }}
                    >
                      <FaUsers className="mr-2" /> Select All
                    </button>
                  )}
                </div>
              )}
              
              {selectedStudents.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please select at least one student
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Subject:
              </label>
              <input
                type="text"
                className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Message:
              </label>
              <textarea
                className="shadow-sm border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 h-40"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transition duration-200 flex items-center"
                disabled={loading || selectedStudents.length === 0}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" /> 
                    Send Message {selectedStudents.length > 0 && `to ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}`}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-10">
              <FaEnvelope className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500 text-lg">No messages found</p>
              <button 
                onClick={() => setActiveTab('compose')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md inline-flex items-center transition duration-200"
              >
                <FaPencilAlt className="mr-2" /> Compose new message
              </button>
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
                          ? 'font-medium bg-blue-50'
                          : ''
                      }`}
                    >
                      <td 
                        className="py-3 px-4 border-b"
                        onClick={() => navigate(`/teacher/message/${message._id}`)}
                      >
                        <div className="flex items-center cursor-pointer">
                          {activeTab === 'inbox' && !message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          )}
                          {activeTab === 'inbox'
                            ? (message.sender?.name || 'Unknown')
                            : (message.recipient?.name || 'Unknown')}
                        </div>
                      </td>
                      <td 
                        className="py-3 px-4 border-b cursor-pointer"
                        onClick={() => navigate(`/teacher/message/${message._id}`)}
                      >
                        {message.subject}
                      </td>
                      <td 
                        className="py-3 px-4 border-b cursor-pointer"
                        onClick={() => navigate(`/teacher/message/${message._id}`)}
                      >
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/teacher/message/${message._id}`)}
                            className="text-blue-600 hover:text-blue-800 transition duration-150 flex items-center"
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
      )}
    </div>
  );
};

export default TeacherMessaging;