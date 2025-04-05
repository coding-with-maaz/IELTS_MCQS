const mongoose = require('mongoose');

const PTEWritingSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the section'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['summarize-written-text', 'write-essay'],
    required: [true, 'Please specify the section type']
  },
  prompt: {
    type: String,
    required: [true, 'Please provide the writing prompt']
  },
  wordLimit: {
    type: Number,
    required: [true, 'Please specify the word limit'],
    min: 1
  },
  timeLimit: {
    type: Number, // in minutes
    required: [true, 'Please specify the time limit'],
    min: 1
  },
  totalPoints: {
    type: Number,
    required: [true, 'Please specify the total points'],
    min: 1
  },
  criteria: [{
    name: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  sampleAnswer: {
    type: String,
    trim: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the updatedAt timestamp before saving
PTEWritingSectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total points before saving
PTEWritingSectionSchema.pre('save', function(next) {
  this.totalPoints = this.criteria.reduce((total, criterion) => total + criterion.points, 0);
  next();
});

// Method to calculate score based on criteria
PTEWritingSectionSchema.methods.calculateScore = function(evaluation) {
  let totalScore = 0;
  
  for (const criterion of this.criteria) {
    const criterionScore = evaluation.criteriaScores.find(
      score => score.name === criterion.name
    );
    
    if (criterionScore) {
      totalScore += Math.min(criterionScore.score, criterion.points);
    }
  }
  
  return totalScore;
};

// Method to validate word count
PTEWritingSectionSchema.methods.validateWordCount = function(text) {
  const words = text.trim().split(/\s+/);
  return words.length <= this.wordLimit;
};

const PTEWritingSection = mongoose.model('PTEWritingSection', PTEWritingSectionSchema);

module.exports = PTEWritingSection;

 