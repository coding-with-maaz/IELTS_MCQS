const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    let user;
    if (req.user.role === 'user') {
      // For regular users, include their submitted tests
      user = await User.findById(req.user.id)
        .select('-password')
        .populate({
          path: 'submittedListeningTests',
          select: 'test score status submittedAt gradedAt',
          populate: { path: 'test', select: 'title' }
        })
        .populate({
          path: 'submittedReadingTests',
          select: 'test score status submittedAt gradedAt',
          populate: { path: 'test', select: 'title' }
        })
        .populate({
          path: 'submittedWritingTests',
          select: 'test score status submittedAt gradedAt',
          populate: { path: 'test', select: 'title' }
        });
    } else {
      // For admin users, just basic profile
      user = await User.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile' 
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: errors.array()[0].msg 
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile' 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: errors.array()[0].msg 
    });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while changing password' 
    });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'submittedListeningTests',
        select: 'score status'
      })
      .populate({
        path: 'submittedReadingTests',
        select: 'score status'
      })
      .populate({
        path: 'submittedWritingTests',
        select: 'score status'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate statistics
    const stats = {
      listening: {
        totalTests: user.submittedListeningTests.length,
        completed: user.submittedListeningTests.filter(test => test.status === 'completed').length,
        pending: user.submittedListeningTests.filter(test => test.status === 'pending').length,
        averageScore: calculateAverage(user.submittedListeningTests.map(test => test.score))
      },
      reading: {
        totalTests: user.submittedReadingTests.length,
        completed: user.submittedReadingTests.filter(test => test.status === 'completed').length,
        pending: user.submittedReadingTests.filter(test => test.status === 'pending').length,
        averageScore: calculateAverage(user.submittedReadingTests.map(test => test.score))
      },
      writing: {
        totalTests: user.submittedWritingTests.length,
        completed: user.submittedWritingTests.filter(test => test.status === 'completed').length,
        pending: user.submittedWritingTests.filter(test => test.status === 'pending').length,
        averageScore: calculateAverage(user.submittedWritingTests.map(test => test.score))
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user stats' 
    });
  }
};

// Helper function to calculate average
const calculateAverage = (scores) => {
  const validScores = scores.filter(score => score != null);
  if (validScores.length === 0) return 0;
  return validScores.reduce((a, b) => a + b, 0) / validScores.length;
};

// Get user activity
exports.getUserActivity = async (req, res) => {
  try {
    // Implement user activity logic here
    res.json({
      success: true,
      data: { activity: [] }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user activity' 
    });
  }
};

// Admin Controllers

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'submittedListeningTests',
        select: 'score status'
      })
      .populate({
        path: 'submittedReadingTests',
        select: 'score status'
      })
      .populate({
        path: 'submittedWritingTests',
        select: 'score status'
      });

    // Calculate average scores for each user
    const usersWithStats = users.map(user => {
      const allScores = [
        ...user.submittedListeningTests.map(test => test.score),
        ...user.submittedReadingTests.map(test => test.score),
        ...user.submittedWritingTests.map(test => test.score)
      ].filter(score => score != null);

      const averageScore = allScores.length > 0 
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
        : 0;

      return {
        ...user.toObject(),
        averageScore,
        submissions: [
          ...user.submittedListeningTests,
          ...user.submittedReadingTests,
          ...user.submittedWritingTests
        ]
      };
    });

    res.json({
      success: true,
      data: { users: usersWithStats }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users' 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user' 
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: errors.array()[0].msg 
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating user role' 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting user' 
    });
  }
};

// Get admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          adminUsers,
          regularUsers
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching admin stats' 
    });
  }
};