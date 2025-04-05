const mongoose = require('mongoose');
const { Schema } = mongoose;

const writingTestSchema = new Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['academic', 'general'],
    default: 'academic'
  },
  sections: [{
    type: Schema.Types.ObjectId,
    ref: 'WritingSection',
    required: true
  }],
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
    default: 60 // 60 minutes default
  },
  instructions: {
    type: String,
    required: true
  },
  answerSheet: {
    type: String // Path to answer sheet template
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove audioUrls as it's not needed for writing tests
writingTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WritingTest = mongoose.model('WritingTest', writingTestSchema);

module.exports = WritingTest;
