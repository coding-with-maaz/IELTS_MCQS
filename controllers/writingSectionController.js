const WritingSection = require('../models/WritingSection');
const path = require('path');
const fs = require('fs');

// Create a new writing section
exports.createWritingSection = async (req, res) => {
  try {
    // Get the uploaded files
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    console.log('Request Body:', req.body);  // Log the incoming request body
    
    if (!req.body.questions) {
      return res.status(400).json({ message: "Questions are required." });
    }

    let questions;
    try {
      questions = Array.isArray(req.body.questions)
        ? req.body.questions
        : JSON.parse(req.body.questions);  // Only parse if it's a stringified JSON
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid JSON format for questions" });
    }

    const writingSection = new WritingSection({
      sectionName: req.body.sectionName,
      taskType: req.body.taskType || 'task1', // Default to task1 if not provided
      instructions: req.body.instructions,
      questions: questions,
      minimumWords: req.body.minimumWords || (req.body.taskType === 'task2' ? 250 : 150),
      timeLimit: req.body.timeLimit || (req.body.taskType === 'task2' ? 40 : 20),
      image: image,
      pdf: pdf,
    });

    await writingSection.save();
    res.status(201).json(writingSection);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all writing sections
exports.getAllWritingSections = async (req, res) => {
  try {
    const writingSections = await WritingSection.find().populate('questions');
    res.json(writingSections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific writing section by ID
exports.getWritingSection = async (req, res) => {
  try {
    const writingSection = await WritingSection.findById(req.params.id).populate('questions');
    if (!writingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(writingSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a writing section by ID
exports.updateWritingSection = async (req, res) => {
  try {
    // Get the uploaded files (audio, image, pdf), if any
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    const updatedSection = await WritingSection.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        audio: audio || req.body.audio,
        image: image || req.body.image,
        pdf: pdf || req.body.pdf,
      },
      { new: true, runValidators: true } // Ensure it returns the updated document
    );
    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a writing section by ID
exports.deleteWritingSection = async (req, res) => {
  try {
    const section = await WritingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete the associated files (audio, image, pdf) from the file system
    if (section.audio) {
      const audioPath = path.join(__dirname, '..', section.audio);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath); // Delete audio file
        console.log('Audio file deleted:', audioPath);
      }
    }
    if (section.image) {
      const imagePath = path.join(__dirname, '..', section.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete image file
        console.log('Image file deleted:', imagePath);
      }
    }
    if (section.pdf) {
      const pdfPath = path.join(__dirname, '..', section.pdf);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath); // Delete PDF file
        console.log('PDF file deleted:', pdfPath);
      }
    }

    // Delete the section from the database
    await WritingSection.findByIdAndDelete(req.params.id);
    res.status(204).send(); // No content to return on successful deletion
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: error.message });
  }
};