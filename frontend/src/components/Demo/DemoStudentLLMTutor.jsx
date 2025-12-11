import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaPaperPlane, FaSpinner, FaLightbulb, FaUserGraduate, FaChevronDown } from 'react-icons/fa';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LoadingSpinner from '../Common/LoadingSpinner';

// Demo responses
const demoResponses = {
  'hello': 'Hello! I\'m your AI learning assistant. How can I help you today?',
  'hi': 'Hi there! I\'m here to help with your studies. What subject would you like to focus on?',
  'how are you': 'I\'m functioning well, thank you! I\'m designed to help you with your academic needs. How can I assist you today?',
  'help': 'I can help you with study techniques, explain concepts, provide practice problems, or analyze your performance data. What do you need assistance with?',
  'math': 'Mathematics is a fascinating subject! I can help with algebra, geometry, calculus, or statistics. What specific topic do you need help with?',
  'science': 'Science covers a wide range of topics from biology to physics. Which area are you studying, and what can I help you understand better?',
  'english': 'English language and literature involve reading comprehension, writing skills, grammar, and literary analysis. What aspect would you like to improve?',
  'history': 'History helps us understand our past and present. I can help with historical events, figures, or concepts. What period or topic are you studying?',
  'computer science': 'Computer Science is a dynamic field! I can help with programming concepts, algorithms, data structures, or theory. What are you working on?',
  'study tips': 'Here are some effective study strategies:\n1. Create a dedicated study space\n2. Break study sessions into 25-minute chunks with 5-minute breaks\n3. Use active recall rather than passive reading\n4. Teach concepts to others to solidify understanding\n5. Use spaced repetition for memorization\n6. Get enough sleep for memory consolidation',
  'improve math': 'To improve your math skills:\n1. Practice regularly with diverse problems\n2. Focus on understanding concepts, not just memorizing formulas\n3. Work through example problems step-by-step\n4. Use online resources like Khan Academy for tutorials\n5. Form a study group to discuss problems\n6. Identify and address specific areas of weakness',
  'improve science': 'To improve in science:\n1. Connect concepts to real-world applications\n2. Draw diagrams to visualize processes\n3. Create flashcards for terminology\n4. Watch video demonstrations of experiments\n5. Relate new information to concepts you already understand\n6. Regularly review foundational principles',
  'test preparation': 'For effective test preparation:\n1. Start studying at least a week before the test\n2. Create a study schedule with specific goals\n3. Practice with past tests or sample questions\n4. Focus extra time on challenging topics\n5. Teach the material to someone else\n6. Get a good night\'s sleep before the test\n7. Review key concepts briefly on test day',
  'homework help': 'I\'d be happy to help with your homework! Please share the specific problem or concept you\'re working on, and I\'ll guide you through it without simply giving the answers.',
  'default': 'That\'s an interesting question. In a fully implemented system, I would provide a detailed response based on educational resources and your specific learning needs. For this demo, I can offer general guidance on study techniques, subject-specific tips, or help with understanding concepts.'
};

// Demo performance data
const demoPerformanceData = {
  subjects: ['Mathematics', 'Science', 'English', 'History', 'Computer Science'],
  subjectWiseMarks: {
    'Mathematics': 92,
    'Science': 88,
    'English': 85,
    'History': 78,
    'Computer Science': 95,
  }
};

// (removed unused demoStudentData)

