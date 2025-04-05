const WritingQuestion = require('../models/WritingQuestion');
const fs = require('fs');
const path = require('path');

// Create Writing Question
exports.createWritingQuestion = async (req, res) => {
  try {
    // Handle diagram upload if present
    let diagramUrl = null;
    if (req.file) {
      diagramUrl = `/uploads/diagrams/${req.file.filename}`;
    }

    const writingQuestion = new WritingQuestion({
      ...req.body,
      diagramUrl,
    });

    await writingQuestion.save();
    res.status(201).json(writingQuestion);
  } catch (error) {
    // Clean up uploaded file if question creation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

// Update Writing Question Diagram
exports.updateWritingQuestionDiagram = async (req, res) => {
  try {
    const writingQuestion = await WritingQuestion.findById(req.params.id);
    if (!writingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Delete old diagram file if it exists
    if (writingQuestion.diagramUrl) {
      const oldPath = path.join(__dirname, '..', writingQuestion.diagramUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update with new diagram
    if (req.file) {
      writingQuestion.diagramUrl = `/uploads/diagrams/${req.file.filename}`;
      await writingQuestion.save();
    }

    res.json(writingQuestion);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Get All Writing Questions
exports.getAllWritingQuestions = async (req, res) => {
  try {
    const writingQuestions = await WritingQuestion.find();
    res.json(writingQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Writing Question
exports.getWritingQuestion = async (req, res) => {
  try {
    const writingQuestion = await WritingQuestion.findById(req.params.id);
    if (!writingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(writingQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Writing Question
exports.deleteWritingQuestion = async (req, res) => {
  try {
    const writingQuestion = await WritingQuestion.findById(req.params.id);
    if (!writingQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Delete associated diagram file if it exists
    if (writingQuestion.diagramUrl) {
      const filePath = path.join(__dirname, '..', writingQuestion.diagramUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await WritingQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Writing question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
