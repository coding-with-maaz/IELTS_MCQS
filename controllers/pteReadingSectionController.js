const PTEReadingSection = require('../models/PTEReadingSection');
const PTEReadingQuestion = require('../models/PTEReadingQuestion');
const { validationResult } = require('express-validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new section
exports.createSection = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const section = await PTEReadingSection.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      section
    }
  });
});

// Get all sections
exports.getAllSections = catchAsync(async (req, res) => {
  const sections = await PTEReadingSection.find()
    .populate('questions')
    .sort('order');

  res.status(200).json({
    success: true,
    count: sections.length,
    data: {
      sections
    }
  });
});

// Get a specific section
exports.getSection = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.id)
    .populate('questions');

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Update a section
exports.updateSection = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  const updatedSection = await PTEReadingSection.findByIdAndUpdate(
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
      section: updatedSection
    }
  });
});

// Delete a section
exports.deleteSection = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Delete associated questions
  await PTEReadingQuestion.deleteMany({ section: section._id });

  // Delete the section
  await section.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Add question to section
exports.addQuestion = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Check if question already exists in section
  if (section.questions.includes(req.body.questionId)) {
    throw new AppError('Question already exists in this section', 400);
  }

  section.questions.push(req.body.questionId);
  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Remove question from section
exports.removeQuestion = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Check if question exists in section
  if (!section.questions.includes(req.params.questionId)) {
    throw new AppError('Question not found in this section', 404);
  }

  section.questions = section.questions.filter(
    question => question.toString() !== req.params.questionId
  );
  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Reorder questions
exports.reorderQuestions = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Validate question IDs
  const validQuestions = req.body.questionIds.every(id =>
    section.questions.some(question => question.toString() === id.toString())
  );

  if (!validQuestions) {
    throw new AppError('Invalid question IDs provided', 400);
  }

  await section.reorderQuestions(req.body.questionIds);

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Update section text
exports.updateText = catchAsync(async (req, res) => {
  const section = await PTEReadingSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  section.text = req.body.text;
  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
}); 