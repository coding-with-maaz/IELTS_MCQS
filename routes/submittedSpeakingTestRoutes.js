const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const submittedSpeakingTestController = require('../controllers/submittedSpeakingTestController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Create upload directory if it doesn't exist
const uploadPath = path.join(__dirname, '../uploads/speaking-submissions');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use a unique filename with timestamp and user information
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const userId = req.user ? req.user.id : 'anonymous';
    const fileExt = path.extname(file.originalname);
    cb(null, `speaking-${userId}-${uniqueSuffix}${fileExt}`);
  }
});

// Filter to only accept audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Validation for test submission
const validateSubmitTest = [
  check('testId', 'Test ID is required').notEmpty(),
  check('sectionId', 'Section ID is required').notEmpty(),
  check('completionTime', 'Completion time must be a number').optional().isNumeric()
];

// Validation for grading
const validateGrading = [
  check('grade', 'Grade must be between 0 and 9').isFloat({ min: 0, max: 9 }),
  check('feedback.fluencyAndCoherence.score', 'Fluency score must be between 0 and 9').optional().isFloat({ min: 0, max: 9 }),
  check('feedback.lexicalResource.score', 'Vocabulary score must be between 0 and 9').optional().isFloat({ min: 0, max: 9 }),
  check('feedback.grammaticalRangeAndAccuracy.score', 'Grammar score must be between 0 and 9').optional().isFloat({ min: 0, max: 9 }),
  check('feedback.pronunciation.score', 'Pronunciation score must be between 0 and 9').optional().isFloat({ min: 0, max: 9 })
];

// Serve audio files directly
router.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadPath, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Audio file not found' });
  }

  // Get file extension to set correct content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'audio/webm';
  if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.wav') contentType = 'audio/wav';
  else if (ext === '.ogg') contentType = 'audio/ogg';

  // Set appropriate headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');

  // Handle range requests for audio streaming
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  if (req.headers.range) {
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', chunksize);
    res.status(206);

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } else {
    res.setHeader('Content-Length', fileSize);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Unknown error in file upload:', err);
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Apply multer middleware with error handling
const uploadWithErrorHandling = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Submitted Speaking Test Routes
router.post('/submit', protect, uploadWithErrorHandling, validateSubmitTest, submittedSpeakingTestController.submitTest);
router.get('/', protect, isAdmin, submittedSpeakingTestController.getAllSubmissions);
router.get('/user', protect, submittedSpeakingTestController.getUserSubmissions);
router.get('/:id', protect, submittedSpeakingTestController.getSubmission);
router.put('/:id/grade', protect, isAdmin, validateGrading, submittedSpeakingTestController.gradeSubmission);
router.delete('/:id', protect, submittedSpeakingTestController.deleteSubmission);

module.exports = router; 