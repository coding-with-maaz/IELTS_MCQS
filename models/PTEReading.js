const mongoose = require('mongoose');

const pteReadingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['multiple-choice', 'fill-in-blanks', 'reorder-paragraphs', 'reading-writing-fill-in-blanks'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  passage: {
    type: String,
    required: [true, 'Reading passage is required']
  },
  questions: [{
    question: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: [{
      type: String,
      required: [true, 'Options are required']
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Correct answer is required']
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required']
    }
  }],
  difficulty: {
    type: Number,
    required: [true, 'Difficulty level is required'],
    min: [1, 'Difficulty must be at least 1'],
    max: [5, 'Difficulty cannot be more than 5']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt timestamp before saving
pteReadingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for number of questions
pteReadingSchema.virtual('numQuestions').get(function() {
  return this.questions.length;
});

// Method to calculate total possible score
pteReadingSchema.methods.calculateTotalScore = function() {
  return this.points * this.questions.length;
};

// Static method to get questions by difficulty
pteReadingSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty });
};

// Static method to get questions by type
pteReadingSchema.statics.findByType = function(type) {
  return this.find({ type });
};

// Method to validate questions based on type
pteReadingSchema.methods.validateQuestions = function() {
  const questions = this.questions;
  
  switch (this.type) {
    case 'multiple-choice':
      return questions.every(q => 
        q.options && 
        q.options.length >= 4 && 
        q.options.includes(q.correctAnswer)
      );
      
    case 'fill-in-blanks':
      return questions.every(q => 
        q.options && 
        q.options.length >= 1 && 
        q.options.includes(q.correctAnswer)
      );
      
    case 'reorder-paragraphs':
      return questions.every(q => 
        q.options && 
        q.options.length >= 2
      );
      
    case 'reading-writing-fill-in-blanks':
      return questions.every(q => 
        q.options && 
        q.options.length >= 1 && 
        q.options.includes(q.correctAnswer)
      );
      
    default:
      return false;
  }
};

// Pre-save validation
pteReadingSchema.pre('save', function(next) {
  if (!this.validateQuestions()) {
    next(new Error('Invalid question format for the specified type'));
  }
  next();
});

const PTEReading = mongoose.model('PTEReading', pteReadingSchema);

module.exports = PTEReading; 