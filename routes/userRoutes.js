const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Admin middleware
// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(403).json({ 
//       success: false, 
//       message: 'Access denied. Admin privileges required.' 
//     });
//   }
// };

// Regular user routes
router.get('/profile', protect, userController.getUserProfile);

// Update user profile
router.put(
  '/profile',
  [
    protect,
    [
      check('name', 'Name is required').optional().notEmpty(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('profile.phoneNumber').optional().trim(),
      check('profile.country').optional().trim(),
      check('profile.targetBand', 'Target band must be between 0 and 9').optional().isFloat({ min: 0, max: 9 }),
      check('profile.nativeLanguage').optional().trim(),
      check('profile.bio').optional().trim(),
      check('profile.avatar').optional().trim()
    ]
  ],
  userController.updateUserProfile
);

// Change password
router.put(
  '/change-password',
  [
    protect,
    [
      check('currentPassword', 'Current password is required').notEmpty(),
      check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ]
  ],
  userController.changePassword
);

// Get user's test statistics
router.get('/stats', protect, userController.getUserStats);

// Get user's recent activity
router.get('/activity', protect, userController.getUserActivity);

// Admin-only routes
router.get('/all-users', [protect, isAdmin], userController.getAllUsers);
router.get('/user/:id', [protect, isAdmin], userController.getUserById);
router.put('/user/:id/role', [
  protect, 
  isAdmin,
  [check('role', 'Role must be either user or admin').isIn(['user', 'admin'])]
], userController.updateUserRole);
router.delete('/user/:id', [protect, isAdmin], userController.deleteUser);
router.get('/admin/stats', [protect, isAdmin], userController.getAdminStats);

module.exports = router;