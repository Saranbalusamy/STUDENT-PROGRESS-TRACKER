/**
 * Utility functions for LLM-based student assistance
 */
const { getOpenAIResponse } = require('./openaiService');

// Sample learning topics and tips organized by subject
const subjectResources = {
  Math: {
    topics: [
      'Algebra fundamentals', 'Geometry principles', 'Calculus concepts',
      'Trigonometric functions', 'Statistics and probability'
    ],
    tips: [
      'Practice daily with different problem types',
      'Focus on understanding concepts rather than memorizing formulas',
      'Draw diagrams to visualize problems',
      'Work through examples step by step',
      'Use online resources like Khan Academy for video explanations'
    ],
    weakScore: {
      message: 'Your math performance could use some improvement. Focus on understanding the fundamental concepts and practice regularly.'
    },
    strongScore: {
      message: 'You\'re doing well in Math! Consider exploring more advanced topics to challenge yourself further.'
    }
  },
  Science: {
    topics: [
      'Scientific method', 'Biology basics', 'Chemistry fundamentals',
      'Physics concepts', 'Environmental science'
    ],
    tips: [
      'Connect theoretical concepts with real-world applications',
      'Create visual summaries of complex processes',
      'Participate in lab experiments whenever possible',
      'Use flashcards for terminology',
      'Watch educational science videos to reinforce learning'
    ],
    weakScore: {
      message: 'Your science scores show room for improvement. Focus on understanding the fundamental principles and their practical applications.'
    },
    strongScore: {
      message: 'Your science performance is strong! Consider joining science clubs or competitions to further develop your skills.'
    }
  },
  English: {
    topics: [
      'Grammar rules', 'Essay writing', 'Literary analysis',
      'Vocabulary building', 'Reading comprehension'
    ],
    tips: [
      'Read widely across different genres',
      'Keep a vocabulary journal for new words',
      'Practice writing regularly - journal entries, essays, etc.',
      'Analyze writing techniques in books and articles',
      'Join discussion groups to improve verbal communication'
    ],
    weakScore: {
      message: 'Your English language skills need attention. Focus on reading more and practicing writing regularly.'
    },
    strongScore: {
      message: 'You show strong English language abilities! Consider advanced reading and creative writing to further enhance your skills.'
    }
  },
  History: {
    topics: [
      'Timeline mastery', 'Historical figure analysis', 'Cause and effect relationships',
      'Primary source analysis', 'Historical movements'
    ],
    tips: [
      'Create timelines to visualize historical periods',
      'Connect historical events to understand cause and effect',
      'Study primary sources to gain deeper insights',
      'Make connections between different historical periods',
      'Use mnemonic devices for remembering key dates and figures'
    ],
    weakScore: {
      message: 'Your history performance could improve. Focus on understanding the relationships between events rather than memorizing dates.'
    },
    strongScore: {
      message: 'You have a strong grasp of history! Consider exploring specific historical periods in greater depth.'
    }
  }
};

// General study tips that apply to all subjects
const generalStudyTips = [
  'Create a consistent study schedule and stick to it',
  'Use active recall techniques rather than passive reading',
  'Take regular breaks using the Pomodoro technique (25 minutes study, 5 minutes break)',
  'Teach concepts to others to solidify your understanding',
  'Review notes within 24 hours of learning new material',
  'Get enough sleep - it\'s crucial for memory consolidation',
  'Stay hydrated and maintain a balanced diet for optimal brain function',
  'Use spaced repetition for memorizing important facts',
  'Create mind maps to visualize connections between concepts',
  'Set specific, achievable goals for each study session'
];

// Common learning strategies for different learning styles
const learningStrategies = {
  visual: [
    'Use color-coded notes and highlighters',
    'Create mind maps and diagrams',
    'Watch educational videos',
    'Use flashcards with images',
    'Convert text information into charts and graphs'
  ],
  auditory: [
    'Record and listen to your notes',
    'Participate in group discussions',
    'Explain concepts out loud to yourself',
    'Use rhymes or songs to remember information',
    'Listen to educational podcasts'
  ],
  kinesthetic: [
    'Take frequent breaks for movement',
    'Use physical objects to model concepts',
    'Act out processes or historical events',
    'Create hands-on projects related to the material',
    'Study while walking or using a standing desk'
  ],
  reading: [
    'Take detailed notes while reading',
    'Summarize information in your own words',
    'Use the SQ3R method (Survey, Question, Read, Recite, Review)',
    'Create outlines from textbook chapters',
    'Rewrite key definitions and concepts'
  ]
};

/**
 * Generate a response to a student's learning-related query
 * @param {string} query - The student's message
 * @param {object} studentContext - Student's academic context (performance data, etc.)
 * @returns {Promise<string>} - AI-generated response
 */
