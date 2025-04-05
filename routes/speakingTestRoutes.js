const express = require('express');
const router = express.Router();
const speakingTestController = require('../controllers/speakingTestController');
const { isAdmin, protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads/speaking-tests');
const submissionsPath = path.join(__dirname, '../uploads/speaking-submissions');
if (!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath, { recursive: true });
}
if (!fs.existsSync(submissionsPath)){
    fs.mkdirSync(submissionsPath, { recursive: true });
}

// Set up multer storage for test audio files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use different paths for test audio and submissions
    const isSubmission = req.path.includes('/submit');
    cb(null, isSubmission ? submissionsPath : uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExt = path.extname(file.originalname);
    const prefix = req.path.includes('/submit') ? 'submission' : 'speaking-test';
    const userId = req.user ? req.user.id : 'anonymous';
    cb(null, `${prefix}-${userId}-${uniqueSuffix}${fileExt}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /audio/.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only audio files (MP3, WAV, WebM, OGG) are allowed.'));
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
  upload.single('audioFile')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Serve audio files with access control
router.get('/audio/:type/:filename', protect, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Determine the correct path based on type
    let filePath;
    if (type === 'test') {
      filePath = path.join(uploadPath, filename);
    } else if (type === 'submission') {
      filePath = path.join(submissionsPath, filename);
      
      // For submissions, verify ownership or admin status
      if (!req.user.isAdmin) {
        const userId = filename.split('-')[1]; // Extract user ID from filename
        if (userId !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to access this file' });
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid audio type' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      console.log('Directory contents:', fs.readdirSync(path.dirname(filePath)));
      return res.status(404).json({ message: 'Audio file not found' });
    }

    // Set content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'audio/webm';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.wav') contentType = 'audio/wav';
    else if (ext === '.ogg') contentType = 'audio/ogg';

    // Handle range requests for audio streaming
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    if (req.headers.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ message: 'Error serving audio file' });
  }
});

// Serve user submission audio files
router.get('/speaking-submissions/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.id;
    const isAdmin = decoded.role === 'admin';

    // For submissions, verify that the file belongs to the user or user is admin
    if (!filename.includes(userId) && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this audio file' });
    }

    const filePath = path.join(submissionsPath, filename);
    console.log('Attempting to serve file:', {
      requestedFile: filename,
      fullPath: filePath,
      exists: fs.existsSync(filePath)
    });

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // List directory contents for debugging
      const dirContents = fs.readdirSync(submissionsPath);
      console.log('Directory contents:', {
        path: submissionsPath,
        files: dirContents
      });
      return res.status(404).json({ 
        message: 'Audio file not found',
        requestedFile: filename,
        availableFiles: dirContents
      });
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept-Ranges, Content-Range, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

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
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming audio file' });
        }
      });
      stream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const stream = fs.createReadStream(filePath);
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming audio file' });
        }
      });
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Error serving audio file:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error serving audio file' });
    }
  }
});

// Wrapper function to handle async errors
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Admin routes
router.post('/', protect, isAdmin, uploadWithErrorHandling, asyncHandler(speakingTestController.createSpeakingTest));
router.put('/:id', protect, isAdmin, uploadWithErrorHandling, asyncHandler(speakingTestController.updateSpeakingTest));
router.delete('/:id', protect, isAdmin, asyncHandler(speakingTestController.deleteSpeakingTest));

// Public routes (require authentication)
router.get('/', protect, asyncHandler(speakingTestController.getAllSpeakingTests));
router.get('/:id', protect, asyncHandler(speakingTestController.getSpeakingTest));

// Submit recording route
router.post('/:id/submit', protect, uploadWithErrorHandling, asyncHandler(speakingTestController.submitRecording));

// Global error handler
router.use((err, req, res, next) => {
  console.error('Route error handler caught:', err);
  res.status(500).json({ message: err.message || 'Something went wrong on the server!' });
});

module.exports = router;