const mongoose = require('mongoose');

const PTEWritingTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the test'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sections: [{
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTEWritingSection',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide the test duration'],
    min: 1
  },
  totalPoints: {
    type: Number,
    default: 0
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
PTEWritingTestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total points before saving
PTEWritingTestSchema.pre('save', async function(next) {
  if (this.sections.length > 0) {
    const sections = await mongoose.model('PTEWritingSection')
      .find({ _id: { $in: this.sections.map(s => s.section) } });
    
    this.totalPoints = sections.reduce((total, section) => total + section.totalPoints, 0);
  }
  next();
});

// Method to reorder sections
PTEWritingTestSchema.methods.reorderSections = async function(sectionIds) {
  this.sections = sectionIds.map((id, index) => ({
    section: id,
    order: index
  }));
  await this.save();
};

// Static method to get next order number
PTEWritingTestSchema.statics.getNextOrder = async function() {
  const lastTest = await this.findOne().sort('-order');
  return lastTest ? lastTest.order + 1 : 1;
};

const PTEWritingTest = mongoose.model('PTEWritingTest', PTEWritingTestSchema);

module.exports = PTEWritingTest; 