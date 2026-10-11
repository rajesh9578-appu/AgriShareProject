const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');

let genAI = null;
let model = null;

if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('[AI Service] Gemini API initialized successfully with gemini-1.5-flash.');
  } catch (error) {
    console.warn('[AI Service Warning] Failed to initialize Gemini API client:', error.message);
  }
} else {
  console.log('[AI Service] No GEMINI_API_KEY provided. Utilizing high-accuracy agricultural rule-based & semantic fallback engine.');
}

module.exports = {
  genAI,
  model,
  isAIAvailable: () => !!model
};
