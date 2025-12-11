/**
 * OpenAI API integration utility using Chat Completions
 */
const OpenAI = require('openai');
const { analyzeQuery } = require('./queryAnalyzer');

// Lazy-initialize OpenAI client when key is present
let openAIClient = null;
const OPENAI_ENABLED = process.env.OPENAI_ENABLED !== 'false';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_RETRIES = Number(process.env.OPENAI_RETRIES || 2);
const RETRY_BASE_MS = Number(process.env.OPENAI_RETRY_BASE_MS || 400);
const COOLDOWN_MS = Number(process.env.OPENAI_COOLDOWN_MS || 10 * 60 * 1000); // 10 minutes
const CACHE_TTL_MS = Number(process.env.OPENAI_CACHE_TTL_MS || 2 * 60 * 1000); // 2 minutes

const mask = (val = '') => (typeof val === 'string' && val.length > 8 ? `${val.slice(0, 4)}***${val.slice(-4)}` : '(unset)');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let openAICooldownUntil = 0;
const openAICache = new Map();

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (openAIClient) return openAIClient;
  openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  if (process.env.OPENAI_DEBUG === 'true') {
    console.log(`OpenAI client initialized. Model=${DEFAULT_MODEL} Key=${mask(process.env.OPENAI_API_KEY)}`);
  }
  return openAIClient;
};

/**
 * Get response from OpenAI Chat Completions
 * @param {string} query - User's query
 * @param {object} context - Additional context information (student/teacher data)
 * @param {string} role - User role (student/teacher)
 * @returns {Promise<string>} - AI-generated response
 */
