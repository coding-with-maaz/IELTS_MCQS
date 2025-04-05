const express = require('express');
const router = express.Router();
const readingQuestionController = require('../controllers/readingQuestionController');
const { diagramUpload } = require('../middleware/upload');

router.post('/', diagramUpload.single('diagram'), readingQuestionController.createReadingQuestion);
router.put('/:id', readingQuestionController.updateReadingQuestion);
router.patch('/:id/diagram', diagramUpload.single('diagram'), readingQuestionController.updateReadingQuestionDiagram);
router.get('/', readingQuestionController.getAllReadingQuestions);
router.get('/:id', readingQuestionController.getReadingQuestion);
router.delete('/:id', readingQuestionController.deleteReadingQuestion);

module.exports = router;