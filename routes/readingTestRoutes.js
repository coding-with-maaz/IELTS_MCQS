const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const readingTestController = require('../controllers/readingTestController');
const { check } = require('express-validator');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/answer-sheets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filename
  }
});

// Create upload middleware
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF files are allowed');
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size of 10MB
}).single('answerSheet'); // 'answerSheet' is the field name for the file upload

// Test management routes (admin only)
router.post('/', [protect, isAdmin, upload], readingTestController.createReadingTest);
router.put('/:id', [protect, isAdmin, upload], readingTestController.updateReadingTest);
router.delete('/:id', [protect, isAdmin], readingTestController.deleteReadingTest);

// Public routes (require authentication)
router.get('/', protect, readingTestController.getAllReadingTests);
router.get('/:id', protect, readingTestController.getReadingTest);

// Test submission routes
router.post('/:id/submit', [
  protect,
  upload,
  [
    check('answers').isObject().withMessage('Answers must be provided')
  ]
], readingTestController.submitReadingTest);

// Grading routes (admin only)
router.put('/:id/grade', [
  protect,
  isAdmin,
  [
    check('bandScore').isFloat({ min: 0, max: 9 }).withMessage('Band score must be between 0 and 9'),
    check('feedback').notEmpty().withMessage('Feedback is required')
  ]
], readingTestController.gradeSubmission);

// Get submission details
router.get('/submissions/:id', protect, readingTestController.getSubmission);

module.exports = router;
