const mongoose = require('mongoose');
const { Schema } = mongoose;

const pteListeningTestSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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
    required: [true, 'Difficulty level is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEListeningSection'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  instructions: {
    type: String,
    required: true
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

// Virtual populate for submitted tests
pteListeningTestSchema.virtual('submissions', {
  ref: 'SubmittedPTEListeningTest',
  localField: '_id',
  foreignField: 'test'
});

// Method to get sections with questions
pteListeningTestSchema.methods.getSectionsWithQuestions = async function() {
  await this.populate({
    path: 'sections',
    populate: {
      path: 'questions',
      model: 'PTEListeningQuestion'
    }
  });
  return this.sections;
};

// Static method to find test with sections and questions
pteListeningTestSchema.statics.findWithSections = async function(testId) {
  return this.findById(testId)
    .populate({
      path: 'sections',
      populate: {
        path: 'questions',
        model: 'PTEListeningQuestion'
      }
    })
    .exec();
};

// Middleware to validate sections count before saving
pteListeningTestSchema.pre('save', async function(next) {
  if (this.sections.length < 1 || this.sections.length > 4) {
    next(new Error('A PTE listening test must have between 1 and 4 sections'));
  }
  next();
});

const PTEListeningTest = mongoose.model('PTEListeningTest', pteListeningTestSchema);

module.exports = PTEListeningTest; 