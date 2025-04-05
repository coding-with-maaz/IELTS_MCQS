const ReadingTest = require('../models/ReadingTest');
const ReadingSection = require('../models/ReadingSection');
const ReadingQuestion = require('../models/ReadingQuestion');
const SubmittedReadingTest = require('../models/SubmittedReadingTest'); // Ensure this is imported
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure file upload
const storage = multer.diskStorage({
  destination: './uploads/answer-sheets',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isValid = /pdf/.test(file.mimetype);
    cb(null, isValid);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('answerSheet');

exports.createReadingTest = async (req, res) => {
  try {
    // Parse the sections array from the JSON string
    let sections;
    try {
      sections = JSON.parse(req.body.sections);
    } catch (error) {
      console.error('Error parsing sections:', error);
      return res.status(400).json({ message: 'Invalid sections format' });
    }
    
    // Create the test object
    const testData = {
      testName: req.body.testName,
      testType: req.body.testType,
      sections: sections,
      timeLimit: parseInt(req.body.timeLimit),
      answerSheet: req.file ? req.file.path : null,
      createdBy: req.body.createdBy
    };

    console.log('Creating test with data:', testData);

    const test = new ReadingTest(testData);
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating reading test:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateReadingTest = async (req, res) => {
  try {
    const test = await ReadingTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Reading test not found' });
    }

    // Parse the sections array if it exists
    if (req.body.sections) {
      req.body.sections = JSON.parse(req.body.sections);
    }

    // Update the test object
    Object.assign(test, req.body);
    await test.save();
    res.json(test);
  } catch (error) {
    console.error('Error updating reading test:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReadingTests = async (req, res) => {
  try {
    const tests = await ReadingTest.find()
      .populate({
        path: 'sections',
        populate: {
          path: 'questions',
          model: 'ReadingQuestion'
        }
      });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReadingTest = async (req, res) => {
  try {
    const test = await ReadingTest.findById(req.params.id)
      .populate({
        path: 'sections',
        populate: {
          path: 'questions',
          model: 'ReadingQuestion'
        }
      });
    if (!test) {
      return res.status(404).json({ message: 'Reading test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReadingTest = async (req, res) => {
  try {
    const test = await ReadingTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Reading test not found' });
    }

    // Delete sections and questions
    for (const sectionId of test.sections) {
      const section = await ReadingSection.findById(sectionId);
      if (section) {
        await Promise.all(section.questions.map(questionId => 
          ReadingQuestion.findByIdAndDelete(questionId)
        ));
        await ReadingSection.findByIdAndDelete(sectionId);
      }
    }

    await ReadingTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reading test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitReadingTest = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message });

      const { answers } = req.body;
      const test = await ReadingTest.findById(req.params.id);

      if (!test) {
        return res.status(404).json({ message: 'Reading test not found' });
      }

      // Create submission record with answers and pending status
      const submission = new SubmittedReadingTest({
        user: req.user.id,
        test: test._id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        })),
        status: 'pending',
        submittedAt: new Date(),
        answerSheet: req.file ? req.file.path : null
      });

      await submission.save();
      
      res.status(201).json({
        message: 'Test submitted successfully. Waiting for admin grading.',
        submissionId: submission._id
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { bandScore, feedback } = req.body;
    
    // Validate band score
    if (bandScore < 0 || bandScore > 9) {
      return res.status(400).json({ message: 'Band score must be between 0 and 9' });
    }

    const submission = await SubmittedReadingTest.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission with admin's grading
    submission.bandScore = bandScore;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedReadingTest.findById(req.params.id)
      .populate('user', 'name email')
      .populate('test')
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
    res.status(500).json({ message: error.message });
  }
};