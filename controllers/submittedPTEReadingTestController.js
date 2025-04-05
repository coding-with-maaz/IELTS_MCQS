const SubmittedPTEReadingTest = require('../models/SubmittedPTEReadingTest');
const PTEReadingTest = require('../models/PTEReadingTest');
const { validationResult } = require('express-validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Submit a test
exports.submitTest = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { testId, answers, timeTaken } = req.body;

  // Validate test exists
  const test = await PTEReadingTest.findById(testId);
  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Create submission
  const submission = await SubmittedPTEReadingTest.create({
    user: req.user._id,
    test: testId,
    answers,
    timeTaken,
    status: 'submitted'
  });

  res.status(201).json({
    success: true,
    data: {
      submission
    }
  });
});

// Get user's submitted tests
exports.getUserSubmissions = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEReadingTest.find({ user: req.user._id })
    .populate('test', 'name description')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// Get a specific submission
exports.getSubmission = catchAsync(async (req, res) => {
  const submission = await SubmittedPTEReadingTest.findById(req.params.id)
    .populate('test')
    .populate('user', 'name email');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check if user has access to this submission
  if (submission.user._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this submission', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      submission
    }
  });
});

// Grade a submission (admin only)
exports.gradeSubmission = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { score, feedback } = req.body;
  const submission = await SubmittedPTEReadingTest.findById(req.params.id);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  submission.score = score;
  submission.feedback = feedback;
  submission.gradedBy = req.user._id;
  submission.gradedAt = Date.now();
  submission.status = 'graded';

  await submission.save();

  res.status(200).json({
    success: true,
    data: {
      submission
    }
  });
});

// Get submission statistics (admin only)
exports.getSubmissionStats = catchAsync(async (req, res) => {
  const stats = await SubmittedPTEReadingTest.aggregate([
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageTimeTaken: { $avg: '$timeTaken' },
        statusDistribution: {
          $push: '$status'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalSubmissions: 1,
        averageScore: { $round: ['$averageScore', 2] },
        averageTimeTaken: { $round: ['$averageTimeTaken', 2] },
        statusDistribution: {
          submitted: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'submitted'] } } } },
          graded: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'graded'] } } } }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalSubmissions: 0,
      averageScore: 0,
      averageTimeTaken: 0,
      statusDistribution: {
        submitted: 0,
        graded: 0
      }
    }
  });
});