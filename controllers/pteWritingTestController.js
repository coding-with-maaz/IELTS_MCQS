const PTEWritingTest = require('../models/PTEWritingTest');
const PTEWritingSection = require('../models/PTEWritingSection');
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

  const test = await PTEWritingTest.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      test
    }
  });
});

// Get all tests
exports.getAllTests = catchAsync(async (req, res) => {
  const tests = await PTEWritingTest.find()
    .populate({
      path: 'sections.section',
      select: 'title type wordLimit timeLimit totalPoints'
    })
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
  const test = await PTEWritingTest.findById(req.params.id)
    .populate({
      path: 'sections.section',
      select: 'title description type prompt wordLimit timeLimit totalPoints criteria sampleAnswer'
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
  const test = await PTEWritingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  const updatedTest = await PTEWritingTest.findByIdAndUpdate(
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
  const test = await PTEWritingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  await test.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Add section to test
exports.addSection = catchAsync(async (req, res) => {
  const test = await PTEWritingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  const section = await PTEWritingSection.findById(req.body.sectionId);
  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Check if section already exists in test
  if (test.sections.some(s => s.section.toString() === req.body.sectionId)) {
    throw new AppError('Section already exists in this test', 400);
  }

  test.sections.push({
    section: req.body.sectionId,
    order: req.body.order
  });

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
  const test = await PTEWritingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  test.sections = test.sections.filter(
    section => section.section.toString() !== req.params.sectionId
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
  const test = await PTEWritingTest.findById(req.params.id);

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  await test.reorderSections(req.body.sectionIds);

  res.status(200).json({
    success: true,
    data: {
      test
    }
  });
});

// Get test preview
exports.getTestPreview = catchAsync(async (req, res) => {
  const test = await PTEWritingTest.findById(req.params.id)
    .populate({
      path: 'sections.section',
      select: 'title description type prompt wordLimit timeLimit totalPoints criteria'
    });

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  const preview = {
    testId: test._id,
    name: test.name,
    description: test.description,
    duration: test.duration,
    totalPoints: test.totalPoints,
    sections: test.sections.map(section => ({
      sectionId: section.section._id,
      title: section.section.title,
      type: section.section.type,
      wordLimit: section.section.wordLimit,
      timeLimit: section.section.timeLimit,
      totalPoints: section.section.totalPoints,
      criteria: section.section.criteria
    }))
  };

  res.status(200).json({
    success: true,
    data: {
      preview
    }
  });
});

// Get test analytics
exports.getTestAnalytics = catchAsync(async (req, res) => {
  const test = await PTEWritingTest.findById(req.params.id)
    .populate({
      path: 'sections.section',
      select: 'title type totalPoints'
    });

  if (!test) {
    throw new AppError('Test not found', 404);
  }

  const analytics = {
    testId: test._id,
    name: test.name,
    totalSubmissions: 0,
    averageScore: 0,
    averageTimeTaken: 0,
    sectionPerformance: test.sections.map(section => ({
      sectionId: section.section._id,
      title: section.section.title,
      type: section.section.type,
      totalPoints: section.section.totalPoints,
      averageScore: 0,
      completionRate: 0
    }))
  };

  res.status(200).json({
    success: true,
    data: {
      analytics
    }
  });
}); 