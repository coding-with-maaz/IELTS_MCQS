const multer = require('multer');
const path = require('path');

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory where files will be uploaded
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // File name with timestamp to avoid conflicts
  }
});

// Set file filter for PDF files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type, only PDF is allowed!'), false); // Reject the file
  }
};

// Initialize Multer with the storage configuration and file filter
const pdfUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single('answerSheetPDF'); // 'answerSheetPDF' is the name of the form field

module.exports = { pdfUpload };
