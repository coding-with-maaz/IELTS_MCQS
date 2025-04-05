const express = require('express');
const router = express.Router();
const questionController = require('../controllers/writingQuestionController');
const { diagramUpload } = require('../middleware/upload'); // Middleware for file upload

// Create a new writing question (with diagram upload)
router.post('/', diagramUpload.single('diagram'), questionController.createWritingQuestion);

// Update diagram for a specific writing question
router.patch('/:id/diagram', diagramUpload.single('diagram'), questionController.updateWritingQuestionDiagram);

// Get all writing questions
router.get('/', questionController.getAllWritingQuestions);

// Get a specific writing question by ID
router.get('/:id', questionController.getWritingQuestion);

// Delete a specific writing question by ID
router.delete('/:id', questionController.deleteWritingQuestion);

module.exports = router;
