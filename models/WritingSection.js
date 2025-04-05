const mongoose = require('mongoose');
const { Schema } = mongoose;

const writingSectionSchema = new Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  taskType: {
    type: String,
    required: true,
    enum: ['task1', 'task2'],
    default: 'task1'
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'WritingQuestion',
    required: true
  }],
  minimumWords: {
    type: Number,
    required: true,
    default: 150 // Task 1: 150 words, Task 2: 250 words
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 20 // Task 1: 20 minutes, Task 2: 40 minutes
  },
  instructions: {
    type: String,
    required: true
  },
  pdf: {
    type: String // For charts, diagrams, or additional materials
  },
  image: {
    type: String // For visual prompts
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

// Remove audio field as it's not needed for writing tests
writingSectionSchema.pre('save', function(next) {
  // Set default values based on task type
  if (this.taskType === 'task2') {
    this.minimumWords = 250;
    this.timeLimit = 40;
  }
  this.updatedAt = Date.now();
  next();
});

const WritingSection = mongoose.model('WritingSection', writingSectionSchema);

module.exports = WritingSection;
