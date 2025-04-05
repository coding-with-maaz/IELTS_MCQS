const mongoose = require('mongoose');
const { Schema } = mongoose;

const listeningTestSchema = new Schema({
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
    ref: 'Section'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Method to get sections with questions
listeningTestSchema.methods.getSectionsWithQuestions = async function() {
  await this.populate({
    path: 'sections',
    populate: {
      path: 'questions',
      model: 'Question'
    }
  });
  return this.sections;
};

// Static method to find test with sections and questions
listeningTestSchema.statics.findWithSections = async function(testId) {
  return this.findById(testId)
    .populate({
      path: 'sections',
      populate: {
        path: 'questions',
        model: 'Question'
      }
    })
    .exec();
};

// Method to check if can add more sections
listeningTestSchema.methods.canAddSection = function() {
  return this.sections.length < 4;
};

// Method to check if can remove section
listeningTestSchema.methods.canRemoveSection = function() {
  return this.sections.length > 1;
};

// Middleware to validate sections count before saving
listeningTestSchema.pre('save', async function(next) {
  if (this.sections.length < 1 || this.sections.length > 4) {
    next(new Error('A listening test must have between 1 and 4 sections'));
  }
  next();
});

const ListeningTest = mongoose.model('ListeningTest', listeningTestSchema);

module.exports = ListeningTest;
