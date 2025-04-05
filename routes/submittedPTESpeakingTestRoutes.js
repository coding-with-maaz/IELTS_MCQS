const express = require('express');
const router = express.Router();
const submittedPTESpeakingTestController = require('../controllers/submittedPTESpeakingTestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', submittedPTESpeakingTestController.submitTest);
router.get('/my-submissions', submittedPTESpeakingTestController.getUserSubmissions);
router.get('/:id', submittedPTESpeakingTestController.getSubmission);

// Admin only routes
router.use(restrictTo('admin'));
router.patch('/:id/grade', submittedPTESpeakingTestController.gradeSubmission);
router.get('/stats/overview', submittedPTESpeakingTestController.getSubmissionStats);

module.exports = router; 