const getOpenAIResponse = async (query, context, role) => {
  // Build a concise system prompt tailored by role
  const queryAnalysis = analyzeQuery(query);
  let systemPrompt = '';

  if (role === 'student') {
    systemPrompt = `You are an AI learning assistant for K-12 students. 
Answer clearly and concisely, explain step-by-step when helpful, and encourage understanding over giving final answers. 
Avoid repeating the same introduction each time. If asked to do homework, guide the student instead.`;
  } else if (role === 'teacher') {
    systemPrompt = `You are an AI assistant for teachers. 
Provide practical pedagogy, classroom management advice, assessment strategies, and lesson planning suggestions. 
Be concise, evidence-informed, and professional.`;
  } else {
    systemPrompt = 'You are a helpful educational assistant.';
  }

  const contextSnippet = (() => {
    try {
      if (!context) return '';
      const parts = [];
      if (context.subject) parts.push(`Subject: ${context.subject}`);
      if (context.classes) parts.push(`Classes: ${Array.isArray(context.classes) ? context.classes.join(', ') : context.classes}`);
      if (context.performance && context.performance.subjectWiseMarks) {
        const marks = context.performance.subjectWiseMarks;
        const top = Object.keys(marks)
          .slice(0, 4)
          .map(k => `${k}: ${marks[k]}%`)
          .join(', ');
        parts.push(`Performance: ${top}`);
      }
      return parts.length ? `Context: ${parts.join(' | ')}` : '';
    } catch {
      return '';
    }
  })();

  // Silently skip OpenAI if disabled or no API key
  if (!OPENAI_ENABLED || !process.env.OPENAI_API_KEY) {
    // Return fallback response immediately without error
    return getFallbackResponse(query, role);
  }

  const client = getClient();
  try {
    if (!client) throw new Error('Missing OPENAI_API_KEY');

    // Respect cooldown window after prior 429
    if (Date.now() < openAICooldownUntil) {
      const e = new Error('OpenAI in cooldown; skipping call');
      e.status = 429;
      throw e;
    }

    // Cache key based on model, role, query, and coarse context
    const cacheKey = `${DEFAULT_MODEL}|${role || 'user'}|${(query || '').trim().toLowerCase()}|${context?.subject || 'na'}`;
    const cached = openAICache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      if (process.env.OPENAI_DEBUG === 'true') console.log('OpenAI cache hit');
      return cached.text;
    }

    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Hard timeout using AbortController so we can fall back quickly
        const controller = new AbortController();
        const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 8000);
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const completion = await client.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: [contextSnippet, `Query: ${query}`].filter(Boolean).join('\n') }
          ],
          temperature: 0.7,
          max_tokens: 220,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const aiText = completion?.choices?.[0]?.message?.content?.trim();
        if (aiText && aiText.length > 0) {
          openAICache.set(cacheKey, { text: aiText, expires: Date.now() + CACHE_TTL_MS });
          return aiText;
        }
        throw new Error('Empty response from OpenAI');
      } catch (err) {
        if (err?.name === 'AbortError') {
          lastError = new Error('OpenAI request timed out');
        } else {
          lastError = err;
        }
        const status = err?.status || err?.response?.status;
        const isRateLimited = status === 429;
        const isRetryable = isRateLimited || status === 408 || status === 500 || status === 502 || status === 503 || status === 504;
        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_MS * Math.pow(2, attempt);
          if (process.env.OPENAI_DEBUG === 'true') {
            console.warn(`OpenAI call failed (status=${status}). Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          }
          await sleep(delay);
          continue;
        }
        if (isRateLimited) {
          openAICooldownUntil = Date.now() + COOLDOWN_MS;
          if (process.env.OPENAI_DEBUG === 'true') console.warn(`Entering OpenAI cooldown for ${COOLDOWN_MS}ms due to 429.`);
        }
        throw err;
      }
    }
    // If loop somehow exits without return/throw
    if (lastError) throw lastError;
    throw new Error('Unknown OpenAI error');
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const errMsg = typeof error?.message === 'string' ? error.message : 'Unknown error';
    
    // Only log actual API errors, not disabled state
    if (OPENAI_ENABLED && process.env.OPENAI_API_KEY) {
      const summary = status ? `${status}: ${errMsg}` : errMsg;
      console.error('OpenAI API Error:', summary);
      if (process.env.OPENAI_DEBUG === 'true' && error?.response?.data) {
        console.error('OpenAI error body:', error.response.data);
      }
    }

    // Return fallback response
    return getFallbackResponse(query, role, status);
  }
};

/**
 * Generate fallback response when OpenAI is unavailable
 */
const getFallbackResponse = (query, role, status = null) => {
    // Fallback responses based on role and query content
    const lowerQuery = (query || '').toLowerCase();
    const quotaNotice = status === 429 ? ' Note: The AI service hit a rate/quota limit; using a local helper response for now.' : '';

    if (role === 'student') {
      if (lowerQuery.includes('math') || lowerQuery.includes('mathematics') || lowerQuery.includes('calculate') || lowerQuery.includes('solve')) {
        return "For math problems, break them into steps: identify knowns, define what to find, choose a method, and check the result. Practice similar examples and ask about the step you find hardest." + quotaNotice;
      } else if (lowerQuery.includes('science') || lowerQuery.includes('physics') || lowerQuery.includes('chemistry') || lowerQuery.includes('biology')) {
        return "Connect science ideas to real examples, draw diagrams, and explain the process in your own words. Small experiments or simulations can make concepts click." + quotaNotice;
      } else if (lowerQuery.includes('english') || lowerQuery.includes('writing') || lowerQuery.includes('essay') || lowerQuery.includes('grammar')) {
        return "Read a model text, outline your ideas (intro–body–conclusion), write clearly, and then revise for flow and grammar. Reading aloud helps catch issues." + quotaNotice;
      } else if (lowerQuery.includes('study') || lowerQuery.includes('exam') || lowerQuery.includes('test') || lowerQuery.includes('prepare')) {
        return "Use a simple plan: daily 25-minute focused sessions, active recall (quiz yourself), spaced repetition, and one page of summary per topic. Sleep and breaks matter." + quotaNotice;
      } else if (lowerQuery.includes('homework') || lowerQuery.includes('assignment')) {
        return "Start early, split tasks into small chunks, and write your own steps. If stuck, note exactly where and ask targeted questions—this builds understanding." + quotaNotice;
      } else {
        return "I'm here to help you learn. Share the topic and what part is confusing, and I’ll guide you step by step." + quotaNotice;
      }
    } else if (role === 'teacher') {
      if (lowerQuery.includes('engagement') || lowerQuery.includes('motivate') || lowerQuery.includes('participate')) {
        return "Try quick hooks, choice in tasks, think-pair-share, and low-stakes checks for understanding. Celebrate effort; rotate roles to include all voices." + quotaNotice;
      } else if (lowerQuery.includes('classroom management') || lowerQuery.includes('behavior') || lowerQuery.includes('discipline')) {
        return "Clarify routines, practice them, use calm proximity, narrate positives, and follow consistent, private corrections. Relationships first, always." + quotaNotice;
      } else if (lowerQuery.includes('lesson plan') || lowerQuery.includes('curriculum') || lowerQuery.includes('teaching')) {
        return "Plan with clear objectives, model, guided practice, independent practice, and exit checks. Build on prior knowledge and differentiate access points." + quotaNotice;
      } else if (lowerQuery.includes('assessment') || lowerQuery.includes('grading') || lowerQuery.includes('evaluation')) {
        return "Blend quick formative checks with clear rubrics for summatives. Provide timely, actionable feedback; use data to adjust instruction." + quotaNotice;
      } else {
        return "I can help with lesson ideas, engagement, assessment, and supports. Tell me the subject, age group, and goal for targeted advice." + quotaNotice;
      }
    }

    return "I'm having trouble reaching the AI service right now. Please try again shortly or share more detail so I can offer targeted guidance." + quotaNotice;
};

// Backward compatibility alias
const getHuggingFaceResponse = getOpenAIResponse;

module.exports = {
  getOpenAIResponse,
  getHuggingFaceResponse
};