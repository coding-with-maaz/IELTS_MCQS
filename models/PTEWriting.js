const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const pteWritingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['summarize-written-text', 'write-essay'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  passage: {
    type: String,
    required: function() {
      return this.type === 'summarize-written-text';
    }
  },
  prompt: {
    type: String,
    required: function() {
      return this.type === 'write-essay';
    }
  },
  instructions: {
    type: String,
    required: [true, 'Instructions are required']
  },
  sampleAnswer: {
    type: String,
    required: [true, 'Sample answer is required']
  },
  rubric: {
    type: Map,
    of: rubricSchema,
    required: [true, 'Rubric is required']
  },
  timeLimit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute']
  },
  difficulty: {
    type: Number,
    required: [true, 'Difficulty level is required'],
    min: [1, 'Difficulty must be at least 1'],
    max: [5, 'Difficulty cannot be more than 5']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  },
  tags: [{
    type: String,
    trim: true
  }],
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
pteWritingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total possible points from rubric
pteWritingSchema.virtual('totalRubricPoints').get(function() {
  let total = 0;
  for (const [_, criteria] of this.rubric) {
    total += criteria.maxPoints;
  }
  return total;
});

// Method to validate rubric based on type
pteWritingSchema.methods.validateRubric = function() {
  const rubricEntries = Array.from(this.rubric.entries());
  
  if (this.type === 'summarize-written-text') {
    const requiredCriteria = ['contentAccuracy', 'grammarAndStructure', 'wordLimit'];
    return requiredCriteria.every(criteria => 
      rubricEntries.some(([key]) => key === criteria)
    );
  }
  
  if (this.type === 'write-essay') {
    const requiredCriteria = ['contentDevelopment', 'organization', 'grammarAndVocabulary', 'wordLimit'];
    return requiredCriteria.every(criteria => 
      rubricEntries.some(([key]) => key === criteria)
    );
  }
  
  return false;
};

// Pre-save validation
pteWritingSchema.pre('save', function(next) {
  if (!this.validateRubric()) {
    next(new Error('Invalid rubric for the specified type'));
  }
  next();
});

const PTEWriting = mongoose.model('PTEWriting', pteWritingSchema);

module.exports = PTEWriting; 