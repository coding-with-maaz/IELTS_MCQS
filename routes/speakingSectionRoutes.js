const express = require('express');
const router = express.Router();
const speakingSectionController = require('../controllers/speakingSectionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadPath = path.join(__dirname, '../uploads/speaking-sections');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExt = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  }
});

// Set up multer with disk storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedTypes = /mp3|wav|webm|ogg/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /audio/.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb(new Error('Only audio files (MP3, WAV, WebM, OGG) are allowed.'));
    } else if (file.fieldname === 'image') {
      const allowedTypes = /jpeg|jpg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /image/.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb(new Error('Only image files (JPEG, PNG) are allowed.'));
    } else if (file.fieldname === 'pdf') {
      const allowedTypes = /pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /pdf/.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb(new Error('Only PDF files are allowed.'));
    } else {
      cb(null, true);
    }
  }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 20MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Unknown error in file upload:', err);
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Serve static files
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

// Wrapper function to handle async errors
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Apply multer middleware with error handling
const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Admin routes
router.post('/', protect, isAdmin, uploadWithErrorHandling, asyncHandler(speakingSectionController.createSpeakingSection));
router.put('/:id', protect, isAdmin, uploadWithErrorHandling, asyncHandler(speakingSectionController.updateSpeakingSection));
router.delete('/:id', protect, isAdmin, asyncHandler(speakingSectionController.deleteSpeakingSection));

// Public routes (require authentication)
router.get('/', protect, asyncHandler(speakingSectionController.getAllSpeakingSections));
router.get('/:id', protect, asyncHandler(speakingSectionController.getSpeakingSection));

// Global error handler
router.use((err, req, res, next) => {
  console.error('Route error handler caught:', err);
  res.status(500).json({ message: err.message || 'Something went wrong on the server!' });
});

module.exports = router;
