const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/writingSectionController');
const fs = require('fs'); // Added fs to handle file deletion
const multer = require('multer');
const path = require('path');

// Set up multer storage and file filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Audio, Image, and PDF file upload handling
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for files
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp3|wav|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /jpeg|jpg|png|audio\/mpeg|mp3|wav|application\/pdf/.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, MP3, and WAV files are allowed.'));
  }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// Middleware to handle file upload errors
const handleFileUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Create a new writing section
router.post('/', upload, handleFileUploadError, sectionController.createWritingSection);

// Get all writing sections
router.get('/', sectionController.getAllWritingSections);

// Get a specific writing section by ID
router.get('/:id', sectionController.getWritingSection);

// Update a specific writing section by ID
router.put('/:id', upload, handleFileUploadError, sectionController.updateWritingSection);

// Delete a specific writing section by ID
router.delete('/:id', sectionController.deleteWritingSection);

module.exports = router;
