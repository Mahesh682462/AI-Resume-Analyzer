const { generateContent } = require('./geminiAI');

/**
 * Build the analysis prompt for the AI
 * @param {string} resumeText - Extracted text from the resume
 * @returns {string} - Structured prompt
 */
function buildPrompt(resumeText) {
  return `You are an expert resume analyst and career advisor. Analyze the following resume text thoroughly and provide a comprehensive analysis.

IMPORTANT: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no explanation text — just the raw JSON object.

Resume Text:
"""
${resumeText}
"""

Analyze the resume and return a JSON object with EXACTLY these fields:

{
  "ats_score": <number 0-100, ATS compatibility score based on formatting, keywords, structure>,
  "summary": "<string, 3-4 sentence professional summary of the candidate>",
  "technical_skills": [
    {"skill": "<skill name>", "proficiency": "<Beginner|Intermediate|Advanced|Expert>", "category": "<category like Programming, Database, Cloud, etc.>"}
  ],
  "soft_skills": [
    {"skill": "<soft skill name>", "evidence": "<brief evidence from resume>"}
  ],
  "missing_skills": [
    {"skill": "<commonly expected skill that's missing>", "importance": "<High|Medium|Low>", "reason": "<why this skill matters>"}
  ],
  "strengths": [
    {"point": "<strength description>", "impact": "<High|Medium|Low>"}
  ],
  "weaknesses": [
    {"point": "<weakness description>", "suggestion": "<how to fix>"}
  ],
  "improvements": [
    {"area": "<area to improve>", "current": "<current state>", "recommended": "<what to do>", "priority": "<High|Medium|Low>"}
  ],
  "suggested_roles": [
    {"role": "<job title>", "match_percentage": <number 0-100>, "reason": "<why this role fits>"}
  ],
  "keyword_analysis": {
    "total_keywords": <number>,
    "strong_keywords": ["<keyword1>", "<keyword2>"],
    "weak_areas": ["<area needing more keywords>"],
    "industry_keywords": ["<relevant industry keywords found>"],
    "action_verbs": ["<action verbs used>"]
  },
  "experience": [
    {"company": "<company name>", "role": "<job title>", "duration": "<duration>", "highlights": ["<key achievement>"]}
  ],
  "education": [
    {"institution": "<school name>", "degree": "<degree>", "field": "<field of study>", "year": "<graduation year or expected>", "gpa": "<GPA if mentioned>"}
  ],
  "projects": [
    {"name": "<project name>", "description": "<brief description>", "technologies": ["<tech used>"], "impact": "<impact or outcome>"}
  ],
  "certifications": [
    {"name": "<certification name>", "issuer": "<issuing organization>", "year": "<year if mentioned>", "relevance": "<High|Medium|Low>"}
  ]
}

Rules:
- Be thorough and detailed in your analysis
- ATS score should reflect real-world ATS scanning standards
- Identify at least 5 technical skills if present
- Provide at least 3 improvement suggestions
- Suggest at least 3 relevant job roles
- If a section has no data, return an empty array []
- For keyword_analysis, if no data, return the object with 0 and empty arrays
- Be constructive in weaknesses and improvements
- All string values must be properly escaped for JSON`;
}

/**
 * Analyze a resume using Google Gemini AI
 * @param {string} resumeText - Extracted text from the resume
 * @returns {Promise<Object>} - Structured analysis results
 */
async function analyzeResume(resumeText) {
  const prompt = buildPrompt(resumeText);

  const response = await generateContent(prompt);

  // Parse the JSON response
  let analysis;
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanResponse = response.trim();

    // Remove ```json ... ``` wrapper if present
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
    }

    analysis = JSON.parse(cleanResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError.message);
    console.error('Raw response:', response.substring(0, 500));

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error('AI returned invalid JSON. Please try again.');
      }
    } else {
      throw new Error('AI response could not be parsed. Please try again.');
    }
  }

  // Validate and set defaults for required fields
  return {
    ats_score: Math.min(100, Math.max(0, parseInt(analysis.ats_score) || 0)),
    summary: analysis.summary || 'No summary available.',
    technical_skills: Array.isArray(analysis.technical_skills) ? analysis.technical_skills : [],
    soft_skills: Array.isArray(analysis.soft_skills) ? analysis.soft_skills : [],
    missing_skills: Array.isArray(analysis.missing_skills) ? analysis.missing_skills : [],
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    suggested_roles: Array.isArray(analysis.suggested_roles) ? analysis.suggested_roles : [],
    keyword_analysis: analysis.keyword_analysis || { total_keywords: 0, strong_keywords: [], weak_areas: [], industry_keywords: [], action_verbs: [] },
    experience: Array.isArray(analysis.experience) ? analysis.experience : [],
    education: Array.isArray(analysis.education) ? analysis.education : [],
    projects: Array.isArray(analysis.projects) ? analysis.projects : [],
    certifications: Array.isArray(analysis.certifications) ? analysis.certifications : []
  };
}

module.exports = { analyzeResume };
