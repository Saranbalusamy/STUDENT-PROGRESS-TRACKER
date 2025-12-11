/**
 * Utility functions for AI-based teacher assistance
 */
const { getOpenAIResponse } = require('./openaiService');

// Teaching strategies organized by subject
const subjectTeachingStrategies = {
  Mathematics: {
    lessonPlans: [
      'Start with concrete examples before moving to abstract concepts',
      'Use visual aids and manipulatives for geometric concepts',
      'Incorporate real-world problem-solving scenarios',
      'Practice progressive skill building with increasing complexity',
      'Include collaborative group work for problem-solving'
    ],
    activities: [
      'Math relay races for practicing mental calculations',
      'Geometry scavenger hunts to identify shapes in the environment',
      'Math journaling for students to explain their thought processes',
      'Math games that reinforce concepts while making learning fun',
      'Data collection and analysis projects using real-world information'
    ],
    assessments: [
      'Skill-based quizzes focusing on specific competencies',
      'Project-based assessments that apply multiple concepts',
      'Problem-solving tasks with multiple solution pathways',
      'Peer assessment for collaborative problem-solving',
      'Portfolio assessment tracking progress over time'
    ]
  },
  Science: {
    lessonPlans: [
      'Begin with engaging demonstrations to spark curiosity',
      'Use the 5E model: Engage, Explore, Explain, Elaborate, Evaluate',
      'Incorporate scientific inquiry and experimental design',
      'Connect scientific concepts to students\' daily lives',
      'Include outdoor learning opportunities when possible'
    ],
    activities: [
      'Laboratory experiments with clear protocols and safety guidelines',
      'Design challenges that apply scientific principles',
      'Citizen science projects engaging with real research',
      'Science debates on contemporary issues',
      'Virtual simulations for concepts difficult to observe'
    ],
    assessments: [
      'Lab reports demonstrating experimental skills and analysis',
      'Concept mapping to show understanding of relationships',
      'Scientific argument construction and evidence evaluation',
      'Performance-based assessments of laboratory skills',
      'Research projects with presentation components'
    ]
  },
  English: {
    lessonPlans: [
      'Start with activating prior knowledge about the text or topic',
      'Use scaffolded reading strategies for comprehension',
      'Incorporate diverse texts representing various perspectives',
      'Balance reading, writing, speaking, and listening activities',
      'Include opportunities for creative expression'
    ],
    activities: [
      'Literature circles with assigned roles for discussion',
      'Writer\'s workshop with peer feedback opportunities',
      'Debate and discussion formats for analyzing texts',
      'Multimedia presentation creation to demonstrate understanding',
      'Creative writing inspired by studied texts'
    ],
    assessments: [
      'Analytical essays demonstrating critical thinking',
      'Reading response journals showing engagement with texts',
      'Performance assessments for speaking and presentation skills',
      'Portfolio assessment of writing development over time',
      'Project-based assessments integrating multiple literacy skills'
    ]
  },
  History: {
    lessonPlans: [
      'Use primary sources to engage with historical perspectives',
      'Connect historical events to contemporary issues',
      'Incorporate multiple perspectives and viewpoints',
      'Use timelines and visual aids to establish chronology',
      'Include role-play and simulation activities'
    ],
    activities: [
      'Document analysis workshops using primary sources',
      'Historical simulations and reenactments',
      'Oral history projects interviewing community members',
      'Creating historical documentaries or podcasts',
      'Museum exhibits designed and created by students'
    ],
    assessments: [
      'Document-based questions analyzing historical sources',
      'Research projects on specific historical events or figures',
      'Debate formats addressing historical controversies',
      'Creation of historical narratives incorporating evidence',
      'Comparative analysis of historical periods or movements'
    ]
  }
};

// Strategies for classroom management and student engagement
const classroomManagementStrategies = [
  'Establish clear routines and expectations from the first day',
  'Use positive reinforcement to encourage desired behaviors',
  'Implement a consistent and fair consequence system',
  'Create an inclusive classroom environment respecting diversity',
  'Design engaging, student-centered learning activities',
  'Use proximity and movement around the classroom during instruction',
  'Incorporate student choice and voice in learning activities',
  'Practice active listening when students are speaking',
  'Address behavioral issues privately rather than publicly',
  'Maintain a calm, professional demeanor even during challenges'
];

