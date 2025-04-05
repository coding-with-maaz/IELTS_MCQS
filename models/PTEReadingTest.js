const mongoose = require('mongoose');

const pteReadingTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a test description'],
    trim: true
  },
  testType: {
    type: String,
    enum: ['PTE'],
    default: 'PTE'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Please specify test difficulty']
  },
  duration: {
    type: Number,
    required: [true, 'Please specify test duration in minutes'],
    min: [1, 'Duration must be at least 1 minute']
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEReadingSection'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Please specify total number of questions'],
    min: [1, 'Total questions must be at least 1']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide test instructions'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate submissions
pteReadingTestSchema.virtual('submissions', {
  ref: 'SubmittedPTEReadingTest',
  localField: '_id',
  foreignField: 'test'
});

// Validate sections array
pteReadingTestSchema.pre('save', function(next) {
  if (this.sections.length < 1) {
    next(new Error('Test must have at least one section'));
  }
  if (this.sections.length > 4) {
    next(new Error('Test cannot have more than 4 sections'));
  }
  next();
});

// Method to get sections with questions
pteReadingTestSchema.methods.getSectionsWithQuestions = async function() {
  return await this.populate({
    path: 'sections',
    populate: {
      path: 'questions',
      model: 'PTEReadingQuestion'
    }
  });
};

// Method to get test statistics
pteReadingTestSchema.methods.getTestStats = async function() {
  const submissions = await mongoose.model('SubmittedPTEReadingTest').find({ test: this._id });
  
  return {
    totalSubmissions: submissions.length,
    averageScore: submissions.reduce((acc, sub) => acc + sub.score, 0) / (submissions.length || 1),
    highestScore: Math.max(...submissions.map(sub => sub.score), 0),
    lowestScore: Math.min(...submissions.map(sub => sub.score), 0),
    averageCompletionTime: submissions.reduce((acc, sub) => acc + sub.completionTime, 0) / (submissions.length || 1),
    gradedSubmissions: submissions.filter(sub => sub.status === 'graded').length,
    pendingSubmissions: submissions.filter(sub => sub.status === 'pending').length
  };
};

const PTEReadingTest = mongoose.model('PTEReadingTest', pteReadingTestSchema);

module.exports = PTEReadingTest; 