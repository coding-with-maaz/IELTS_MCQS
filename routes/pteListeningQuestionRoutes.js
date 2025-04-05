const express = require('express');
const router = express.Router();
const pteListeningQuestionController = require('../controllers/pteListeningQuestionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Apply admin authorization to all routes
router.use(isAdmin);

// Create a new question
router.post('/', pteListeningQuestionController.createQuestion);

// Get all questions
router.get('/', pteListeningQuestionController.getAllQuestions);

// Get a specific question
router.get('/:id', pteListeningQuestionController.getQuestion);

// Update a question
router.put('/:id', pteListeningQuestionController.updateQuestion);

// Delete a question
router.delete('/:id', pteListeningQuestionController.deleteQuestion);

// Get questions by type
router.get('/type/:type', pteListeningQuestionController.getQuestionsByType);

// Get questions by difficulty
router.get('/difficulty/:difficulty', pteListeningQuestionController.getQuestionsByDifficulty);

// Get questions by section
router.get('/section/:sectionId', pteListeningQuestionController.getQuestionsBySection);

module.exports = router; 