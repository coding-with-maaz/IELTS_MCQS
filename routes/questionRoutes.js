const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Routes for question operations
router.post('/', questionController.createQuestion);
router.patch('/:id', questionController.updateQuestion);  // Updated route
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
