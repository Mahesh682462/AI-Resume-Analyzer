const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const analysisService = require('../services/analysisService');

/**
 * POST /api/analysis/:resumeId
 * Trigger AI analysis for a resume
 */
exports.analyze = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    // Verify resume belongs to user
    const resume = await Resume.findByIdAndUser(resumeId, userId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    // Check if resume has extracted text
    if (!resume.raw_text || resume.raw_text.trim().length < 50) {
      return res.status(422).json({
        success: false,
        message: 'Resume text not available. Please re-upload the resume.'
      });
    }

    // Check if analysis already exists
    const existingAnalysis = await Analysis.findByResumeId(resumeId);
    if (existingAnalysis) {
      return res.json({
        success: true,
        message: 'Analysis already exists for this resume.',
        data: { analysis: existingAnalysis }
      });
    }

    // Update status to processing
    await Resume.updateStatus(resumeId, 'processing');

    // Run AI analysis
    const startTime = Date.now();
    let analysisResult;

    try {
      analysisResult = await analysisService.analyzeResume(resume.raw_text);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      await Resume.updateStatus(resumeId, 'failed');
      return res.status(502).json({
        success: false,
        message: 'AI analysis failed. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }

    const processingTime = Date.now() - startTime;

    // Store analysis results
    await Analysis.create(resumeId, {
      ...analysisResult,
      ai_model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      processing_time_ms: processingTime
    });

    // Update resume status
    await Resume.updateStatus(resumeId, 'analyzed');

    // Fetch the stored analysis (with parsed JSON)
    const analysis = await Analysis.findWithResume(resumeId, userId);

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully!',
      data: {
        analysis,
        processing_time_ms: processingTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analysis/:resumeId
 * Get analysis results for a resume
 */
exports.getAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    // Verify resume belongs to user
    const resume = await Resume.findByIdAndUser(resumeId, userId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    const analysis = await Analysis.findWithResume(resumeId, userId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this resume. Please trigger analysis first.'
      });
    }

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analysis/history/all
 * Get all analyses for the authenticated user
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const analyses = await Analysis.findByUser(userId, limit, offset);

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page,
          limit,
          total: analyses.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analysis/:resumeId/reanalyze
 * Re-run AI analysis (delete old and create new)
 */
exports.reanalyze = async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    // Verify resume belongs to user
    const resume = await Resume.findByIdAndUser(resumeId, userId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    if (!resume.raw_text || resume.raw_text.trim().length < 50) {
      return res.status(422).json({
        success: false,
        message: 'Resume text not available. Please re-upload the resume.'
      });
    }

    // Delete existing analysis
    await Analysis.deleteByResumeId(resumeId);
    await Resume.updateStatus(resumeId, 'processing');

    // Run AI analysis
    const startTime = Date.now();
    let analysisResult;

    try {
      analysisResult = await analysisService.analyzeResume(resume.raw_text);
    } catch (aiError) {
      console.error('AI re-analysis failed:', aiError);
      await Resume.updateStatus(resumeId, 'failed');
      return res.status(502).json({
        success: false,
        message: 'AI analysis failed. Please try again later.'
      });
    }

    const processingTime = Date.now() - startTime;

    await Analysis.create(resumeId, {
      ...analysisResult,
      ai_model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      processing_time_ms: processingTime
    });

    await Resume.updateStatus(resumeId, 'analyzed');

    const analysis = await Analysis.findWithResume(resumeId, userId);

    res.status(201).json({
      success: true,
      message: 'Resume re-analyzed successfully!',
      data: {
        analysis,
        processing_time_ms: processingTime
      }
    });
  } catch (error) {
    next(error);
  }
};
