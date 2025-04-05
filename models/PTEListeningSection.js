const mongoose = require('mongoose');
const { Schema } = mongoose;

const pteListeningSectionSchema = new Schema({
  sectionName: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Section description is required'],
    trim: true
  },
  audio: {
    url: {
      type: String,
      required: [true, 'Audio URL is required']
    },
    duration: {
      type: Number,
      required: [true, 'Audio duration is required']
    }
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEListeningQuestion'
  }],
  questionCount: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute']
  },
  instructions: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for questions
pteListeningSectionSchema.virtual('questionDetails', {
  ref: 'PTEListeningQuestion',
  localField: 'questions',
  foreignField: '_id'
});

// Method to get questions with details
pteListeningSectionSchema.methods.getQuestionsWithDetails = async function() {
  await this.populate('questions');
  return this.questions;
};

const PTEListeningSection = mongoose.model('PTEListeningSection', pteListeningSectionSchema);

module.exports = PTEListeningSection; 