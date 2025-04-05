const PTEReadingTest = require('../models/PTEReadingTest');
const PTEReadingSection = require('../models/PTEReadingSection');
const { validationResult } = require('express-validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new test
exports.createTest = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const test = await PTEReadingTest.create({
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

// Get all tests
exports.getAllTests = catchAsync(async (req, res) => {
  const tests = await PTEReadingTest.find()
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

// Get a specific test
exports.getTest = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.id)
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

// Update a test
exports.updateTest = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to update
  if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this test', 403);
  }

  const updatedTest = await PTEReadingTest.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: {
      test: updatedTest
    }
  });
});

// Delete a test
exports.deleteTest = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to delete
  if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this test', 403);
  }

  // Delete associated sections
  await PTEReadingSection.deleteMany({ _id: { $in: test.sections } });

  // Delete the test
  await test.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Add section to test
exports.addSection = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to add section
  if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to add section to this test', 403);
  }

  // Check if section already exists in test
  if (test.sections.includes(req.body.sectionId)) {
    throw new AppError('Section already exists in this test', 400);
  }

  test.sections.push(req.body.sectionId);
  await test.save();

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Remove section from test
exports.removeSection = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to remove section
  if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to remove section from this test', 403);
  }

  // Check if section exists in test
  if (!test.sections.includes(req.params.sectionId)) {
    throw new AppError('Section not found in this test', 404);
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

// Reorder sections
exports.reorderSections = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.testId);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to reorder sections
  if (test.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to reorder sections in this test', 403);
  }

  // Validate section IDs
  const validSections = req.body.sectionIds.every(id =>
    test.sections.some(section => section.toString() === id.toString())
  );

  if (!validSections) {
    throw new AppError('Invalid section IDs provided', 400);
  }

  test.sections = req.body.sectionIds;
  await test.save();

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Get test statistics
exports.getTestStats = catchAsync(async (req, res) => {
  const test = await PTEReadingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Check if user is authorized to view statistics
  if (req.user.role !== 'admin') {
    throw new AppError('Not authorized to view test statistics', 403);
  }

  const stats = await test.getTestStats();

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
}); 