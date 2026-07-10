const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const pdfParser = require('../services/pdfParser');

/**
 * POST /api/resumes/upload
 * Upload a PDF resume and extract text
 */
exports.upload = async (req, res, next) => {
  try {
    const file = req.file;
    const userId = req.user.id;

    // Create resume record in database
    const resumeId = await Resume.create({
      userId,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Extract text from PDF
    let rawText = '';
    try {
      rawText = await pdfParser.extractText(file.path);

      if (!rawText || rawText.trim().length < 50) {
        await Resume.updateStatus(resumeId, 'failed');
        return res.status(422).json({
          success: false,
          message: 'Could not extract enough text from the PDF. The file may be image-based or corrupted. Please upload a text-based PDF resume.'
        });
      }

      // Store extracted text
      await Resume.updateRawText(resumeId, rawText);
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      await Resume.updateStatus(resumeId, 'failed');
      return res.status(422).json({
        success: false,
        message: 'Failed to parse PDF. Please ensure the file is a valid PDF document.'
      });
    }

    // Get the created resume
    const resume = await Resume.findById(resumeId);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and text extracted successfully!',
      data: {
        resume: {
          id: resume.id,
          original_name: resume.original_name,
          file_size: resume.file_size,
          status: resume.status,
          upload_date: resume.upload_date,
          text_length: rawText.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
exports.getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const resumes = await Resume.findByUser(userId, limit, offset);
    const total = await Resume.countByUser(userId);

    res.json({
      success: true,
      data: {
        resumes: resumes.map(r => ({
          id: r.id,
          original_name: r.original_name,
          file_size: r.file_size,
          status: r.status,
          upload_date: r.upload_date,
          ats_score: r.ats_score || null,
          analyzed_at: r.analyzed_at || null
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/:id
 * Get a single resume by ID
 */
exports.getOne = async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndUser(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    res.json({
      success: true,
      data: {
        resume: {
          id: resume.id,
          original_name: resume.original_name,
          file_size: resume.file_size,
          status: resume.status,
          upload_date: resume.upload_date,
          has_text: !!resume.raw_text
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/resumes/:id
 * Delete a resume and its analysis
 */
exports.delete = async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndUser(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    // Delete the physical file
    try {
      if (fs.existsSync(resume.file_path)) {
        fs.unlinkSync(resume.file_path);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with DB deletion even if file deletion fails
    }

    // Delete from database (analyses cascade due to FK)
    await Resume.delete(resume.id);

    res.json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
