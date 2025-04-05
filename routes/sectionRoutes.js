const express = require('express');
const router = express.Router();
const multer = require('multer');
const sectionController = require('../controllers/sectionController');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp3|wav|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /jpeg|jpg|png|audio\/mpeg|mp3|wav|application\/pdf/.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, MP3, WAV, and PDF files are allowed.'));
  }  
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// Error handling middleware
const handleFileUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post('/', upload, handleFileUploadError, sectionController.createSection);
router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSection);
router.put('/:id', upload, handleFileUploadError, sectionController.updateSection);
router.delete('/:id', sectionController.deleteSection);

module.exports = router;
