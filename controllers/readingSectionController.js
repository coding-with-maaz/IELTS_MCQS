const mongoose = require('mongoose');
const ReadingSection = require('../models/ReadingSection');
const ReadingQuestion = require('../models/ReadingQuestion');
const path = require('path');

exports.createReadingSection = async (req, res) => {
  try {
    // Get the uploaded files
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    // Convert questions to ObjectId type
    let questions = [];
    if (req.body.questions) {
      try {
        // Use 'new' to create ObjectId instances properly
        questions = JSON.parse(req.body.questions).map((id) => new mongoose.Types.ObjectId(id));
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        return res.status(400).json({ message: "Invalid questions format" });
      }
    }

    const section = new ReadingSection({
      sectionName: req.body.sectionName,
      passageText: req.body.passageText,
      questions: questions,  // Store as ObjectId array
      audio: audio,
      image: image,
      pdf: pdf,
    });

    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReadingSection = async (req, res) => {
  try {
    // Get the uploaded files (audio, image, pdf), if any
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    // Convert questions to ObjectId type before updating
    if (req.body.questions) {
      req.body.questions = JSON.parse(req.body.questions).map((id) => new mongoose.Types.ObjectId(id));
    }

    // Get the existing section from the database
    const section = await ReadingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Reading section not found' });
    }

    // Only update the fields that are provided in the request body or file uploads
    if (audio) {
      section.audio = audio; // Update audio if a new file is provided
    }
    if (image) {
      section.image = image; // Update image if a new file is provided
    }
    if (pdf) {
      section.pdf = pdf; // Update pdf if a new file is provided
    }

    // Update other fields that might have been modified
    section.sectionName = req.body.sectionName || section.sectionName;
    section.passageText = req.body.passageText || section.passageText;
    section.questions = req.body.questions || section.questions;

    // Save the updated section
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReadingSections = async (req, res) => {
  try {
    const sections = await ReadingSection.find().populate('questions');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReadingSection = async (req, res) => {
  try {
    const section = await ReadingSection.findById(req.params.id).populate('questions');
    if (!section) {
      return res.status(404).json({ message: 'Reading section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReadingSection = async (req, res) => {
  try {
    const section = await ReadingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Reading section not found' });
    }

    // Delete all associated questions
    for (const questionId of section.questions) {
      const question = await ReadingQuestion.findById(questionId);
      if (question) {
        await ReadingQuestion.findByIdAndDelete(questionId);
      }
    }

    // Delete files if necessary
    if (section.audio) {
      const audioPath = path.join(__dirname, '..', section.audio);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    if (section.image) {
      const imagePath = path.join(__dirname, '..', section.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    if (section.pdf) {
      const pdfPath = path.join(__dirname, '..', section.pdf);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await ReadingSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reading section and associated questions deleted successfully' });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: error.message });
  }
};
