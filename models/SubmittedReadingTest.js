const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
}, { _id: true });

const submittedReadingTestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'ReadingTest',
    required: true
  },
  answers: {
    type: [answerSchema],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  bandScore: {
    type: Number,
    min: 1,
    max: 9,
    // Allow half bands (e.g., 6.5)
    get: v => Math.round(v * 2) / 2,
    set: v => Math.round(v * 2) / 2
  },
  feedback: String,
  completionTime: {
    type: Number,
    required: true
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
submittedReadingTestSchema.index({ user: 1, test: 1 });
submittedReadingTestSchema.index({ status: 1 });
submittedReadingTestSchema.index({ submittedAt: -1 });

module.exports = mongoose.models.SubmittedReadingTest || mongoose.model('SubmittedReadingTest', submittedReadingTestSchema);