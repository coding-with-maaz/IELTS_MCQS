const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const submittedReadingTestController = require('../controllers/submittedReadingTestController');

// Set up storage for answer sheets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/reading-answer-sheets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
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

// Submit a test
router.post(
  '/submit',
  [
    protect,
    [
      check('testId', 'Test ID is required').not().isEmpty(),
      check('answers', 'Answers are required').isArray(),
      check('completionTime', 'Completion time is required').isNumeric()
    ]
  ],
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  submittedReadingTestController.submitTest
);

// Get all submissions (admin only) - Match the frontend API endpoint
router.get(
  '/',
  [protect, isAdmin],
  submittedReadingTestController.getAllSubmissions
);

// Get user's submissions
router.get(
  '/my-submissions',
  protect,
  submittedReadingTestController.getUserSubmissions
);

// Grade a submission (admin only) - Match the frontend API endpoint
router.post(
  '/:submissionId/grade',
  [
    protect,
    isAdmin,
    [
      check('bandScore', 'Band score must be between 1 and 9').isFloat({ min: 1, max: 9 }),
      check('feedback', 'Feedback is required').not().isEmpty()
    ]
  ],
  submittedReadingTestController.gradeSubmission
);

// Get a specific submission
router.get(
  '/:id',
  protect,
  submittedReadingTestController.getSubmission
);

module.exports = router; 