// Strategies for helping struggling students
const supportStrategies = {
  academicInterventions: [
    'Provide additional scaffolding for complex tasks',
    'Use small group instruction for targeted skill development',
    'Implement peer tutoring or study buddy systems',
    'Create graphic organizers to structure thinking',
    'Break assignments into smaller, manageable chunks',
    'Offer alternative ways to demonstrate learning',
    'Provide additional practice opportunities with immediate feedback',
    'Use multisensory teaching approaches',
    'Schedule regular check-ins to monitor progress',
    'Adjust instruction based on formative assessment data'
  ],
  attendanceImprovement: [
    'Establish personal connections with chronically absent students',
    'Communicate directly with parents/guardians about the importance of attendance',
    'Recognize and celebrate improved attendance',
    'Create engaging beginning-of-class activities that students won\'t want to miss',
    'Identify and address barriers to attendance (transportation, health, etc.)',
    'Implement an attendance contract with specific goals and incentives',
    'Make absent students feel welcome when they return',
    'Provide ways for absent students to catch up on missed work',
    'Collaborate with school counselors and administrators on attendance issues',
    'Track patterns in absences to identify potential underlying causes'
  ]
};

// Assessment strategies
const assessmentStrategies = {
  formative: [
    'Exit tickets to quickly check understanding',
    'Think-pair-share activities for verbal processing',
    'Quick polls or digital response systems',
    'Strategic questioning during discussions',
    'Student self-assessments using rubrics',
    'One-minute papers summarizing key concepts',
    'Graphic organizers to visualize understanding',
    'Observation checklists during group work',
    'Peer feedback using structured protocols',
    'Digital tools for real-time feedback'
  ],
  summative: [
    'Traditional tests with varied question types',
    'Performance tasks demonstrating application',
    'Portfolio assessment showing growth over time',
    'Project-based assessments for deeper learning',
    'Presentations demonstrating communication skills',
    'Essays analyzing complex concepts',
    'Lab reports showing scientific process skills',
    'Debates demonstrating critical thinking',
    'Multimedia projects integrating multiple skills',
    'Simulations mirroring real-world applications'
  ]
};

// Differentiation strategies
const differentiationStrategies = [
  'Use tiered assignments based on readiness levels',
  'Provide content at various reading levels',
  'Allow multiple ways to demonstrate learning',
  'Create flexible grouping based on needs and abilities',
  'Offer choice boards or menus of learning activities',
  'Adjust pacing for different learner needs',
  'Use technology to provide individualized practice',
  'Incorporate student interests into learning activities',
  'Provide varying levels of support and scaffolding',
  'Design open-ended tasks with multiple entry points'
];

// Lesson planning templates
const lessonPlanTemplates = {
  basic: {
    structure: [
      'Objective: What students will learn (using measurable terms)',
      'Standards: Curriculum standards addressed',
      'Materials: Resources needed for the lesson',
      'Hook/Introduction: Engaging activity to begin class',
      'Direct Instruction: Teacher-led explanation of concepts',
      'Guided Practice: Supported student practice with feedback',
      'Independent Practice: Students apply learning independently',
      'Assessment: How learning will be measured',
      'Closure: Summary and connection to future learning',
      'Extensions: Activities for students who finish early'
    ]
  },
  inquiryBased: {
    structure: [
      'Driving Question: Open-ended question guiding inquiry',
      'Prior Knowledge: Connections to existing understanding',
      'Investigation: Student-led exploration of the question',
      'Concept Development: Building understanding from exploration',
      'Application: Using new knowledge in meaningful contexts',
      'Reflection: Students evaluate their learning process',
      'Assessment: Evidence of conceptual understanding'
    ]
  }
};

/**
 * Generate a response to a teacher's query
 * @param {string} query - The teacher's message
 * @param {object} teacherContext - Teacher's context (subject, classes taught, etc.)
 * @returns {Promise<string>} - AI-generated response
 */
