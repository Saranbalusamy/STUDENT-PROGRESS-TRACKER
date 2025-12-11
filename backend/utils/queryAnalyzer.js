/**
 * Helper utility for analyzing user queries
 */

// Subjects and related keywords
const subjectKeywords = {
  Mathematics: [
    'math', 'algebra', 'geometry', 'calculus', 'trigonometry', 
    'statistics', 'probability', 'equation', 'formula', 'theorem',
    'arithmetic', 'number', 'fraction', 'decimal', 'percentage',
    'linear', 'quadratic', 'function', 'graph', 'coordinate',
    'angle', 'shape', 'triangle', 'circle', 'square', 'polygon',
    'integral', 'derivative', 'limit', 'sequence', 'series'
  ],
  Science: [
    'science', 'biology', 'chemistry', 'physics', 'experiment',
    'lab', 'scientific', 'hypothesis', 'theory', 'molecule',
    'atom', 'element', 'compound', 'reaction', 'energy',
    'force', 'motion', 'gravity', 'cell', 'organism',
    'ecosystem', 'evolution', 'genetics', 'ecology', 'astronomy',
    'planet', 'star', 'solar', 'universe', 'space'
  ],
  English: [
    'english', 'literature', 'grammar', 'writing', 'essay',
    'poetry', 'novel', 'story', 'character', 'plot',
    'theme', 'metaphor', 'simile', 'symbolism', 'author',
    'reading', 'comprehension', 'paragraph', 'sentence', 'vocabulary',
    'verb', 'noun', 'adjective', 'adverb', 'punctuation',
    'speech', 'rhetoric', 'argument', 'analysis', 'interpretation'
  ],
  History: [
    'history', 'historical', 'civilization', 'ancient', 'medieval',
    'modern', 'renaissance', 'revolution', 'war', 'treaty',
    'empire', 'kingdom', 'democracy', 'government', 'politics',
    'culture', 'society', 'economy', 'religion', 'art',
    'artifact', 'document', 'source', 'evidence', 'timeline',
    'period', 'era', 'century', 'decade', 'year'
  ]
};

// Study skills and learning strategies keywords
const studyKeywords = [
  'study', 'learn', 'memorize', 'understand', 'comprehend',
  'focus', 'concentrate', 'remember', 'recall', 'review',
  'note', 'notebook', 'highlight', 'summarize', 'outline',
  'schedule', 'planner', 'organize', 'prepare', 'practice',
  'homework', 'assignment', 'project', 'research', 'essay',
  'exam', 'test', 'quiz', 'grade', 'score',
  'improve', 'better', 'strategy', 'technique', 'method',
  'time management', 'procrastination', 'motivation', 'stress', 'anxiety'
];

// Teacher-specific categories
const teacherCategories = {
  lessonPlanning: [
    'lesson plan', 'curriculum', 'teaching strategy', 'instructional design',
    'learning objective', 'lesson structure', 'learning activity', 'engagement',
    'teaching method', 'pedagogy', 'teaching approach', 'learning outcome',
    'student-centered', 'differentiation', 'scaffolding', 'formative assessment'
  ],
  classroomManagement: [
    'classroom management', 'behavior', 'discipline', 'rules', 'routine',
    'engagement', 'participation', 'disruptive', 'attention', 'focus',
    'motivation', 'classroom environment', 'seating arrangement', 'group dynamics',
    'conflict resolution', 'positive reinforcement', 'classroom culture'
  ],
  assessment: [
    'assessment', 'evaluation', 'test', 'quiz', 'exam', 
    'rubric', 'grading', 'feedback', 'performance measure', 'benchmark',
    'formative', 'summative', 'diagnostic', 'criterion', 'portfolio',
    'project-based', 'authentic assessment', 'peer assessment', 'self-assessment'
  ],
  studentSupport: [
    'struggling student', 'learning difficulty', 'special needs', 'accommodation',
    'intervention', 'remediation', 'gifted', 'advanced learner', 'differentiation',
    'individual education plan', 'IEP', 'learning style', 'support strategy',
    'inclusive education', 'learning disability', 'student diversity'
  ]
};

/**
 * Detects the subject matter in a query
 * @param {string} query - The user's query
 * @returns {Object} - Information about the detected subject and study skills
 */
const analyzeQuery = (query) => {
  const queryLower = query.toLowerCase();
  const result = {
    detectedSubject: null,
    isStudyQuestion: false,
    subjectConfidence: 0,
    studyConfidence: 0,
    keywords: [],
    // For teacher queries
    teacherCategory: null,
    teacherCategoryConfidence: 0
  };
  
  // Check for subject-specific keywords
  for (const subject in subjectKeywords) {
    let matchCount = 0;
    const matchedKeywords = [];
    
    for (const keyword of subjectKeywords[subject]) {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }
    
    const confidence = matchCount / subjectKeywords[subject].length;
    if (confidence > result.subjectConfidence) {
      result.detectedSubject = subject;
      result.subjectConfidence = confidence;
      result.keywords = matchedKeywords;
    }
  }
  
  // Check for study skills keywords
  let studyMatchCount = 0;
  for (const keyword of studyKeywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      studyMatchCount++;
      if (!result.keywords.includes(keyword)) {
        result.keywords.push(keyword);
      }
    }
  }
  
  result.studyConfidence = studyMatchCount / studyKeywords.length;
  result.isStudyQuestion = result.studyConfidence > 0.1; // 10% threshold
  
  // Check for teacher-specific categories
  for (const category in teacherCategories) {
    let matchCount = 0;
    const matchedKeywords = [];
    
    for (const keyword of teacherCategories[category]) {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
        if (!result.keywords.includes(keyword)) {
          result.keywords.push(keyword);
        }
      }
    }
    
    const confidence = matchCount / teacherCategories[category].length;
    if (confidence > result.teacherCategoryConfidence) {
      result.teacherCategory = category;
      result.teacherCategoryConfidence = confidence;
    }
  }
  
  return result;
};

module.exports = { analyzeQuery };