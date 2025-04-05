const express = require('express');
const router = express.Router();
const pteSpeakingTestController = require('../controllers/pteSpeakingTestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', pteSpeakingTestController.getAllTests);
router.get('/:id', pteSpeakingTestController.getTest);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', pteSpeakingTestController.createTest);
router.patch('/:id', pteSpeakingTestController.updateTest);
router.delete('/:id', pteSpeakingTestController.deleteTest);
router.patch('/:id/reorder-sections', pteSpeakingTestController.reorderSections);
router.get('/:id/analytics', pteSpeakingTestController.getTestAnalytics);

module.exports = router; 