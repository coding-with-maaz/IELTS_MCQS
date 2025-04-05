const mongoose = require('mongoose');

const speakingSectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  partType: {
    type: String,
    required: true,
    enum: ['part1', 'part2', 'part3'],
    trim: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 2
  },
  audioFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  pdf: {
    filename: String,
    path: String,
    mimetype: String
  },
  image: {
    filename: String,
    path: String,
    mimetype: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SpeakingSection', speakingSectionSchema);