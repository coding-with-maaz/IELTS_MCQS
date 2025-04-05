const mongoose = require('mongoose');
const { Schema } = mongoose;

const submittedPTEListeningTestSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEListeningTest',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTEListeningQuestion',
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    min: 0,
    max: 90,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completionTime: {
    type: Number,  // in minutes
    required: true
  },
  sectionScores: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTEListeningSection'
    },
    score: {
      type: Number,
      min: 0,
      max: 90
    },
    feedback: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for questions
submittedPTEListeningTestSchema.virtual('questionDetails', {
  ref: 'PTEListeningQuestion',
  localField: 'answers.questionId',
  foreignField: '_id'
});

// Method to calculate total score
submittedPTEListeningTestSchema.methods.calculateScore = function() {
  return this.answers.reduce((total, answer) => total + answer.points, 0);
};

// Method to get detailed submission
submittedPTEListeningTestSchema.methods.getDetailedSubmission = async function() {
  await this.populate([
    {
      path: 'test',
      populate: {
        path: 'sections',
        populate: {
          path: 'questions'
        }
      }
    },
    {
      path: 'answers.questionId'
    }
  ]);
  return this;
};

const SubmittedPTEListeningTest = mongoose.model('SubmittedPTEListeningTest', submittedPTEListeningTestSchema);

module.exports = SubmittedPTEListeningTest; 