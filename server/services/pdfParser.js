const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    // Clean up extracted text
    let text = data.text || '';

    // Normalize whitespace
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return text;
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Get PDF metadata
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<Object>} - PDF metadata
 */
async function getMetadata(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    return {
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version
    };
  } catch (error) {
    console.error('PDF metadata error:', error.message);
    throw new Error(`Failed to read PDF metadata: ${error.message}`);
  }
}

module.exports = { extractText, getMetadata };
