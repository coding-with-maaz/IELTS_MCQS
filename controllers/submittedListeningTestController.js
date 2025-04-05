const SubmittedListeningTest = require('../models/SubmittedListeningTest');
const ListeningTest = require('../models/ListeningTest');
const { validationResult } = require('express-validator');

// Submit a listening test
exports.submitTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testId, answers } = req.body;
    const userId = req.user.id;

    // Check if test exists
    const test = await ListeningTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has already submitted this test
    // const existingSubmission = await SubmittedListeningTest.findOne({
    //   user: userId,
    //   test: testId
    // });

    // if (existingSubmission) {
    //   return res.status(400).json({ message: 'You have already submitted this test' });
    // }

    const submission = new SubmittedListeningTest({
      user: userId,
      test: testId,
      answers: answers
    });

    await submission.save();

    res.status(201).json({
      message: 'Test submitted successfully',
      submission: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all submissions for admin
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedListeningTest.find()
      .populate('user', 'name email')
      .populate('test', 'title')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedListeningTest.find({ user: req.user.id })
      .populate('test', 'title')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error(error);
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

    const { grade, feedback } = req.body;
    const submissionId = req.params.id;

    const submission = await SubmittedListeningTest.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedListeningTest.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        select: 'title type sections',
        populate: {
          path: 'sections',
          select: 'sectionName description questions',
          populate: {
            path: 'questions',
            select: 'questionText'
          }
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

    // Transform the data to match the expected format
    const transformedSubmission = {
      ...submission.toObject(),
      test: {
        ...submission.test.toObject(),
        sections: submission.test.sections.map(section => ({
          _id: section._id,
          sectionName: section.sectionName,
          description: section.description,
          questions: section.questions
        }))
      }
    };

    res.json(transformedSubmission);
  } catch (error) {
    console.error('Error in getSubmission:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 