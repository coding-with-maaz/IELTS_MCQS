const ListeningTest = require('../models/ListeningTest');
const Section = require('../models/Section');
const SubmittedListeningTest = require('../models/SubmittedListeningTest');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create Test
exports.createTest = catchAsync(async (req, res) => {
  const test = await ListeningTest.create({
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

// Update Test
exports.updateTest = catchAsync(async (req, res) => {
  const test = await ListeningTest.findByIdAndUpdate(
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

// Get all tests
exports.getAllTests = catchAsync(async (req, res) => {
  const tests = await ListeningTest.find().populate('sections');
  
  res.status(200).json({
    success: true,
    data: {
      tests
    }
  });
});

// Get specific test by ID
exports.getTest = catchAsync(async (req, res) => {
  const test = await ListeningTest.findById(req.params.id)
    .populate({
      path: 'sections',
      populate: {
        path: 'questions',
        model: 'Question'
      },
      select: 'sectionName description audio pdf questions createdAt updatedAt'
    });
  
  if (!test) {
    throw new AppError('Test not found', 404);
  }

  // Calculate total questions
  const totalQuestions = test.sections.reduce((total, section) => total + section.questions.length, 0);
  
  const testData = {
    ...test.toObject(),
    totalQuestions,
    sectionsData: test.sections.map(section => ({
      _id: section._id,
      sectionName: section.sectionName,
      description: section.description,
      audio: section.audio,
      pdf: section.pdf,
      questionCount: section.questions.length,
      questions: section.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        answerType: q.answerType,
        instructions: q.instructions
      }))
    }))
  };

  res.status(200).json({
    success: true,
    data: {
      test: testData
    }
  });
});

// Delete test
exports.deleteTest = catchAsync(async (req, res) => {
  const test = await ListeningTest.findByIdAndDelete(req.params.id);
  
  if (!test) {
    throw new AppError('Test not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Test deleted successfully'
  });
});

// Get all submitted tests (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedListeningTest.find()
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
};

// Get submissions for a specific test (admin only)
exports.getTestSubmissions = async (req, res) => {
  try {
    const { testId } = req.params;
    const submissions = await SubmittedListeningTest.find({ test: testId })
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get test submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching test submissions'
    });
  }
};

// Get a specific submission (admin only)
exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await SubmittedListeningTest.findById(submissionId)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        populate: {
          path: 'sections',
          populate: { path: 'questions' }
        }
      })
      .populate('gradedBy', 'name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    });
  }
};

// Grade a submission (admin only)
exports.gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }

    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await SubmittedListeningTest.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'This submission has already been graded'
      });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;

    await submission.save();

    const gradedSubmission = await SubmittedListeningTest.findById(submissionId)
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name');

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission: gradedSubmission }
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while grading submission'
    });
  }
};

// Add a section to a test
exports.addSection = catchAsync(async (req, res) => {
  const test = await ListeningTest.findById(req.params.testId);
  
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
  const test = await ListeningTest.findById(req.params.testId);
  
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
  const test = await ListeningTest.findById(req.params.testId);
  
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