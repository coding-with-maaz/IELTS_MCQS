const mongoose = require('mongoose');
const { Schema } = mongoose;

const speakingTestSchema = new Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    enum: ['academic', 'general'],
    default: 'academic',
    required: true
  },
  sections: [{
    type: Schema.Types.ObjectId,
    ref: 'SpeakingSection',
    required: true
  }],
  timeLimit: {
    type: Number,
    default: 15, // 15 minutes for speaking test
    required: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  audioFile: {
    filename: String,
    path: String,
    mimetype: String
  }
}, {
  timestamps: true
});

const SpeakingTest = mongoose.model('SpeakingTest', speakingTestSchema);

module.exports = SpeakingTest;