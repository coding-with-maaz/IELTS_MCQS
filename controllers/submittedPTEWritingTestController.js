const SubmittedPTEWritingTest = require('../models/SubmittedPTEWritingTest');
const PTEWritingTest = require('../models/PTEWritingTest');
const PTEWritingSection = require('../models/PTEWritingSection');
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

  const test = await PTEWritingTest.findById(req.body.testId)
    .populate({
      path: 'sections.section'
    });

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Validate word count for each submission
  for (const submission of req.body.submissions) {
    const section = test.sections.find(s => 
      s.section._id.toString() === submission.sectionId.toString()
    );

    if (!section) {
      throw new AppError(`Section ${submission.sectionId} not found in test`, 404);
    }

    if (!section.section.validateWordCount(submission.answer)) {
      throw new AppError(
        `Word count exceeds limit for section ${section.section.title}`,
        400
      );
    }
  }

  // Create submission
  const submission = await SubmittedPTEWritingTest.create({
    user: req.user._id,
    test: test._id,
    submissions: req.body.submissions.map(sub => ({
      section: sub.sectionId,
      answer: sub.answer,
      wordCount: sub.wordCount,
      timeTaken: sub.timeTaken
    })),
    maxScore: test.totalPoints,
    timeTaken: req.body.timeTaken,
    status: 'submitted'
  });

  res.status(201).json({
    success: true,
    data: {
      submission
    }
  });
});

// Get user's submissions
exports.getUserSubmissions = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEWritingTest.find({ user: req.user._id })
    .populate('test', 'name description')
    .sort('-completedAt');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// Get detailed results for a submission
exports.getSubmissionResults = catchAsync(async (req, res) => {
  const submission = await SubmittedPTEWritingTest.findById(req.params.id);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check if user is authorized to view results
  if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view these results', 403);
  }

  const results = await submission.getDetailedResults();

  res.status(200).json({
    success: true,
    data: {
      results
    }
  });
});

// Get all submissions (admin only)
exports.getAllSubmissions = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEWritingTest.find()
    .populate('user', 'name email')
    .populate('test', 'name')
    .sort('-completedAt');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// Grade a submission (admin only)
exports.gradeSubmission = catchAsync(async (req, res) => {
  const submission = await SubmittedPTEWritingTest.findById(req.params.id);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  await submission.gradeSubmission(req.body.sectionId, {
    criteriaScores: req.body.criteriaScores,
    feedback: req.body.feedback,
    gradedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: {
      submission
    }
  });
});

// Get test statistics (admin only)
exports.getTestStatistics = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEWritingTest.find({ test: req.params.testId });

  const statistics = {
    totalSubmissions: submissions.length,
    averageScore: submissions.reduce((sum, sub) => sum + sub.totalScore, 0) / submissions.length,
    averagePercentage: submissions.reduce((sum, sub) => sum + sub.percentage, 0) / submissions.length,
    averageTimeTaken: submissions.reduce((sum, sub) => sum + sub.timeTaken, 0) / submissions.length,
    scoreDistribution: {
      '0-25': submissions.filter(sub => sub.percentage <= 25).length,
      '26-50': submissions.filter(sub => sub.percentage > 25 && sub.percentage <= 50).length,
      '51-75': submissions.filter(sub => sub.percentage > 50 && sub.percentage <= 75).length,
      '76-100': submissions.filter(sub => sub.percentage > 75).length
    }
  };

  res.status(200).json({
    success: true,
    data: {
      statistics
    }
  });
});

// Get detailed performance metrics (admin only)
exports.getPerformanceMetrics = catchAsync(async (req, res) => {
  const submission = await SubmittedPTEWritingTest.findById(req.params.id)
    .populate({
      path: 'test',
      populate: {
        path: 'sections.section'
      }
    });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const metrics = {
    submissionId: submission._id,
    testName: submission.test.name,
    totalScore: submission.totalScore,
    maxScore: submission.maxScore,
    percentage: submission.percentage,
    timeTaken: submission.timeTaken,
    completedAt: submission.completedAt,
    status: submission.status,
    sectionMetrics: submission.submissions.map(sub => {
      const section = submission.test.sections.find(s => 
        s.section._id.toString() === sub.section.toString()
      );
      
      return {
        sectionTitle: section.section.title,
        sectionType: section.section.type,
        wordCount: sub.wordCount,
        wordLimit: section.section.wordLimit,
        timeTaken: sub.timeTaken,
        timeLimit: section.section.timeLimit * 60, // Convert to seconds
        score: sub.evaluation?.totalScore || 0,
        maxScore: section.section.totalPoints,
        criteriaScores: sub.evaluation?.criteriaScores || []
      };
    })
  };

  res.status(200).json({
    success: true,
    data: {
      metrics
    }
  });
});

// Get submission history (admin only)
exports.getSubmissionHistory = catchAsync(async (req, res) => {
  const submission = await SubmittedPTEWritingTest.findById(req.params.id)
    .populate('user', 'name email')
    .populate('test', 'name');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const history = {
    submissionId: submission._id,
    user: {
      id: submission.user._id,
      name: submission.user.name,
      email: submission.user.email
    },
    test: {
      id: submission.test._id,
      name: submission.test.name
    },
    status: submission.status,
    submittedAt: submission.createdAt,
    completedAt: submission.completedAt,
    timeTaken: submission.timeTaken,
    totalScore: submission.totalScore,
    maxScore: submission.maxScore,
    percentage: submission.percentage
  };

  res.status(200).json({
    success: true,
    data: {
      history
    }
  });
});

// Get grading statistics (admin only)
exports.getGradingStatistics = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEWritingTest.find({
    'submissions.evaluation.gradedBy': { $exists: true }
  });

  const stats = {
    totalGradedSubmissions: submissions.length,
    averageGradingTime: 0, // Calculate based on submission and grading timestamps
    graders: {},
    sectionPerformance: {}
  };

  // Calculate grader statistics
  submissions.forEach(submission => {
    submission.submissions.forEach(sub => {
      if (sub.evaluation?.gradedBy) {
        const graderId = sub.evaluation.gradedBy.toString();
        if (!stats.graders[graderId]) {
          stats.graders[graderId] = {
            totalGraded: 0,
            averageScore: 0,
            totalTime: 0
          };
        }
        stats.graders[graderId].totalGraded++;
        stats.graders[graderId].averageScore += sub.evaluation.totalScore;
      }
    });
  });

  // Calculate averages
  Object.keys(stats.graders).forEach(graderId => {
    const grader = stats.graders[graderId];
    grader.averageScore = grader.averageScore / grader.totalGraded;
  });

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
}); 