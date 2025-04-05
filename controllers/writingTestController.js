const WritingTest = require('../models/WritingTest');
const SubmittedWritingTest = require('../models/SubmittedWritingTest');
const { validateGrades } = require('../utils/writingBandScoreCalculator');
const fs = require('fs');
const path = require('path');

exports.createWritingTest = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Ensure required fields are present
    if (!req.body.testName || !req.body.instructions) {
      return res.status(400).json({ 
        message: "Required fields missing: testName and instructions are required" 
      });
    }

    let sections = [];
    // Parse sections if it's a string (from FormData)
    if (req.body.sections) {
      try {
        sections = typeof req.body.sections === 'string' 
          ? JSON.parse(req.body.sections) 
          : req.body.sections;
      } catch (err) {
        return res.status(400).json({ message: "Invalid sections format" });
      }
    }

    // Create the test object with all fields
    const writingTest = new WritingTest({
      testName: req.body.testName,
      testType: req.body.testType || 'academic',
      sections: sections,
      timeLimit: req.body.timeLimit || 60,
      instructions: req.body.instructions,
      answerSheet: req.file ? req.file.path : null,
    });

    await writingTest.save();
    res.status(201).json(writingTest);
  } catch (error) {
    console.error('Create writing test error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllWritingTests = async (req, res) => {
  try {
    const writingTests = await WritingTest.find().populate({
      path: 'sections',
      populate: { path: 'questions' }
    });
    res.json(writingTests);
  } catch (error) {
    console.error('Get all writing tests error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWritingTest = async (req, res) => {
  try {
    const writingTest = await WritingTest.findById(req.params.id).populate({
      path: 'sections',
      populate: { path: 'questions' }
    });
    if (!writingTest) {
      return res.status(404).json({ message: 'Writing Test not found' });
    }
    res.json(writingTest);
  } catch (error) {
    console.error('Get writing test error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWritingTest = async (req, res) => {
  try {
    const writingTest = await WritingTest.findById(req.params.id);
    if (!writingTest) {
      return res.status(404).json({ message: 'Writing Test not found' });
    }

    // Check if there are any submissions for this test
    const submissions = await SubmittedWritingTest.find({ test: req.params.id });
    if (submissions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete test with existing submissions' 
      });
    }

    // Delete answer sheet if exists
    if (writingTest.answerSheet) {
      const filePath = path.join(__dirname, '..', writingTest.answerSheet);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await WritingTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Writing test deleted successfully' });
  } catch (error) {
    console.error('Delete writing test error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.submitWritingTest = async (req, res) => {
  try {
    const { answers, completionTime } = req.body;
    const userId = req.user.id;
    const testId = req.params.id;

    // Validate test exists
    const test = await WritingTest.findById(testId).populate('sections');
    if (!test) {
      return res.status(404).json({ message: 'Writing Test not found' });
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
    if (!answers || !answers.task1 || !answers.task2) {
      return res.status(400).json({ message: 'Answers for both tasks are required' });
    }

    // Create submission
    const submission = new SubmittedWritingTest({
      user: userId,
      test: testId,
      answers: answers,
      answerSheet: req.file ? `/uploads/writing-answers/${req.file.filename}` : null
    });

    await submission.save();

    res.status(201).json({
      message: 'Test submitted successfully',
      submission: submission
    });
  } catch (error) {
    // Clean up uploaded file if submission fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Submit writing test error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Grade a submitted writing test (admin only)
exports.gradeSubmission = async (req, res) => {
  try {
    const {
      grades,
      feedback,
      overallBandScore
    } = req.body;

    const submissionId = req.params.submissionId;

    // Validate grades
    const requiredCriteria = ['taskAchievement', 'coherenceAndCohesion', 'lexicalResource', 'grammaticalRangeAndAccuracy'];
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

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedWritingTest.find()
      .populate('user', 'name email')
      .populate('test', 'testName')
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
      .populate('test', 'testName')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get submission details
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedWritingTest.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        populate: { path: 'sections' }
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
