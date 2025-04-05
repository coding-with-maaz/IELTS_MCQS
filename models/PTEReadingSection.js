const mongoose = require('mongoose');

const pteReadingSectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: [true, 'Please provide a section name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a section description'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Please provide reading text'],
    trim: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEReadingQuestion'
  }],
  questionCount: {
    type: Number,
    required: [true, 'Please specify number of questions'],
    min: [1, 'Question count must be at least 1']
  },
  timeLimit: {
    type: Number,
    required: [true, 'Please specify time limit in minutes'],
    min: [1, 'Time limit must be at least 1 minute']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide section instructions'],
    trim: true
  },
  order: {
    type: Number,
    required: [true, 'Please specify section order'],
    min: [1, 'Order must be at least 1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate questions
pteReadingSectionSchema.virtual('questionDetails', {
  ref: 'PTEReadingQuestion',
  localField: '_id',
  foreignField: 'section'
});

// Validate questions array
pteReadingSectionSchema.pre('save', function(next) {
  if (this.questions.length !== this.questionCount) {
    next(new Error('Number of questions must match questionCount'));
  }
  next();
});

// Method to get questions with details
pteReadingSectionSchema.methods.getQuestionsWithDetails = async function() {
  return await this.populate({
    path: 'questions',
    model: 'PTEReadingQuestion'
  });
};

// Method to reorder questions
pteReadingSectionSchema.methods.reorderQuestions = async function(questionIds) {
  if (questionIds.length !== this.questions.length) {
    throw new Error('Number of questions must match current questions count');
  }

  // Validate all question IDs exist in current questions
  const validQuestions = questionIds.every(id => 
    this.questions.some(q => q.toString() === id.toString())
  );

  if (!validQuestions) {
    throw new Error('Invalid question IDs provided');
  }

  this.questions = questionIds;
  await this.save();
};

const PTEReadingSection = mongoose.model('PTEReadingSection', pteReadingSectionSchema);

module.exports = PTEReadingSection; 