const generateTeacherResponse = async (query, teacherContext) => {
  try {
    // First, try to get a response from OpenAI
    return await getOpenAIResponse(query, teacherContext, 'teacher');
  } catch (error) {
    console.error('Error with OpenAI, falling back to local response:', error);
    
    // Fallback to local response logic if OpenAI fails
  const queryLower = query.toLowerCase();
  let response = '';
  
  // Check for lesson planning requests
  if (queryLower.includes('lesson plan') || queryLower.includes('planning') || queryLower.includes('plan a lesson')) {
    const subject = teacherContext?.subject || identifySubjectFromQuery(queryLower);
    
    response = `Here are some lesson planning strategies for ${subject || 'your subject'}:\n\n`;
    
    // Add lesson plan template
    response += `Lesson Plan Structure:\n`;
    lessonPlanTemplates.basic.structure.forEach((item, index) => {
      response += `${index + 1}. ${item}\n`;
    });
    
    response += `\nEffective Teaching Strategies for ${subject || 'this subject'}:\n`;
    const strategies = subjectTeachingStrategies[subject] ? 
      subjectTeachingStrategies[subject].lessonPlans : 
      subjectTeachingStrategies.Mathematics.lessonPlans;
    
    strategies.slice(0, 5).forEach((strategy, index) => {
      response += `• ${strategy}\n`;
    });
    
    return response;
  }
  
  // Check for activity suggestions
  if (queryLower.includes('activities') || queryLower.includes('teaching activities') || queryLower.includes('classroom activities')) {
    const subject = teacherContext?.subject || identifySubjectFromQuery(queryLower);
    
    response = `Here are some engaging activities for teaching ${subject || 'your subject'}:\n\n`;
    const activities = subjectTeachingStrategies[subject] ? 
      subjectTeachingStrategies[subject].activities : 
      subjectTeachingStrategies.Mathematics.activities;
    
    activities.forEach((activity, index) => {
      response += `${index + 1}. ${activity}\n`;
    });
    
    return response;
  }
  
  // Check for assessment ideas
  if (queryLower.includes('assessment') || queryLower.includes('evaluate') || queryLower.includes('testing')) {
    response = `Here are assessment strategies you might find useful:\n\n`;
    
    response += `Formative Assessment Ideas (ongoing):\n`;
    assessmentStrategies.formative.slice(0, 5).forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    response += `\nSummative Assessment Ideas (end of unit):\n`;
    assessmentStrategies.summative.slice(0, 5).forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    return response;
  }
  
  // Check for classroom management help
  if (queryLower.includes('classroom management') || queryLower.includes('behavior') || queryLower.includes('discipline')) {
    response = `Here are effective classroom management strategies:\n\n`;
    
    classroomManagementStrategies.slice(0, 7).forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    return response;
  }
  
  // Check for help with struggling students
  if (queryLower.includes('struggling') || queryLower.includes('low performance') || queryLower.includes('falling behind')) {
    response = `Strategies to support struggling students:\n\n`;
    
    supportStrategies.academicInterventions.slice(0, 7).forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    return response;
  }
  
  // Check for attendance improvement strategies
  if (queryLower.includes('attendance') || queryLower.includes('absent') || queryLower.includes('missing class')) {
    response = `Strategies to improve student attendance:\n\n`;
    
    supportStrategies.attendanceImprovement.slice(0, 7).forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    return response;
  }
  
  // Check for differentiation strategies
  if (queryLower.includes('differentiation') || queryLower.includes('different levels') || queryLower.includes('diverse learners')) {
    response = `Here are effective differentiation strategies for diverse learners:\n\n`;
    
    differentiationStrategies.forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n`;
    });
    
    return response;
  }
  
  // Fallback response
  return `As your teaching assistant, I can help with lesson planning, classroom management, assessment strategies, and supporting diverse learners. Some things you might ask about:\n\n` +
    `• Lesson planning ideas for specific subjects\n` +
    `• Engaging classroom activities\n` +
    `• Assessment strategies (formative and summative)\n` +
    `• Classroom management techniques\n` +
    `• Supporting struggling students\n` +
    `• Improving student attendance\n` +
    `• Differentiation strategies\n\n` +
    `What would you like assistance with today?`;
};

// Helper function to identify subject from query
const identifySubjectFromQuery = (query) => {
  const subjects = Object.keys(subjectTeachingStrategies);
  
  for (const subject of subjects) {
    if (query.includes(subject.toLowerCase())) {
      return subject;
    }
  }
  
  // Check for common subject words
  if (query.includes('math')) return 'Mathematics';
  if (query.includes('science')) return 'Science';
  if (query.includes('english') || query.includes('language arts') || query.includes('literature')) return 'English';
  if (query.includes('history') || query.includes('social studies')) return 'History';
  
  return null;
};

// End of the fallback function
};

module.exports = { generateTeacherResponse };