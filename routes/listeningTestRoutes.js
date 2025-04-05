const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const testController = require('../controllers/listeningTestController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for answer sheets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/answer-sheets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const answerSheetUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('answerSheet');

// All routes are protected
router.use(protect);

// Routes that require admin role
router.post('/', isAdmin, testController.createTest);
router.put('/:id', isAdmin, testController.updateTest);
router.delete('/:id', isAdmin, testController.deleteTest);

// Public routes (require only authentication)
router.get('/', testController.getAllTests);
router.get('/:id', testController.getTest);

// Section management routes (admin only)
router.post('/:testId/sections/:sectionId', isAdmin, testController.addSection);
router.delete('/:testId/sections/:sectionId', isAdmin, testController.removeSection);
router.put('/:testId/sections/reorder', isAdmin, testController.reorderSections);

// Admin routes for managing submissions
router.get('/submissions/all', isAdmin, testController.getAllSubmissions);
router.get('/:testId/submissions', isAdmin, testController.getTestSubmissions);
router.get('/submissions/:submissionId', isAdmin, testController.getSubmission);
router.put('/submissions/:submissionId/grade', [
  isAdmin,
  check('grade', 'Grade must be between 0 and 100').isFloat({ min: 0, max: 100 }),
  check('feedback', 'Feedback is required').not().isEmpty()
], testController.gradeSubmission);

module.exports = router;
