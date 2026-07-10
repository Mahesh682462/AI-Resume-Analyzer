const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Get analysis history for the user
router.get('/history/all', analysisController.getHistory);

// Trigger AI analysis for a resume
router.post('/:resumeId', analysisController.analyze);

// Get analysis results for a resume
router.get('/:resumeId', analysisController.getAnalysis);

// Re-run analysis for a resume
router.post('/:resumeId/reanalyze', analysisController.reanalyze);

module.exports = router;
