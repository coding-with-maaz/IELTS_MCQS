const PTEListeningQuestion = require('../models/PTEListeningQuestion');
const { validationResult } = require('express-validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a new question
exports.createQuestion = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const question = await PTEListeningQuestion.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      question
    }
  });
});

// Get all questions
exports.getAllQuestions = catchAsync(async (req, res) => {
  const questions = await PTEListeningQuestion.find()
    .populate('section')
    .sort('order');

  res.status(200).json({
    success: true,
    count: questions.length,
    data: {
      questions
    }
  });
});

// Get a specific question
exports.getQuestion = catchAsync(async (req, res) => {
  const question = await PTEListeningQuestion.findById(req.params.id)
    .populate('section');

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      question
    }
  });
});

// Update a question
exports.updateQuestion = catchAsync(async (req, res) => {
  const question = await PTEListeningQuestion.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      question
    }
  });
});

// Delete a question
exports.deleteQuestion = catchAsync(async (req, res) => {
  const question = await PTEListeningQuestion.findById(req.params.id);

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  await question.remove();

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});

// Validate an answer
exports.validateAnswer = catchAsync(async (req, res) => {
  const question = await PTEListeningQuestion.findById(req.params.id);

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  const { answer } = req.body;
  const isCorrect = question.isAnswerCorrect(answer);

  res.status(200).json({
    success: true,
    data: {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      points: isCorrect ? question.points : 0
    }
  });
});

// Get questions by type
exports.getQuestionsByType = catchAsync(async (req, res) => {
  const questions = await PTEListeningQuestion.find({
    questionType: req.params.type
  })
    .populate('section')
    .sort('order');

  res.status(200).json({
    success: true,
    count: questions.length,
    data: {
      questions
    }
  });
});

// Get questions by difficulty
exports.getQuestionsByDifficulty = catchAsync(async (req, res) => {
  const questions = await PTEListeningQuestion.find({
    difficulty: req.params.difficulty
  })
    .populate('section')
    .sort('order');

  res.status(200).json({
    success: true,
    count: questions.length,
    data: {
      questions
    }
  });
});

// Get questions by section
exports.getQuestionsBySection = catchAsync(async (req, res) => {
  const questions = await PTEListeningQuestion.find({
    section: req.params.sectionId
  })
    .populate('section')
    .sort('order');

  res.status(200).json({
    success: true,
    count: questions.length,
    data: {
      questions
    }
  });
}); 