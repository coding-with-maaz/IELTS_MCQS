const SubmittedSpeakingTest = require('../models/SubmittedSpeakingTest');
const SpeakingTest = require('../models/SpeakingTest');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Submit a speaking test response
exports.submitTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testId, sectionId, completionTime } = req.body;
    const userId = req.user.id;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ message: 'Audio recording is required' });
    }

    // Check if test exists
    const test = await SpeakingTest.findById(testId).populate('sections');
    if (!test) {
      return res.status(404).json({ message: 'Speaking test not found' });
    }

    // Check if the section belongs to the test
    const sectionExists = test.sections.some(section => section._id.toString() === sectionId);
    if (!sectionExists && sectionId) {
      // Delete uploaded file since section is invalid
      if (audioFile.path) {
        await fs.unlink(audioFile.path).catch(console.error);
      }
      return res.status(400).json({ message: 'Section does not belong to this test' });
    }

    // Check if user has already started this test
    let submission = await SubmittedSpeakingTest.findOne({
      user: userId,
      test: testId,
      status: 'pending'
    });

    // If no existing submission, create a new one
    if (!submission) {
      submission = new SubmittedSpeakingTest({
        user: userId,
        test: testId,
        audioResponses: [],
        completionTime: 0
      });
    }

    // Check if this section already has a response
    const existingResponseIndex = submission.audioResponses.findIndex(
      response => response.section && response.section.toString() === sectionId
    );

    // If there's an existing response, delete its audio file
    if (existingResponseIndex !== -1) {
      const existingResponse = submission.audioResponses[existingResponseIndex];
      if (existingResponse.audioFile && existingResponse.audioFile.path) {
        try {
          await fs.unlink(existingResponse.audioFile.path);
        } catch (error) {
          console.error('Error deleting existing audio file:', error);
        }
      }
      // Remove the existing response
      submission.audioResponses.splice(existingResponseIndex, 1);
    }

    // Add the new audio response
    submission.audioResponses.push({
      section: sectionId,
      audioFile: {
        filename: audioFile.filename,
        path: audioFile.path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: audioFile.mimetype
      }
    });

    // Update completion time if provided
    if (completionTime) {
      submission.completionTime = completionTime;
    }

    // Check if all sections have responses
    const allSectionsAnswered = test.sections.every(section => 
      submission.audioResponses.some(response => 
        response.section && response.section.toString() === section._id.toString()
      )
    );

    // If this was the last section or if there are no sections, mark as completed
    if (allSectionsAnswered || test.sections.length === 0) {
      submission.status = 'pending'; // Still needs grading
      submission.submittedAt = new Date();
    }

    await submission.save();

    // Populate the response with section data
    const populatedSubmission = await SubmittedSpeakingTest.findById(submission._id)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        populate: {
          path: 'sections'
        }
      })
      .populate('gradedBy', 'name')
      .populate('audioResponses.section');

    res.status(201).json({
      message: 'Speaking response submitted successfully',
      submission: populatedSubmission
    });
  } catch (error) {
    console.error(error);
    // Delete uploaded file if there was an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedSpeakingTest.find()
      .populate('user', 'name email')
      .populate('test', 'testName')
      .populate('gradedBy', 'name')
      .populate('audioResponses.section')
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
    const submissions = await SubmittedSpeakingTest.find({ user: req.user.id })
      .populate('test', 'testName')
      .populate('gradedBy', 'name')
      .populate('audioResponses.section')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedSpeakingTest.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        populate: {
          path: 'sections'
        }
      })
      .populate('gradedBy', 'name')
      .populate('audioResponses.section');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is authorized to view this submission
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
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

    const submission = await SubmittedSpeakingTest.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update grades and feedback
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

// Delete a submission
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await SubmittedSpeakingTest.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is authorized to delete this submission
    if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }

    // Delete audio files
    for (const response of submission.audioResponses) {
      if (response.audioFile && response.audioFile.path) {
        try {
          const audioPath = path.resolve(response.audioFile.path);
          await fs.unlink(audioPath);
        } catch (error) {
          console.error('Error deleting audio file:', error);
        }
      }
    }

    await submission.deleteOne();
    
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update file paths in database
exports.updateFilePaths = async (req, res) => {
  try {
    const submissions = await SubmittedSpeakingTest.find({ status: 'pending' });
    
    for (const submission of submissions) {
      let updated = false;
      
      for (const response of submission.audioResponses) {
        if (response.audioFile && response.audioFile.filename) {
          // Get the base filename without timestamp
          const baseFilename = response.audioFile.filename.split('-').slice(0, 2).join('-');
          
          // Find the most recent file with this base name
          const files = fs.readdirSync(submissionsPath);
          const matchingFiles = files.filter(f => f.startsWith(baseFilename));
          
          if (matchingFiles.length > 0) {
            // Sort by timestamp (newest first)
            matchingFiles.sort((a, b) => {
              const timestampA = parseInt(a.split('-')[2]);
              const timestampB = parseInt(b.split('-')[2]);
              return timestampB - timestampA;
            });
            
            // Use the most recent file
            const newFilename = matchingFiles[0];
            if (newFilename !== response.audioFile.filename) {
              response.audioFile.filename = newFilename;
              response.audioFile.path = path.join(submissionsPath, newFilename);
              updated = true;
            }
          }
        }
      }
      
      if (updated) {
        await submission.save();
        console.log(`Updated file paths for submission ${submission._id}`);
      }
    }
    
    res.json({ message: 'File paths updated successfully' });
  } catch (error) {
    console.error('Error updating file paths:', error);
    res.status(500).json({ message: 'Error updating file paths' });
  }
}; 