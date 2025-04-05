const multer = require('multer');
const path = require('path');

// Configure multer for audio file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/speaking'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;