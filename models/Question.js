const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  answerType: {
    type: String,
    required: true,
    enum: [
      'multiple-choice',
      'short-answer',
      'sentence-completion',
      'notes-completion',
      'summary-completion',
      'matching'
    ],
  },
  options: {
    type: [String],
    default: undefined
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  instructions: {
    type: String
  }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
