const SubmittedWritingTest = require('../models/SubmittedWritingTest');
const WritingTest = require('../models/WritingTest');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Submit a writing test
exports.submitTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testId } = req.params;
    const { answers, completionTime } = req.body;
    const userId = req.user.id;

    // Check if test exists
    const test = await WritingTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has already submitted this test
    const existingSubmission = await SubmittedWritingTest.findOne({
      user: userId,
      test: testId
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this test' });
    }

    // Validate answers structure
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers object is required' });
    }

    if (!answers.task1 || !answers.task2) {
      return res.status(400).json({ message: 'Answers for both tasks are required' });
    }

    // Create submission object
    const submission = new SubmittedWritingTest({
      user: userId,
      test: testId,
      answers: {
        task1: answers.task1.trim(),
        task2: answers.task2.trim()
      },
      completionTime: completionTime || 0,
      status: 'pending'
    });

    await submission.save();

    res.status(201).json({
      message: 'Test submitted successfully',
      submission: await submission.populate([
        { path: 'user', select: 'name email' },
        { path: 'test', select: 'testName' }
      ])
    });
  } catch (error) {
    console.error('Submit writing test error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedWritingTest.find()
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending submissions (admin only)
exports.getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedWritingTest.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedWritingTest.find({ user: req.user.id })
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade a submission (admin only)
exports.gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      grades, 
      feedback,
      overallBandScore
    } = req.body;
    
    const submissionId = req.params.id;

    // Validate grades
    const requiredCriteria = [
      'taskAchievement', 
      'coherenceAndCohesion', 
      'lexicalResource', 
      'grammaticalRangeAndAccuracy'
    ];
    
    for (const criterion of requiredCriteria) {
      if (!grades[criterion] || grades[criterion] < 0 || grades[criterion] > 9) {
        return res.status(400).json({
          message: `${criterion} score must be between 0 and 9`
        });
      }
    }

    // Validate overall band score
    if (typeof overallBandScore !== 'number' || overallBandScore < 0 || overallBandScore > 9) {
      return res.status(400).json({
        message: 'Overall band score must be between 0 and 9'
      });
    }

    // Validate feedback
    if (!feedback || !feedback.task1 || !feedback.task2) {
      return res.status(400).json({
        message: 'Feedback for both tasks is required'
      });
    }

    const submission = await SubmittedWritingTest.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission with grades and feedback
    submission.grades = grades;
    submission.feedback = feedback;
    submission.overallBandScore = overallBandScore;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;

    await submission.save();

    res.json({
      message: 'Writing test graded successfully',
      submission: await submission.populate([
        { path: 'user', select: 'name email' },
        { path: 'test', select: 'testName' },
        { path: 'gradedBy', select: 'name' }
      ])
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedWritingTest.findById(req.params.id)
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
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is authorized to view this submission
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 