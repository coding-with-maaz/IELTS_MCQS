const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createPTEReading,
  getAllPTEReadings,
  getPTEReadingById,
  updatePTEReading,
  deletePTEReading,
  getPTEReadingByType,
  getPTEReadingStats
} = require('../controllers/pteReadingController');

// Validation middleware
const validatePTEReading = (req, res, next) => {
  const { type, title, passage, questions, difficulty, points, timeLimit } = req.body;
  
  if (!type || !title || !passage || !questions || !difficulty || !points || !timeLimit) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields'
    });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Questions must be an array with at least one question'
    });
  }

  next();
};

// Public routes
router.get('/', getAllPTEReadings);
router.get('/:id', getPTEReadingById);
router.get('/type/:type', getPTEReadingByType);

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));

router.post('/', validatePTEReading, createPTEReading);
router.patch('/:id', validatePTEReading, updatePTEReading);
router.delete('/:id', deletePTEReading);
router.get('/stats/overview', getPTEReadingStats);

module.exports = router; 