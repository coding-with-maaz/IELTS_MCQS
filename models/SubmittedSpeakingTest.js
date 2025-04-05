const mongoose = require('mongoose');
const { Schema } = mongoose;

const submittedSpeakingTestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: 'SpeakingTest',
    required: true
  },
  audioResponses: [{
    section: {
      type: Schema.Types.ObjectId,
      ref: 'SpeakingSection'
    },
    audioFile: {
      filename: String,
      path: String,
      mimetype: String
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  grade: {
    type: Number,
    min: 0,
    max: 9  // IELTS speaking scores are on a 0-9 band scale
  },
  feedback: {
    fluencyAndCoherence: {
      score: {
        type: Number,
        min: 0,
        max: 9
      },
      comments: String
    },
    lexicalResource: {
      score: {
        type: Number,
        min: 0,
        max: 9
      },
      comments: String
    },
    grammaticalRangeAndAccuracy: {
      score: {
        type: Number,
        min: 0,
        max: 9
      },
      comments: String
    },
    pronunciation: {
      score: {
        type: Number,
        min: 0,
        max: 9
      },
      comments: String
    }
  },
  completionTime: {
    type: Number
  },
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
submittedSpeakingTestSchema.index({ user: 1, test: 1 });
submittedSpeakingTestSchema.index({ status: 1 });
submittedSpeakingTestSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('SubmittedSpeakingTest', submittedSpeakingTestSchema); 