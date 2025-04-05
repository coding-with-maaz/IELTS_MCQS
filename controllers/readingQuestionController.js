const ReadingQuestion = require('../models/ReadingQuestion');
const fs = require('fs');
const path = require('path');

exports.createReadingQuestion = async (req, res) => {
  try {
    // Handle diagram upload if present
    let diagramUrl = null;
    if (req.file) {
      diagramUrl = `/uploads/diagrams/${req.file.filename}`;
    }

    const question = new ReadingQuestion({
      ...req.body,
      diagramUrl
    });
    
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    // Clean up uploaded file if question creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

exports.updateReadingQuestion = async (req, res) => {
  try {
    const question = await ReadingQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Reading question not found' });
    }

    // Update question fields
    Object.keys(req.body).forEach(key => {
      question[key] = req.body[key];
    });

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReadingQuestionDiagram = async (req, res) => {
  try {
    const question = await ReadingQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Reading question not found' });
    }

    // Delete old diagram file if it exists
    if (question.diagramUrl) {
      const oldPath = path.join(__dirname, '..', question.diagramUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update with new diagram
    if (req.file) {
      question.diagramUrl = `/uploads/diagrams/${req.file.filename}`;
      await question.save();
    }

    res.json(question);
  } catch (error) {
    // Clean up uploaded file if update fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReadingQuestions = async (req, res) => {
  try {
    const questions = await ReadingQuestion.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReadingQuestion = async (req, res) => {
  try {
    const question = await ReadingQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Reading question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReadingQuestion = async (req, res) => {
  try {
    const question = await ReadingQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Reading question not found' });
    }

    // Delete associated diagram file if it exists
    if (question.diagramUrl) {
      const filePath = path.join(__dirname, '..', question.diagramUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ReadingQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reading question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};