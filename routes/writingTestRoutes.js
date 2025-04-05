const express = require('express');
const router = express.Router();
const writingTestController = require('../controllers/writingTestController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for writing test files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/writing-tests';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure storage for writing answer uploads
const answerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/writing-answers';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('answerSheet');

const answerUpload = multer({
  storage: answerStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('answerFile');

// Test management routes (admin only)
router.post('/', [protect, isAdmin], (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, writingTestController.createWritingTest);

router.get('/', writingTestController.getAllWritingTests);
router.get('/:id', writingTestController.getWritingTest);
router.delete('/:id', [protect, isAdmin], writingTestController.deleteWritingTest);

// Test submission routes
router.post('/:id/submit', protect, (req, res, next) => {
  answerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, writingTestController.submitWritingTest);

// Submission management routes (admin only)
router.get('/submissions/pending', [protect, isAdmin], writingTestController.getPendingSubmissions);
router.get('/submissions/all', [protect, isAdmin], writingTestController.getAllSubmissions);
router.get('/submissions/:id', protect, writingTestController.getSubmission);
router.put('/submissions/:submissionId/grade', [protect, isAdmin], writingTestController.gradeSubmission);

module.exports = router;
