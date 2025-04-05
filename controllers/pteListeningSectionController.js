const PTEListeningSection = require('../models/PTEListeningSection');
const PTEListeningQuestion = require('../models/PTEListeningQuestion');
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

  const section = await PTEListeningSection.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      section
    }
  });
});

// Get all sections
exports.getAllSections = catchAsync(async (req, res) => {
  const sections = await PTEListeningSection.find()
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
  const section = await PTEListeningSection.findById(req.params.id)
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
  const section = await PTEListeningSection.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

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

// Delete a section
exports.deleteSection = catchAsync(async (req, res) => {
  const section = await PTEListeningSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Delete associated questions
  await PTEListeningQuestion.deleteMany({ _id: { $in: section.questions } });

  // Delete the section
  await section.remove();

  res.status(200).json({
    success: true,
    message: 'Section and associated questions deleted successfully'
  });
});

// Add a question to a section
exports.addQuestion = catchAsync(async (req, res) => {
  const section = await PTEListeningSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  if (section.questions.includes(req.params.questionId)) {
    throw new AppError('Question already exists in this section', 400);
  }

  section.questions.push(req.params.questionId);
  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Remove a question from a section
exports.removeQuestion = catchAsync(async (req, res) => {
  const section = await PTEListeningSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
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

// Reorder questions in a section
exports.reorderQuestions = catchAsync(async (req, res) => {
  const section = await PTEListeningSection.findById(req.params.sectionId);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  // Validate that all questions exist in the section
  const allQuestionsExist = req.body.questions.every(questionId =>
    section.questions.includes(questionId)
  );

  if (!allQuestionsExist) {
    throw new AppError('Invalid question ID provided', 400);
  }

  section.questions = req.body.questions;
  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
});

// Update section audio
exports.updateAudio = catchAsync(async (req, res) => {
  const section = await PTEListeningSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  section.audio = {
    url: req.file.path,
    duration: req.body.duration
  };

  await section.save();

  res.status(200).json({
    success: true,
    data: {
      section
    }
  });
}); 