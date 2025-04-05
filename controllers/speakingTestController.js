const SpeakingTest = require('../models/SpeakingTest');
const SubmittedSpeakingTest = require('../models/SubmittedSpeakingTest');
const fs = require('fs').promises;
const path = require('path');

// Create a new speaking test
exports.createSpeakingTest = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.body.testName || !req.body.instructions) {
      return res.status(400).json({ message: 'Required fields missing: testName and instructions are required' });
    }

    // Parse sections array if it's a string
    let sections = req.body.sections;
    if (typeof sections === 'string') {
      try {
        sections = JSON.parse(sections);
      } catch (error) {
        console.error('Error parsing sections:', error);
        return res.status(400).json({ message: 'Invalid sections format' });
      }
    }

    const audioFile = req.file;
    let audioFileData = undefined;

    // If there's an audioFile, save file info
    if (audioFile) {
      audioFileData = {
        filename: audioFile.filename,
        path: audioFile.path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: audioFile.mimetype
      };
    }

    // Create the test with processed data
    const speakingTest = new SpeakingTest({
      testName: req.body.testName,
      testType: req.body.testType || 'academic',
      sections: sections,
      timeLimit: req.body.timeLimit || 15,
      instructions: req.body.instructions,
      audioFile: audioFileData
    });

    await speakingTest.save();
    
    // Populate sections before sending response
    const populatedTest = await SpeakingTest.findById(speakingTest._id).populate('sections');
    res.status(201).json(populatedTest);
  } catch (error) {
    console.error('Error creating speaking test:', error);
    
    // Clean up the file if it exists and there's an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }
    
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Get all speaking tests
exports.getAllSpeakingTests = async (req, res) => {
  try {
    const speakingTests = await SpeakingTest.find().populate('sections');
    res.json(speakingTests);
  } catch (error) {
    console.error('Error fetching speaking tests:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Get a specific speaking test
exports.getSpeakingTest = async (req, res) => {
  try {
    const speakingTest = await SpeakingTest.findById(req.params.id).populate('sections');
    if (!speakingTest) {
      return res.status(404).json({ message: 'Speaking Test not found' });
    }
    res.json(speakingTest);
  } catch (error) {
    console.error('Error fetching speaking test:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Update a speaking test
exports.updateSpeakingTest = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update request file:', req.file);
    
    const test = await SpeakingTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Speaking Test not found' });
    }

    // Parse sections array if it's a string
    if (req.body.sections && typeof req.body.sections === 'string') {
      try {
        req.body.sections = JSON.parse(req.body.sections);
      } catch (error) {
        console.error('Error parsing sections:', error);
        return res.status(400).json({ message: 'Invalid sections format' });
      }
    }

    // Handle new audio file if provided
    if (req.file) {
      // Delete old file if it exists
      if (test.audioFile && test.audioFile.path) {
        try {
          const oldPath = path.resolve(test.audioFile.path);
          await fs.unlink(oldPath);
        } catch (error) {
          console.error('Error deleting old audio file:', error);
        }
      }

      test.audioFile = {
        filename: req.file.filename,
        path: req.file.path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: req.file.mimetype
      };
    }

    // Update other fields
    if (req.body.testName) test.testName = req.body.testName;
    if (req.body.testType) test.testType = req.body.testType;
    if (req.body.sections) test.sections = req.body.sections;
    if (req.body.timeLimit) test.timeLimit = req.body.timeLimit;
    if (req.body.instructions) test.instructions = req.body.instructions;

    const updatedTest = await test.save();
    const populatedTest = await SpeakingTest.findById(updatedTest._id).populate('sections');
    res.json(populatedTest);
  } catch (error) {
    console.error('Error updating speaking test:', error);
    
    // Clean up the file if it exists and there's an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }
    
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Delete a speaking test
exports.deleteSpeakingTest = async (req, res) => {
  try {
    const test = await SpeakingTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Speaking Test not found' });
    }

    // Delete audio file if it exists
    if (test.audioFile && test.audioFile.path) {
      try {
        const audioPath = path.resolve(test.audioFile.path);
        await fs.unlink(audioPath);
      } catch (error) {
        console.error('Error deleting audio file:', error);
      }
    }

    await test.deleteOne();
    res.json({ message: 'Speaking Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting speaking test:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Submit recording for a speaking test
exports.submitRecording = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;
    const { sectionId } = req.body;
    const recording = req.file;

    // Validate input
    if (!recording) {
      return res.status(400).json({ message: 'Recording is required' });
    }

    if (!sectionId) {
      // Delete uploaded file since section ID is missing
      if (recording.path) {
        await fs.unlink(recording.path).catch(console.error);
      }
      return res.status(400).json({ message: 'Section ID is required' });
    }

    // Check if test exists
    const test = await SpeakingTest.findById(testId).populate('sections');
    if (!test) {
      // Delete uploaded file since test doesn't exist
      if (recording.path) {
        await fs.unlink(recording.path).catch(console.error);
      }
      return res.status(404).json({ message: 'Speaking test not found' });
    }

    // Check if section belongs to test
    const sectionExists = test.sections.some(section => section._id.toString() === sectionId);
    if (!sectionExists) {
      // Delete uploaded file since section is invalid
      if (recording.path) {
        await fs.unlink(recording.path).catch(console.error);
      }
      return res.status(400).json({ message: 'Section does not belong to this test' });
    }

    // Find or create submission
    let submission = await SubmittedSpeakingTest.findOne({
      user: userId,
      test: testId,
      status: 'pending'
    });

    if (!submission) {
      submission = new SubmittedSpeakingTest({
        user: userId,
        test: testId,
        audioResponses: [],
        status: 'pending'
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

    // Add new response
    submission.audioResponses.push({
      section: sectionId,
      audioFile: {
        filename: recording.filename,
        path: recording.path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: recording.mimetype
      }
    });

    // Check if all sections have responses
    const allSectionsAnswered = test.sections.every(section => 
      submission.audioResponses.some(response => 
        response.section && response.section.toString() === section._id.toString()
      )
    );

    // If this was the last section, mark as ready for grading
    if (allSectionsAnswered) {
      submission.status = 'pending';
    }

    await submission.save();

    res.status(201).json({
      message: 'Recording submitted successfully',
      submission: submission
    });
  } catch (error) {
    console.error('Error submitting recording:', error);
    
    // Clean up the file if it exists and there's an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
    }
    
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};