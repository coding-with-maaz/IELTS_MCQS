const PTEListeningTest = require('../models/PTEListeningTest');
const PTEListeningSection = require('../models/PTEListeningSection');
const { validationResult } = require('express-validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new PTE Listening Test
exports.createTest = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const test = await PTEListeningTest.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: {
      test
    }
  });
});

// Get all PTE Listening Tests
exports.getAllTests = catchAsync(async (req, res) => {
  const tests = await PTEListeningTest.find()
    .populate('sections')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: tests.length,
    data: {
      tests
    }
  });
});

// Get a specific PTE Listening Test
exports.getTest = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.id)
    .populate({
      path: 'sections',
      populate: {
        path: 'questions'
      }
    });

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Update a PTE Listening Test
exports.updateTest = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Delete a PTE Listening Test
exports.deleteTest = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Delete associated sections
  await PTEListeningSection.deleteMany({ _id: { $in: test.sections } });

  // Delete the test
  await test.remove();

  res.status(200).json({
    success: true,
    message: 'Test and associated sections deleted successfully'
  });
});

// Add a section to a test
exports.addSection = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  if (test.sections.includes(req.params.sectionId)) {
    throw new AppError('Section already exists in this test', 400);
  }

  test.sections.push(req.params.sectionId);
  await test.save();

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Remove a section from a test
exports.removeSection = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  test.sections = test.sections.filter(
    section => section.toString() !== req.params.sectionId
  );

  await test.save();

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Reorder sections in a test
exports.reorderSections = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Validate that all sections exist in the test
  const allSectionsExist = req.body.sections.every(sectionId =>
    test.sections.includes(sectionId)
  );

  if (!allSectionsExist) {
    throw new AppError('Invalid section ID provided', 400);
  }

  test.sections = req.body.sections;
  await test.save();

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Get test statistics (admin only)
exports.getTestStats = catchAsync(async (req, res) => {
  const test = await PTEListeningTest.findById(req.params.id)
    .populate({
      path: 'submissions',
      select: 'score submittedAt'
    });

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  const stats = {
    totalSubmissions: test.submissions.length,
    averageScore: test.submissions.reduce((acc, curr) => acc + curr.score, 0) / test.submissions.length || 0,
    highestScore: Math.max(...test.submissions.map(s => s.score), 0),
    lowestScore: Math.min(...test.submissions.map(s => s.score), 0),
    submissionDates: test.submissions.map(s => s.submittedAt)
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
}); 