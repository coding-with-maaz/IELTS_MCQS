const mongoose = require('mongoose');
const { Schema } = mongoose;

const submittedWritingTestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'WritingTest',
    required: true
  },
  answers: {
    task1: {
      type: String,
      required: true
    },
    task2: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  grades: {
    taskAchievement: {
      type: Number,
      min: 0,
      max: 9
    },
    coherenceAndCohesion: {
      type: Number,
      min: 0,
      max: 9
    },
    lexicalResource: {
      type: Number,
      min: 0,
      max: 9
    },
    grammaticalRangeAndAccuracy: {
      type: Number,
      min: 0,
      max: 9
    }
  },
  feedback: {
    task1: String,
    task2: String
  },
  overallBandScore: {
    type: Number,
    min: 0,
    max: 9
  },
  completionTime: {
    type: Number
  },
  answerSheet: String,
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date
}, {
  timestamps: {
    createdAt: 'submittedAt',
    updatedAt: true
  }
});

// Add indexes for better query performance
submittedWritingTestSchema.index({ user: 1, test: 1 });
submittedWritingTestSchema.index({ status: 1 });
submittedWritingTestSchema.index({ submittedAt: -1 });

module.exports = mongoose.models.SubmittedWritingTest || mongoose.model('SubmittedWritingTest', submittedWritingTestSchema); 