const DemoStudentLLMTutor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI learning assistant. I can help you improve your academic skills, answer questions about your subjects, or provide study tips. What would you like help with today?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'How can I improve my Math skills?',
    'Give me study tips for Science',
    'Help me prepare for my next test',
    'Explain a difficult concept in simple terms'
  ]);
  const [isFloating, setIsFloating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if this is a valid demo session
    const demoSession = JSON.parse(sessionStorage.getItem('demoSession') || '{}');
    if (!demoSession.isDemo || demoSession.demoRole !== 'student') {
      navigate('/demo');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate suggestions based on student performance
  useEffect(() => {
    const weakSubjects = Object.entries(demoPerformanceData.subjectWiseMarks)
      .filter(([_, marks]) => marks < 85)
      .map(([subject]) => subject);
    
    if (weakSubjects.length > 0) {
      const newSuggestions = weakSubjects.map(subject => 
        `How can I improve in ${subject}?`
      );
      setSuggestions(prevSuggestions => {
        const combined = [...newSuggestions, ...prevSuggestions];
        return combined.slice(0, 4); // Keep a maximum of 4 suggestions
      });
    }
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Simulate API call with demo responses
      await new Promise(resolve => setTimeout(resolve, 1500)); // Artificial delay
      
      // Get demo response based on keywords in user message
      let botResponse = demoResponses.default;
      const lowercaseMessage = inputMessage.toLowerCase();
      
      // Check for keywords in the input message
      for (const [keyword, response] of Object.entries(demoResponses)) {
        if (lowercaseMessage.includes(keyword.toLowerCase())) {
          botResponse = response;
          break;
        }
      }
      
      const assistantMessage = { role: 'assistant', content: botResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response. This is a demo version with limited functionality.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
            <LoadingSpinner text="Loading LLM Tutor..." />
          </main>
        </div>
      </div>
    );
  }

  if (isFloating) {
    return (
      <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 ${isExpanded ? 'w-96 h-96' : 'w-16 h-16'}`}>
        {isExpanded ? (
          <>
            <div className="flex justify-between items-center p-3 border-b">
              <div className="flex items-center">
                <FaRobot className="text-purple-500 mr-2" />
                <h3 className="font-medium">AI Tutor (Demo)</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FaChevronDown className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-3 h-64 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-3 ${message.role === 'assistant' ? 'pl-2' : 'pl-6'}`}
                >
                  <div className="flex items-start">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <FaRobot className="text-purple-600" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <FaUserGraduate className="text-blue-600" />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg ${message.role === 'assistant' ? 'bg-purple-50' : 'bg-blue-50 ml-auto'}`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t">
              <div className="mb-2 flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 mb-1"
                  >
                    <FaLightbulb className="inline mr-1 text-yellow-500" size={10} />
                    {suggestion.length > 20 ? suggestion.substring(0, 20) + '...' : suggestion}
                  </button>
                ))}
              </div>
              <div className="flex">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI tutor a question..."
                  className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputMessage.trim() === ''}
                  className="bg-purple-600 text-white p-2 rounded-r-lg disabled:bg-purple-300"
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </div>
            </div>
            {error && <div className="text-red-500 text-xs p-2">{error}</div>}
          </>
        ) : (
          <button 
            onClick={() => setIsExpanded(true)} 
            className="w-full h-full flex items-center justify-center text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <FaRobot size={24} />
          </button>
        )}
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
          <h2 className="text-3xl font-bold mb-6">AI Learning Assistant (Demo)</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <FaRobot className="text-purple-500 mr-2 text-xl" />
              <h3 className="text-xl font-semibold">Personalized Learning Support</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Our AI tutor can help you with personalized learning guidance, answering questions,
              providing explanations, and suggesting study resources tailored to your needs.
            </p>
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> This is a demonstration with simulated responses. In the full version,
                the AI tutor uses your performance data to provide personalized assistance.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b px-6 py-4 bg-gray-50">
              <div className="flex items-center">
                <FaRobot className="text-purple-500 mr-2" />
                <h3 className="font-medium">Chat with AI Tutor</h3>
              </div>
            </div>
            
            <div className="p-6 h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-6 ${message.role === 'assistant' ? 'pr-12' : 'pl-12'}`}
                >
                  <div className="flex items-start">
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <FaRobot className="text-purple-600" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <FaUserGraduate className="text-blue-600" />
                      </div>
                    )}
                    <div className={`p-4 rounded-lg ${message.role === 'assistant' ? 'bg-purple-50' : 'bg-blue-50 ml-auto'}`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(suggestion);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1 text-sm text-gray-700"
                  >
                    <FaLightbulb className="inline mr-1 text-yellow-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="flex">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI tutor a question..."
                  className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputMessage.trim() === ''}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-r-lg disabled:bg-purple-300 flex items-center justify-center"
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </div>
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsFloating(true);
              setIsExpanded(true);
            }}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaRobot className="mr-2" />
            Open as Floating Window
          </button>
        </main>
      </div>
    </div>
  );
};

export default DemoStudentLLMTutor;