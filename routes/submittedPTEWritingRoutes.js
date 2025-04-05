const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const submittedPTEWritingTestController = require('../controllers/submittedPTEWritingTestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Submit a test
router.post('/submit',
  protect,
  [
    body('testId').isMongoId().withMessage('Invalid test ID'),
    body('answers').isArray().withMessage('Answers must be an array'),
    body('timeTaken').isInt({ min: 0 }).withMessage('Time taken must be non-negative')
  ],
  submittedPTEWritingTestController.submitTest
);

// Get user's submitted tests
router.get('/my-submissions',
  protect,
  submittedPTEWritingTestController.getUserSubmissions
);

// Get a specific submission
router.get('/:id',
  protect,
  submittedPTEWritingTestController.getSubmissionResults
);

// Grade a submission (admin only)
router.post('/:id/grade',
  protect,
  restrictTo('admin'),
  [
    body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('feedback').optional().trim()
  ],
  submittedPTEWritingTestController.gradeSubmission
);

// Get submission statistics (admin only)
router.get('/stats/overview',
  protect,
  restrictTo('admin'),
  submittedPTEWritingTestController.getTestStatistics
);

module.exports = router; 