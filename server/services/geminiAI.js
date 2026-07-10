const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Send a prompt to Google Gemini and get a response
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The AI response text
 */
async function generateContent(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API error:', error.message);

    if (error.message.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env');
    }

    if (error.message.includes('quota') || error.message.includes('rate')) {
      throw new Error('Gemini API rate limit exceeded. Please try again in a moment.');
    }

    throw new Error(`Gemini AI error: ${error.message}`);
  }
}

module.exports = { generateContent };
