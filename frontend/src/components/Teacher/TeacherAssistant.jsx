import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaLightbulb, FaChalkboardTeacher, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const TeacherAssistant = ({ teacherData, isFloating = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Help me create a lesson plan',
    'Suggest activities for teaching',
    'How to engage struggling students?',
    'Assessment ideas for my class'
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate tailored suggestions based on teacher's subject and classes
  useEffect(() => {
    if (teacherData && teacherData.subject) {
      const subject = teacherData.subject;
      const subjectSpecificSuggestions = [
        `Lesson plan ideas for ${subject}`,
        `Interactive activities for ${subject}`,
        `Assessment methods for ${subject}`
      ];
      
      if (teacherData.lowAttendanceStudents && teacherData.lowAttendanceStudents.length > 0) {
        subjectSpecificSuggestions.push('How to improve student attendance?');
      }
      
      if (teacherData.lowMarksStudents && teacherData.lowMarksStudents.length > 0) {
        subjectSpecificSuggestions.push('Strategies for helping struggling students');
      }
      
      setSuggestions(subjectSpecificSuggestions.slice(0, 4));
    }
  }, [teacherData]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    const lowerMsg = inputMessage.trim().toLowerCase();
    if (lowerMsg === 'hi') {
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Hi there! I'm here to help with your studies. What subject would you like to focus on?" }]);
      setIsLoading(false);
      return;
    }
    if (lowerMsg === 'hello') {
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Hello! I'm your AI learning assistant. How can I help you today?" }]);
      setIsLoading(false);
      return;
    }
    try {
      // Send message to backend LLM API
      const response = await api.post('/teacher/assistant', {
        message: inputMessage,
        teacherContext: {
          subject: teacherData?.subject,
          classes: teacherData?.assignedClasses || []
        }
      });
      
      if (response.data.success) {
        setMessages(prevMessages => [
          ...prevMessages, 
          { role: 'assistant', content: response.data.reply }
        ]);
      } else {
        setError('Failed to get a response');
      }
    } catch (err) {
      console.error('Error in teacher assistant:', err);
      if (err.code === 'ECONNABORTED') {
        setError('The request timed out. Please try again in a moment.');
      } else if (err.isConnectionError) {
        setError('Cannot reach the server. Check your connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to communicate with the AI assistant');
      }
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    // Optional: Automatically send the suggestion
    // setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Render floating chat bubble if isFloating is true
  if (isFloating) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${isExpanded ? 'w-80 h-96' : 'w-16 h-16'}`}>
        {isExpanded ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col w-full h-full border border-blue-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white flex justify-between items-center">
              <div className="flex items-center">
                <FaRobot className="text-xl mr-2" />
                <h3 className="font-bold">Teacher Assistant</h3>
              </div>
              <button 
                onClick={toggleExpand}
                className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-3 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
                >
                  <div className={`p-2 rounded-lg text-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center text-gray-500 mb-3">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>AI is thinking...</span>
                </div>
              )}
              {error && (
                <div className="bg-red-100 text-red-800 p-2 rounded mb-3 text-xs">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggestions */}
            <div className="px-2 py-1 bg-gray-100 flex flex-wrap gap-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-white border border-gray-300 rounded-full px-2 py-1 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors truncate max-w-[120px]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-2 border-t border-gray-200">
              <div className="flex items-center">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputMessage.trim() === ''}
                  className={`ml-2 p-2 rounded-full ${
                    isLoading || inputMessage.trim() === ''
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={toggleExpand}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 animate-pulse"
          >
            <FaChalkboardTeacher className="text-2xl" />
          </button>
        )}
      </div>
    );
  }

  // Regular embedded component rendering
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center">
          <FaChalkboardTeacher className="text-2xl mr-3" />
          <h3 className="text-lg font-bold">Teacher Assistant</h3>
        </div>
        <div className="flex space-x-2">
          <button className="text-white hover:bg-white/20 p-1 rounded transition-colors">
            <FaLightbulb className="text-yellow-300" />
          </button>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="h-64 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
          >
            <div className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center text-gray-500 mb-3">
            <FaSpinner className="animate-spin mr-2" />
            <span>AI is thinking...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-3">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      <div className="px-4 py-2 bg-gray-100 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
            className={`ml-2 p-2 rounded-full ${
              isLoading || inputMessage.trim() === ''
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssistant;