const { pool } = require('../config/db');

class Resume {
  /**
   * Create a new resume record
   */
  static async create({ userId, filename, originalName, filePath, fileSize, mimeType }) {
    const [result] = await pool.execute(
      `INSERT INTO resumes (user_id, filename, original_name, file_path, file_size, mime_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
      [userId, filename, originalName, filePath, fileSize, mimeType || 'application/pdf']
    );
    return result.insertId;
  }

  /**
   * Find resume by ID
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM resumes WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find resume by ID with ownership check
   */
  static async findByIdAndUser(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  }

  /**
   * Get all resumes for a user (with optional analysis data)
   */
  static async findByUser(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT r.*, 
              a.ats_score,
              a.created_at as analyzed_at
       FROM resumes r
       LEFT JOIN analyses a ON r.id = a.resume_id
       WHERE r.user_id = ?
       ORDER BY r.upload_date DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    );
    return rows;
  }

  /**
   * Update resume status
   */
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE resumes SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Store extracted raw text
   */
  static async updateRawText(id, rawText) {
    const [result] = await pool.execute(
      'UPDATE resumes SET raw_text = ?, status = "processing" WHERE id = ?',
      [rawText, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete resume by ID
   */
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM resumes WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Count resumes for a user
   */
  static async countByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM resumes WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = Resume;
