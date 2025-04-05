const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const submittedPTEListeningTestController = require('../controllers/submittedPTEListeningTestController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Submit a test
router.post('/submit',
  auth,
  [
    body('testId').isMongoId().withMessage('Invalid test ID'),
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.questionId').isMongoId().withMessage('Invalid question ID'),
    body('answers.*.answer').notEmpty().withMessage('Answer cannot be empty'),
    body('completionTime').isInt({ min: 1 }).withMessage('Completion time must be at least 1 minute')
  ],
  submittedPTEListeningTestController.submitTest
);

// Get user's submissions
router.get('/my-submissions',
  auth,
  submittedPTEListeningTestController.getUserSubmissions
);

// Get detailed results for a submission
router.get('/:id/results',
  auth,
  submittedPTEListeningTestController.getSubmissionResults
);

// Admin routes
router.get('/',
  auth,
  admin,
  submittedPTEListeningTestController.getAllSubmissions
);

// Grade a submission (admin only)
router.post('/:id/grade',
  auth,
  admin,
  [
    body('grade').isInt({ min: 0, max: 90 }).withMessage('Grade must be between 0 and 90'),
    body('feedback').optional().trim(),
    body('sectionScores').isArray().withMessage('Section scores must be an array'),
    body('sectionScores.*.sectionId').isMongoId().withMessage('Invalid section ID'),
    body('sectionScores.*.score').isInt({ min: 0 }).withMessage('Section score cannot be negative'),
    body('sectionScores.*.feedback').optional().trim()
  ],
  submittedPTEListeningTestController.gradeSubmission
);

// Get test statistics (admin only)
router.get('/test/:testId/statistics',
  auth,
  admin,
  submittedPTEListeningTestController.getTestStatistics
);

// Get audio playback history (admin only)
router.get('/:id/audio-history',
  auth,
  admin,
  submittedPTEListeningTestController.getAudioPlaybackHistory
);

// Get detailed performance metrics (admin only)
router.get('/:id/metrics',
  auth,
  admin,
  submittedPTEListeningTestController.getPerformanceMetrics
);

module.exports = router; 