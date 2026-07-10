-- =============================================
-- AI Resume Analyzer - Database Schema
-- =============================================
-- Run this script to create all necessary tables
-- MySQL 8.0+ required for JSON column support
-- =============================================

CREATE DATABASE IF NOT EXISTS ai_resume_analyzer;
USE ai_resume_analyzer;

-- =============================================
-- USERS TABLE
-- Stores registered user accounts
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- RESUMES TABLE
-- Stores uploaded resume metadata and extracted text
-- =============================================
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    raw_text LONGTEXT,
    status ENUM('uploaded', 'processing', 'analyzed', 'failed') DEFAULT 'uploaded',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user (user_id),
    INDEX idx_resumes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ANALYSES TABLE
-- Stores AI-generated analysis results for each resume
-- All complex fields use JSON for flexible schema
-- =============================================
CREATE TABLE IF NOT EXISTS analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL UNIQUE,
    ats_score INT DEFAULT 0,
    summary TEXT,
    
    -- Skills Analysis
    technical_skills JSON,
    soft_skills JSON,
    missing_skills JSON,
    
    -- SWOT-style Analysis
    strengths JSON,
    weaknesses JSON,
    improvements JSON,
    
    -- Career Recommendations
    suggested_roles JSON,
    keyword_analysis JSON,
    
    -- Resume Content Parsing
    experience JSON,
    education JSON,
    projects JSON,
    certifications JSON,
    
    -- Metadata
    ai_model VARCHAR(100) DEFAULT 'gemini-2.5-flash',
    processing_time_ms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_analyses_resume (resume_id),
    INDEX idx_analyses_score (ats_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
