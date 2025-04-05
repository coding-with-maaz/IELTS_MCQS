const mongoose = require('mongoose');
const { Schema } = mongoose;

const readingTestSchema = new Schema({
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  testType: {
    type: String,
    enum: ['academic', 'general'],
    required: [true, 'Test type is required'],
    default: 'academic'
  },
  sections: [{
    type: Schema.Types.ObjectId,
    ref: 'ReadingSection',
  }],
  timeLimit: {
    type: Number,
    default: 60, // 60 minutes
    min: [1, 'Time limit must be at least 1 minute']
  },
  answerSheet: {
    type: String,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Method to get sections with questions
readingTestSchema.methods.getSectionsWithQuestions = async function() {
  await this.populate({
    path: 'sections',
    populate: {
      path: 'questions',
      model: 'ReadingQuestion'
    }
  });
  return this.sections;
};

// Static method to find test with sections and questions
readingTestSchema.statics.findWithSections = async function(testId) {
  return this.findById(testId)
    .populate({
      path: 'sections',
      populate: {
        path: 'questions',
        model: 'ReadingQuestion'
      }
    })
    .exec();
};

module.exports = mongoose.models.ReadingTest || mongoose.model('ReadingTest', readingTestSchema);