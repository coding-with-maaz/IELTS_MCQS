const SubmittedPTESpeakingTest = require('../models/SubmittedPTESpeakingTest');
const PTESpeakingTest = require('../models/PTESpeakingTest');
const { validateObjectId } = require('../utils/validation');
const { AppError } = require('../utils/errorHandler');

// Submit a PTE Speaking test
exports.submitTest = async (req, res, next) => {
  try {
    const { testId, submissions, timeTaken } = req.body;
    validateObjectId(testId);

    // Validate test exists
    const test = await PTESpeakingTest.findById(testId)
      .populate('sections.section');
    
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Validate submissions match test sections
    if (submissions.length !== test.sections.length) {
      throw new AppError('Number of submissions does not match test sections', 400);
    }

    // Create submission
    const submittedTest = await SubmittedPTESpeakingTest.create({
      user: req.user._id,
      test: testId,
      submissions,
      timeTaken,
      maxScore: test.totalPoints,
      status: 'submitted'
    });

    res.status(201).json({
      status: 'success',
      data: submittedTest
    });
  } catch (error) {
    next(error);
  }
};

// Get user's submitted tests
exports.getUserSubmissions = async (req, res, next) => {
  try {
    const submissions = await SubmittedPTESpeakingTest.find({ user: req.user._id })
      .populate('test', 'name description')
      .sort({ completedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// Get a single submitted test
exports.getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const submission = await SubmittedPTESpeakingTest.findById(id)
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

    const detailedResults = await submission.getDetailedResults();

    res.status(200).json({
      status: 'success',
      data: detailedResults
    });
  } catch (error) {
    next(error);
  }
};

// Grade a submission (admin only)
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const { sectionId, evaluation } = req.body;

    const submission = await SubmittedPTESpeakingTest.findById(id);
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    await submission.gradeSubmission(sectionId, {
      ...evaluation,
      gradedBy: req.user._id
    });

    // Update submission status if all sections are graded
    const allSectionsGraded = submission.submissions.every(
      sub => sub.evaluation && sub.evaluation.totalScore !== undefined
    );

    if (allSectionsGraded) {
      submission.status = 'graded';
      await submission.save();
    }

    res.status(200).json({
      status: 'success',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// Get submission statistics (admin only)
exports.getSubmissionStats = async (req, res, next) => {
  try {
    const stats = await SubmittedPTESpeakingTest.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
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
            completed: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'completed'] } } } },
            in_progress: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'in_progress'] } } } },
            submitted: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'submitted'] } } } },
            graded: { $size: { $filter: { input: '$statusDistribution', as: 'status', cond: { $eq: ['$$status', 'graded'] } } } }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: stats[0] || {
        totalSubmissions: 0,
        averageScore: 0,
        averageTimeTaken: 0,
        statusDistribution: {
          completed: 0,
          in_progress: 0,
          submitted: 0,
          graded: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 