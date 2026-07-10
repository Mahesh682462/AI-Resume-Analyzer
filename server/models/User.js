const { pool } = require('../config/db');

class User {
  /**
   * Create a new user
   */
  static async create({ name, email, passwordHash }) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return result.insertId;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar_url, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Update user profile
   */
  static async update(id, { name, email }) {
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get user stats (resume count, analysis count)
   */
  static async getStats(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM resumes WHERE user_id = ?) as total_resumes,
        (SELECT COUNT(*) FROM analyses a 
         JOIN resumes r ON a.resume_id = r.id 
         WHERE r.user_id = ?) as total_analyses,
        (SELECT AVG(a.ats_score) FROM analyses a 
         JOIN resumes r ON a.resume_id = r.id 
         WHERE r.user_id = ? AND a.ats_score > 0) as avg_ats_score`,
      [userId, userId, userId]
    );
    return rows[0];
  }
}

module.exports = User;
