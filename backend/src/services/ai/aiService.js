const { model, isAIAvailable } = require('../../config/aiConfig');

/**
 * Robust LLM call with structured prompts and JSON/text response extraction
 */
const callLLM = async (systemInstruction, userPrompt, temperature = 0.2) => {
  if (!isAIAvailable()) {
    return null;
  }

  try {
    const fullPrompt = `${systemInstruction}\n\nFarmer Request / Data:\n${userPrompt}`;
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 1500
      }
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn('[AI Service Warning] LLM generation error:', error.message);
    return null;
  }
};

/**
 * Safely parse JSON from LLM output (extracting markdown codeblocks if present)
 */
const safeJSONParse = (text, fallback = {}) => {
  if (!text) return fallback;
  try {
    // Remove markdown code fences if LLM wrapped in ```json ... ```
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to extract first JSON object or array if mixed with text
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        // Fallback
      }
    }
    return fallback;
  }
};

module.exports = {
  callLLM,
  safeJSONParse,
  isAIAvailable
};
