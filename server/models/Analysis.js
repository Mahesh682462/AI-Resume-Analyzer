const { pool } = require('../config/db');

class Analysis {
  /**
   * Create or update analysis for a resume
   */
  static async create(resumeId, analysisData) {
    const {
      ats_score,
      summary,
      technical_skills,
      soft_skills,
      missing_skills,
      strengths,
      weaknesses,
      improvements,
      suggested_roles,
      keyword_analysis,
      experience,
      education,
      projects,
      certifications,
      ai_model,
      processing_time_ms
    } = analysisData;

    const [result] = await pool.execute(
      `INSERT INTO analyses (
        resume_id, ats_score, summary,
        technical_skills, soft_skills, missing_skills,
        strengths, weaknesses, improvements,
        suggested_roles, keyword_analysis,
        experience, education, projects, certifications,
        ai_model, processing_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        ats_score = VALUES(ats_score),
        summary = VALUES(summary),
        technical_skills = VALUES(technical_skills),
        soft_skills = VALUES(soft_skills),
        missing_skills = VALUES(missing_skills),
        strengths = VALUES(strengths),
        weaknesses = VALUES(weaknesses),
        improvements = VALUES(improvements),
        suggested_roles = VALUES(suggested_roles),
        keyword_analysis = VALUES(keyword_analysis),
        experience = VALUES(experience),
        education = VALUES(education),
        projects = VALUES(projects),
        certifications = VALUES(certifications),
        ai_model = VALUES(ai_model),
        processing_time_ms = VALUES(processing_time_ms),
        updated_at = CURRENT_TIMESTAMP`,
      [
        resumeId,
        ats_score || 0,
        summary || '',
        JSON.stringify(technical_skills || []),
        JSON.stringify(soft_skills || []),
        JSON.stringify(missing_skills || []),
        JSON.stringify(strengths || []),
        JSON.stringify(weaknesses || []),
        JSON.stringify(improvements || []),
        JSON.stringify(suggested_roles || []),
        JSON.stringify(keyword_analysis || {}),
        JSON.stringify(experience || []),
        JSON.stringify(education || []),
        JSON.stringify(projects || []),
        JSON.stringify(certifications || []),
        ai_model || 'gemini-2.5-flash',
        processing_time_ms || 0
      ]
    );

    return result.insertId || result.affectedRows;
  }

  /**
   * Find analysis by resume ID
   */
  static async findByResumeId(resumeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM analyses WHERE resume_id = ?',
      [resumeId]
    );

    if (!rows[0]) return null;

    // Parse JSON fields
    const analysis = rows[0];
    return Analysis.parseJsonFields(analysis);
  }

  /**
   * Find analysis with resume details
   */
  static async findWithResume(resumeId, userId) {
    const [rows] = await pool.execute(
      `SELECT a.*, r.original_name, r.upload_date, r.file_size
       FROM analyses a
       JOIN resumes r ON a.resume_id = r.id
       WHERE a.resume_id = ? AND r.user_id = ?`,
      [resumeId, userId]
    );

    if (!rows[0]) return null;
    return Analysis.parseJsonFields(rows[0]);
  }

  /**
   * Get all analyses for a user
   */
  static async findByUser(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT a.*, r.original_name, r.upload_date, r.file_size
       FROM analyses a
       JOIN resumes r ON a.resume_id = r.id
       WHERE r.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    );

    return rows.map(row => Analysis.parseJsonFields(row));
  }

  /**
   * Delete analysis by resume ID
   */
  static async deleteByResumeId(resumeId) {
    const [result] = await pool.execute(
      'DELETE FROM analyses WHERE resume_id = ?',
      [resumeId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Parse JSON string fields back to objects
   */
  static parseJsonFields(analysis) {
    const jsonFields = [
      'technical_skills', 'soft_skills', 'missing_skills',
      'strengths', 'weaknesses', 'improvements',
      'suggested_roles', 'keyword_analysis',
      'experience', 'education', 'projects', 'certifications'
    ];

    jsonFields.forEach(field => {
      if (analysis[field] && typeof analysis[field] === 'string') {
        try {
          analysis[field] = JSON.parse(analysis[field]);
        } catch (e) {
          console.error(`Failed to parse ${field}:`, e.message);
          analysis[field] = field === 'keyword_analysis' ? {} : [];
        }
      }
    });

    return analysis;
  }
}

module.exports = Analysis;
