const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// All routes are protected
router.use(auth);

// Upload a resume
router.post('/upload', uploadMiddleware, resumeController.upload);

// Get all resumes for the user
router.get('/', resumeController.getAll);

// Get a single resume
router.get('/:id', resumeController.getOne);

// Delete a resume
router.delete('/:id', resumeController.delete);

module.exports = router;
