const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pteWritingTestController = require('../controllers/pteWritingTestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Create a new test (admin only)
router.post('/',
  protect,
  restrictTo('admin'),
  [
    body('name').trim().notEmpty().withMessage('Test name is required'),
    body('description').optional().trim(),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('sections').isArray().withMessage('Sections must be an array'),
    body('sections.*.sectionId').isMongoId().withMessage('Invalid section ID'),
    body('sections.*.order').isInt({ min: 0 }).withMessage('Section order must be non-negative')
  ],
  pteWritingTestController.createTest
);

// Get all tests
router.get('/',
  protect,
  pteWritingTestController.getAllTests
);

// Get a specific test
router.get('/:id',
  protect,
  pteWritingTestController.getTest
);

// Update a test (admin only)
router.put('/:id',
  protect,
  restrictTo('admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Test name cannot be empty'),
    body('description').optional().trim(),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('sections').optional().isArray().withMessage('Sections must be an array'),
    body('sections.*.sectionId').optional().isMongoId().withMessage('Invalid section ID'),
    body('sections.*.order').optional().isInt({ min: 0 }).withMessage('Section order must be non-negative')
  ],
  pteWritingTestController.updateTest
);

// Delete a test (admin only)
router.delete('/:id',
  protect,
  restrictTo('admin'),
  pteWritingTestController.deleteTest
);

// Add section to test (admin only)
router.post('/:id/sections',
  protect,
  restrictTo('admin'),
  [
    body('sectionId').isMongoId().withMessage('Invalid section ID'),
    body('order').isInt({ min: 0 }).withMessage('Section order must be non-negative')
  ],
  pteWritingTestController.addSection
);

// Remove section from test (admin only)
router.delete('/:id/sections/:sectionId',
  protect,
  restrictTo('admin'),
  pteWritingTestController.removeSection
);

// Reorder sections (admin only)
router.put('/:id/sections/reorder',
  protect,
  restrictTo('admin'),
  [
    body('sectionIds').isArray().withMessage('Section IDs must be an array'),
    body('sectionIds.*').isMongoId().withMessage('Invalid section ID')
  ],
  pteWritingTestController.reorderSections
);

// Get test preview (admin only)
router.get('/:id/preview',
  protect,
  restrictTo('admin'),
  pteWritingTestController.getTestPreview
);

// Get test analytics (admin only)
router.get('/:id/analytics',
  protect,
  restrictTo('admin'),
  pteWritingTestController.getTestAnalytics
);

module.exports = router; 