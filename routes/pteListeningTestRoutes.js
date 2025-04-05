const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Import controllers
const pteListeningTestController = require('../controllers/pteListeningTestController');
const pteListeningSectionController = require('../controllers/pteListeningSectionController');
const pteListeningQuestionController = require('../controllers/pteListeningQuestionController');
const submittedPTEListeningTestController = require('../controllers/submittedPTEListeningTestController');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/audio');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an audio file! Please upload an audio file.'), false);
    }
  }
});

// PTE Listening Test Routes
router
  .route('/')
  .post(protect, authorize('admin'), pteListeningTestController.createTest)
  .get(protect, pteListeningTestController.getAllTests);

router
  .route('/:id')
  .get(protect, pteListeningTestController.getTest)
  .put(protect, authorize('admin'), pteListeningTestController.updateTest)
  .delete(protect, authorize('admin'), pteListeningTestController.deleteTest);

router
  .route('/:testId/sections')
  .post(protect, authorize('admin'), pteListeningTestController.addSection)
  .delete(protect, authorize('admin'), pteListeningTestController.removeSection)
  .put(protect, authorize('admin'), pteListeningTestController.reorderSections);

router
  .route('/:id/stats')
  .get(protect, authorize('admin'), pteListeningTestController.getTestStats);

// PTE Listening Section Routes
router
  .route('/sections')
  .post(protect, authorize('admin'), pteListeningSectionController.createSection)
  .get(protect, pteListeningSectionController.getAllSections);

router
  .route('/sections/:id')
  .get(protect, pteListeningSectionController.getSection)
  .put(protect, authorize('admin'), pteListeningSectionController.updateSection)
  .delete(protect, authorize('admin'), pteListeningSectionController.deleteSection);

router
  .route('/sections/:sectionId/questions')
  .post(protect, authorize('admin'), pteListeningSectionController.addQuestion)
  .delete(protect, authorize('admin'), pteListeningSectionController.removeQuestion)
  .put(protect, authorize('admin'), pteListeningSectionController.reorderQuestions);

router
  .route('/sections/:id/audio')
  .put(protect, authorize('admin'), upload.single('audio'), pteListeningSectionController.updateAudio);

// PTE Listening Question Routes
router
  .route('/questions')
  .post(protect, authorize('admin'), pteListeningQuestionController.createQuestion)
  .get(protect, pteListeningQuestionController.getAllQuestions);

router
  .route('/questions/:id')
  .get(protect, pteListeningQuestionController.getQuestion)
  .put(protect, authorize('admin'), pteListeningQuestionController.updateQuestion)
  .delete(protect, authorize('admin'), pteListeningQuestionController.deleteQuestion);

router
  .route('/questions/:id/validate')
  .post(protect, pteListeningQuestionController.validateAnswer);

router
  .route('/questions/type/:type')
  .get(protect, pteListeningQuestionController.getQuestionsByType);

router
  .route('/questions/difficulty/:difficulty')
  .get(protect, pteListeningQuestionController.getQuestionsByDifficulty);

router
  .route('/questions/section/:sectionId')
  .get(protect, pteListeningQuestionController.getQuestionsBySection);

// Submitted PTE Listening Test Routes
router
  .route('/submissions')
  .post(protect, submittedPTEListeningTestController.submitTest)
  .get(protect, authorize('admin'), submittedPTEListeningTestController.getAllSubmissions);

router
  .route('/submissions/user')
  .get(protect, submittedPTEListeningTestController.getUserSubmissions);

router
  .route('/submissions/:id')
  .get(protect, submittedPTEListeningTestController.getSubmission)
  .put(protect, authorize('admin'), submittedPTEListeningTestController.gradeSubmission);

router
  .route('/submissions/stats')
  .get(protect, authorize('admin'), submittedPTEListeningTestController.getSubmissionStats);

module.exports = router; 