const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity, getRecentSubmissions } = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin authorization
router.use(protect);
router.use(isAdmin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent activity and submissions
router.get('/recent-activity', getRecentActivity);
router.get('/recent-submissions', getRecentSubmissions);

module.exports = router; 