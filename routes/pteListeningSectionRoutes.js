const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pteListeningSectionController = require('../controllers/pteListeningSectionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create a new section (admin only)
router.post('/',
  auth,
  admin,
  [
    body('title').trim().notEmpty().withMessage('Section title is required'),
    body('description').optional().trim(),
    body('audioUrl').isURL().withMessage('Valid audio URL is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 second'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.text').trim().notEmpty().withMessage('Question text is required'),
    body('questions.*.type').isIn(['multiple-choice', 'fill-in-blank', 'highlight-correct-summary']).withMessage('Invalid question type'),
    body('questions.*.options').optional().isArray().withMessage('Options must be an array'),
    body('questions.*.correctAnswer').notEmpty().withMessage('Correct answer is required'),
    body('questions.*.points').isInt({ min: 1 }).withMessage('Points must be at least 1')
  ],
  pteListeningSectionController.createSection
);

// Get all sections
router.get('/',
  auth,
  pteListeningSectionController.getAllSections
);

// Get a specific section
router.get('/:id',
  auth,
  pteListeningSectionController.getSection
);

// Update a section (admin only)
router.put('/:id',
  auth,
  admin,
  [
    body('title').optional().trim().notEmpty().withMessage('Section title cannot be empty'),
    body('description').optional().trim(),
    body('audioUrl').optional().isURL().withMessage('Valid audio URL is required'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 second')
  ],
  pteListeningSectionController.updateSection
);

// Delete a section (admin only)
router.delete('/:id',
  auth,
  admin,
  pteListeningSectionController.deleteSection
);

// Add question to section (admin only)
router.post('/:id/questions',
  auth,
  admin,
  [
    body('text').trim().notEmpty().withMessage('Question text is required'),
    body('type').isIn(['multiple-choice', 'fill-in-blank', 'highlight-correct-summary']).withMessage('Invalid question type'),
    body('options').optional().isArray().withMessage('Options must be an array'),
    body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
    body('points').isInt({ min: 1 }).withMessage('Points must be at least 1')
  ],
  pteListeningSectionController.addQuestion
);

// Update question in section (admin only)
router.put('/:id/questions/:questionId',
  auth,
  admin,
  [
    body('text').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
    body('type').optional().isIn(['multiple-choice', 'fill-in-blank', 'highlight-correct-summary']).withMessage('Invalid question type'),
    body('options').optional().isArray().withMessage('Options must be an array'),
    body('correctAnswer').optional().notEmpty().withMessage('Correct answer cannot be empty'),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be at least 1')
  ],
  pteListeningSectionController.updateQuestion
);

// Delete question from section (admin only)
router.delete('/:id/questions/:questionId',
  auth,
  admin,
  pteListeningSectionController.deleteQuestion
);

// Update audio settings (admin only)
router.put('/:id/audio-settings',
  auth,
  admin,
  [
    body('playbackSpeed').optional().isFloat({ min: 0.5, max: 2.0 }).withMessage('Playback speed must be between 0.5 and 2.0'),
    body('volume').optional().isFloat({ min: 0, max: 1 }).withMessage('Volume must be between 0 and 1'),
    body('startTime').optional().isInt({ min: 0 }).withMessage('Start time must be non-negative'),
    body('endTime').optional().isInt({ min: 0 }).withMessage('End time must be non-negative')
  ],
  pteListeningSectionController.updateAudioSettings
);

// Get section preview (admin only)
router.get('/:id/preview',
  auth,
  admin,
  pteListeningSectionController.getSectionPreview
);

// Get section analytics (admin only)
router.get('/:id/analytics',
  auth,
  admin,
  pteListeningSectionController.getSectionAnalytics
);

module.exports = router; 