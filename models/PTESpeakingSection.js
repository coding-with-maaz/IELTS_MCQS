const mongoose = require('mongoose');

const PTESpeakingSectionSchema = new mongoose.Schema({
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
    enum: ['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'answer-short-question'],
    required: [true, 'Please specify the section type']
  },
  prompt: {
    type: String,
    required: [true, 'Please provide the speaking prompt']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    trim: true
  },
  preparationTime: {
    type: Number, // in seconds
    required: [true, 'Please specify the preparation time'],
    min: 0
  },
  speakingTime: {
    type: Number, // in seconds
    required: [true, 'Please specify the speaking time'],
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
  audioSettings: {
    volume: {
      type: Number,
      default: 1,
      min: 0,
      max: 1
    },
    playbackSpeed: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2
    }
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
PTESpeakingSectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total points before saving
PTESpeakingSectionSchema.pre('save', function(next) {
  this.totalPoints = this.criteria.reduce((total, criterion) => total + criterion.points, 0);
  next();
});

// Method to calculate score based on criteria
PTESpeakingSectionSchema.methods.calculateScore = function(evaluation) {
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

// Method to validate audio settings
PTESpeakingSectionSchema.methods.validateAudioSettings = function(settings) {
  if (settings.volume < 0 || settings.volume > 1) {
    throw new Error('Volume must be between 0 and 1');
  }
  if (settings.playbackSpeed < 0.5 || settings.playbackSpeed > 2) {
    throw new Error('Playback speed must be between 0.5 and 2');
  }
  return true;
};

const PTESpeakingSection = mongoose.model('PTESpeakingSection', PTESpeakingSectionSchema);

module.exports = PTESpeakingSection; 