const SubmittedPTEListeningTest = require('../models/SubmittedPTEListeningTest');
const PTEListeningTest = require('../models/PTEListeningTest');
const PTEListeningQuestion = require('../models/PTEListeningQuestion');
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

  const { testId, answers, completionTime } = req.body;

  // Check if test exists
  const test = await PTEListeningTest.findById(testId);
  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Validate and process answers
  const processedAnswers = await Promise.all(
    answers.map(async (answer) => {
      const question = await PTEListeningQuestion.findById(answer.questionId);
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 404);
      }

      const isCorrect = question.isAnswerCorrect(answer.answer);
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    })
  );

  // Calculate section scores
  const sectionScores = await Promise.all(
    test.sections.map(async (sectionId) => {
      const sectionAnswers = processedAnswers.filter(answer => {
        const question = answers.find(q => q.questionId.toString() === answer.questionId.toString());
        return question && question.sectionId === sectionId;
      });

      const sectionScore = sectionAnswers.reduce((total, answer) => total + answer.points, 0);
      return {
        sectionId,
        score: sectionScore,
        feedback: ''
      };
    })
  );

  // Create submission
  const submission = await SubmittedPTEListeningTest.create({
    user: req.user._id,
    test: testId,
    answers: processedAnswers,
    completionTime,
    sectionScores,
    score: processedAnswers.reduce((total, answer) => total + answer.points, 0)
  });

  res.status(201).json({
    success: true,
    data: {
      submission
    }
  });
});

// Get all submissions (admin only)
exports.getAllSubmissions = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEListeningTest.find()
    .populate('user', 'name email')
    .populate('test', 'title')
    .populate('gradedBy', 'name')
    .sort('-submittedAt');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: {
      submissions
    }
  });
});

// Get user's submissions
exports.getUserSubmissions = catchAsync(async (req, res) => {
  const submissions = await SubmittedPTEListeningTest.find({ user: req.user._id })
    .populate('test', 'title')
    .populate('gradedBy', 'name')
    .sort('-submittedAt');

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
  const submission = await SubmittedPTEListeningTest.findById(req.params.id)
    .populate('user', 'name email')
    .populate('test', 'title')
    .populate('gradedBy', 'name');

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check if user has permission to view this submission
  if (submission.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this submission', 403);
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

  const { grade, feedback, sectionScores } = req.body;
  const submission = await SubmittedPTEListeningTest.findById(req.params.id);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  if (submission.status === 'graded') {
    throw new AppError('This submission has already been graded', 400);
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.sectionScores = sectionScores;
  submission.status = 'graded';
  submission.gradedAt = Date.now();
  submission.gradedBy = req.user._id;

  await submission.save();

  const gradedSubmission = await SubmittedPTEListeningTest.findById(req.params.id)
    .populate('user', 'name email')
    .populate('test', 'title')
    .populate('gradedBy', 'name');

  res.status(200).json({
    success: true,
    data: {
      submission: gradedSubmission
    }
  });
});

// Get submission statistics (admin only)
exports.getSubmissionStats = catchAsync(async (req, res) => {
  const stats = await SubmittedPTEListeningTest.aggregate([
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        averageCompletionTime: { $avg: '$completionTime' },
        gradedSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] }
        },
        pendingSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageCompletionTime: 0,
        gradedSubmissions: 0,
        pendingSubmissions: 0
      }
    }
  });
}); 