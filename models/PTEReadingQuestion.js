const mongoose = require('mongoose');

const pteReadingQuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ['multiple_choice', 'fill_in_blanks', 'reorder_paragraphs'],
    required: [true, 'Please specify question type']
  },
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Please provide option text'],
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Please provide correct answer'],
    trim: true
  },
  explanation: {
    type: String,
    required: [true, 'Please provide answer explanation'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Please specify points for correct answer'],
    min: [1, 'Points must be at least 1']
  },
  textSegment: {
    startIndex: {
      type: Number,
      required: [true, 'Please specify start index of text segment']
    },
    endIndex: {
      type: Number,
      required: [true, 'Please specify end index of text segment']
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Please specify question difficulty']
  },
  order: {
    type: Number,
    required: [true, 'Please specify question order'],
    min: [1, 'Order must be at least 1']
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEReadingSection',
    required: [true, 'Question must belong to a section']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validate options based on question type
pteReadingQuestionSchema.pre('save', function(next) {
  if (this.questionType === 'multiple_choice' && this.options.length < 4) {
    next(new Error('Multiple choice questions must have at least 4 options'));
  }
  if (this.questionType === 'fill_in_blanks' && this.options.length < 3) {
    next(new Error('Fill in the blanks questions must have at least 3 options'));
  }
  if (this.questionType === 'reorder_paragraphs' && this.options.length < 3) {
    next(new Error('Reorder paragraphs questions must have at least 3 options'));
  }
  next();
});

// Method to check if answer is correct
pteReadingQuestionSchema.methods.isAnswerCorrect = function(userAnswer) {
  if (this.questionType === 'multiple_choice') {
    return userAnswer === this.correctAnswer;
  } else if (this.questionType === 'fill_in_blanks') {
    return userAnswer === this.correctAnswer;
  } else if (this.questionType === 'reorder_paragraphs') {
    // For reorder paragraphs, compare arrays
    return JSON.stringify(userAnswer) === JSON.stringify(this.correctAnswer);
  }
  return false;
};

// Method to get question with text segment
pteReadingQuestionSchema.methods.getQuestionWithText = async function() {
  const section = await mongoose.model('PTEReadingSection').findById(this.section);
  if (!section) {
    throw new Error('Section not found');
  }

  const textSegment = section.text.substring(this.textSegment.startIndex, this.textSegment.endIndex);
  return {
    ...this.toObject(),
    textSegment
  };
};

const PTEReadingQuestion = mongoose.model('PTEReadingQuestion', pteReadingQuestionSchema);

module.exports = PTEReadingQuestion; 