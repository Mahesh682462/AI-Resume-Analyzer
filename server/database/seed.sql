-- =============================================
-- AI Resume Analyzer - Seed Data
-- =============================================
-- Sample data for development and testing
-- Password for test user: Test@1234 (bcrypt hashed)
-- =============================================

USE ai_resume_analyzer;

-- Insert a test user (password: Test@1234)
INSERT INTO users (name, email, password_hash) VALUES
('Test User', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('John Doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON DUPLICATE KEY UPDATE name = VALUES(name);
