const express = require('express');
const router = express.Router();
const submittedWritingTestController = require('../controllers/submittedWritingTestController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for writing answer uploads
const storage = multer.diskStorage({
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
});

// Submit routes
router.post(
  '/:testId/submit',
  protect,
  upload.single('answerSheet'),
  submittedWritingTestController.submitTest
);

// User routes
router.get(
  '/user',
  protect,
  submittedWritingTestController.getUserSubmissions
);

// Admin routes
router.get(
  '/all',
  [protect, isAdmin],
  submittedWritingTestController.getAllSubmissions
);

router.get(
  '/pending',
  [protect, isAdmin],
  submittedWritingTestController.getPendingSubmissions
);

router.put(
  '/:id/grade',
  [protect, isAdmin],
  submittedWritingTestController.gradeSubmission
);

// Common routes
router.get(
  '/:id',
  protect,
  submittedWritingTestController.getSubmission
);

module.exports = router; 