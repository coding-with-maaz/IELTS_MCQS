const mongoose = require('mongoose');
const { Schema } = mongoose;

const readingSectionSchema = new Schema({
  sectionName: {
    type: String,
    required: true,
  },
  passageText: {
    type: String,
    required: true
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'ReadingQuestion',
  }],
  audio: {
    type: String, // Store the file path for audio
    required: false,
  },
  image: {
    type: String, // Store the file path for image
    required: false,
  },
  pdf: {
    type: String, // Store the file path for PDF
    required: false,
  },
});

const ReadingSection = mongoose.model('ReadingSection', readingSectionSchema);

module.exports = ReadingSection;