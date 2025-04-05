const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const submittedListeningTestController = require('../controllers/submittedListeningTestController');

// Submit a test
router.post(
  '/submit',
  [
    protect,
    [
      check('testId', 'Test ID is required').not().isEmpty(),
      check('answers', 'Answers are required').isArray()
    ]
  ],
  submittedListeningTestController.submitTest
);

// Get all submissions (admin only)
router.get(
  '/all',
  [protect, isAdmin],
  submittedListeningTestController.getAllSubmissions
);

// Get user's submissions
router.get(
  '/my-submissions',
  protect,
  submittedListeningTestController.getUserSubmissions
);

// Grade a submission (admin only)
router.put(
  '/grade/:id',
  [
    protect,
    isAdmin,
    [
      check('grade', 'Grade must be between 0 and 100').isFloat({ min: 0, max: 100 }),
      check('feedback', 'Feedback is required').not().isEmpty()
    ]
  ],
  submittedListeningTestController.gradeSubmission
);

// Get a specific submission
router.get(
  '/:id',
  protect,
  submittedListeningTestController.getSubmission
);

module.exports = router; 