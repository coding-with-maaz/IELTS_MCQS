const mongoose = require('mongoose');
const { Schema } = mongoose;

const writingQuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    required: true,
    enum: [
      'graph-description',
      'process-description',
      'map-description',
      'table-description',
      'diagram-description',
      'easy'
    ]
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  diagramUrl: {
    type: String,
    required: false // URL for the diagram/image is now required
  },
  wordCount: {
    type: Number,
    default: 150 // Default word count for Task 1 is 150 words
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove unused fields and update schema
writingQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WritingQuestion = mongoose.models.WritingQuestion || mongoose.model('WritingQuestion', writingQuestionSchema);

module.exports = WritingQuestion;
