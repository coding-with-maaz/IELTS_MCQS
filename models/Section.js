const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema({
  sectionName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
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
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
  }]
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