const generateLLMResponse = async (query, studentContext) => {
  try {
    // First, try to get a response from OpenAI
    return await getOpenAIResponse(query, studentContext, 'student');
  } catch (error) {
    console.error('Error with OpenAI, falling back to local response:', error);
    
    // Fallback to local response logic if OpenAI fails
  const queryLower = query.toLowerCase();
  let response = '';
  
  // Check for subject-specific improvement requests
  for (const subject in subjectResources) {
    if (queryLower.includes(`improve ${subject.toLowerCase()}`) || 
        queryLower.includes(`better at ${subject.toLowerCase()}`) ||
        queryLower.includes(`help with ${subject.toLowerCase()}`)) {
      
      // Get student's performance in this subject if available
      const subjectPerformance = studentContext?.performance?.subjectWiseMarks?.[subject] || null;
      
      // Tailor response based on performance if available
      if (subjectPerformance !== null) {
        if (subjectPerformance < 70) {
          response += `${subjectResources[subject].weakScore.message}\n\n`;
        } else {
          response += `${subjectResources[subject].strongScore.message}\n\n`;
        }
      }
      
      // Add subject-specific tips
      response += `Here are some tips to improve your ${subject} skills:\n\n`;
      subjectResources[subject].tips.forEach((tip, index) => {
        response += `${index + 1}. ${tip}\n`;
      });
      
      response += `\nKey ${subject} topics to focus on:\n`;
      const topics = subjectResources[subject].topics.slice(0, 3); // Limit to 3 topics
      topics.forEach((topic, index) => {
        response += `• ${topic}\n`;
      });
      
      return response;
    }
  }
  
  // Check for study tips request
  if (queryLower.includes('study tip') || 
      queryLower.includes('how to study') || 
      queryLower.includes('study better') ||
      queryLower.includes('study method')) {
    
    response = 'Here are some effective study strategies you can try:\n\n';
    // Pick 5 random tips from the general study tips
    const shuffledTips = [...generalStudyTips].sort(() => 0.5 - Math.random()).slice(0, 5);
    shuffledTips.forEach((tip, index) => {
      response += `${index + 1}. ${tip}\n`;
    });
    
    return response;
  }
  
  // Check for learning style preferences
  if (queryLower.includes('visual learner') || queryLower.includes('learn by seeing')) {
    response = 'As a visual learner, these strategies may help you:\n\n';
    learningStrategies.visual.forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    return response;
  }
  
  if (queryLower.includes('auditory learner') || queryLower.includes('learn by hearing')) {
    response = 'As an auditory learner, these strategies may help you:\n\n';
    learningStrategies.auditory.forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    return response;
  }
  
  if (queryLower.includes('kinesthetic learner') || queryLower.includes('learn by doing')) {
    response = 'As a kinesthetic learner, these strategies may help you:\n\n';
    learningStrategies.kinesthetic.forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    return response;
  }
  
  // Analyze overall performance if available
  if (queryLower.includes('my performance') || queryLower.includes('how am i doing')) {
    const performanceData = studentContext?.performance?.subjectWiseMarks;
    
    if (performanceData) {
      const subjects = Object.keys(performanceData);
      const averageScore = subjects.reduce((sum, subject) => sum + performanceData[subject], 0) / subjects.length;
      
      const strongSubjects = subjects.filter(subject => performanceData[subject] >= 80);
      const weakSubjects = subjects.filter(subject => performanceData[subject] < 70);
      
      response = `Based on your performance data:\n\n`;
      response += `Your average score is ${averageScore.toFixed(1)}%.\n\n`;
      
      if (strongSubjects.length > 0) {
        response += `Your strengths are in: ${strongSubjects.join(', ')}.\n`;
      }
      
      if (weakSubjects.length > 0) {
        response += `Subjects that need improvement: ${weakSubjects.join(', ')}.\n\n`;
        response += `I recommend focusing on these areas. Would you like specific tips for any of these subjects?\n`;
      }
      
      return response;
    }
  }
  
  // Test preparation
  if (queryLower.includes('prepare for test') || 
      queryLower.includes('prepare for exam') || 
      queryLower.includes('test preparation')) {
    
    response = `Here's an effective test preparation strategy:\n\n`;
    response += `1. Start early - begin studying at least a week before the test\n`;
    response += `2. Create a study schedule with specific goals for each session\n`;
    response += `3. Review your notes, textbooks, and assignments\n`;
    response += `4. Make summary sheets of key concepts\n`;
    response += `5. Practice with past papers or sample questions\n`;
    response += `6. Use active recall - test yourself rather than just rereading\n`;
    response += `7. Study in short, focused sessions with breaks in between\n`;
    response += `8. Get a good night's sleep before the test\n\n`;
    
    response += `Would you like specific tips for a particular subject test?\n`;
    
    return response;
  }
  
  // Fallback response for unrecognized queries
  return `I'm your AI learning assistant. I can help with study strategies, subject-specific tips, or performance improvement. Here are some things you can ask me about:\n\n` +
    `• How to improve in a specific subject\n` +
    `• General study tips and techniques\n` +
    `• Strategies for different learning styles\n` +
    `• Test preparation advice\n` +
    `• Analysis of your academic performance\n\n` +
    `What would you like help with today?`;
  }
};

module.exports = { generateLLMResponse };