const mongoose = require('mongoose');

const submittedPTESpeakingTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTESpeakingTest',
    required: [true, 'Test ID is required']
  },
  submissions: [{
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTESpeakingSection',
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in seconds
      required: true
    },
    evaluation: {
      criteriaScores: [{
        name: String,
        score: Number,
        feedback: String
      }],
      totalScore: {
        type: Number,
        default: 0
      },
      feedback: String,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: Date
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'submitted', 'graded'],
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total score and percentage before saving
submittedPTESpeakingTestSchema.pre('save', function(next) {
  if (this.submissions.length > 0) {
    this.totalScore = this.submissions.reduce((total, submission) => {
      return total + (submission.evaluation?.totalScore || 0);
    }, 0);
    
    this.percentage = (this.totalScore / this.maxScore) * 100;
  }
  next();
});

// Method to grade a submission
submittedPTESpeakingTestSchema.methods.gradeSubmission = async function(sectionId, evaluation) {
  const submission = this.submissions.find(s => s.section.toString() === sectionId.toString());
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  const section = await mongoose.model('PTESpeakingSection').findById(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  submission.evaluation = {
    ...evaluation,
    totalScore: section.calculateScore(evaluation),
    gradedBy: evaluation.gradedBy,
    gradedAt: new Date()
  };
  
  await this.save();
};

// Method to get detailed results
submittedPTESpeakingTestSchema.methods.getDetailedResults = async function() {
  const test = await mongoose.model('PTESpeakingTest')
    .findById(this.test)
    .populate({
      path: 'sections.section'
    });

  const results = {
    testId: this.test,
    testName: test.name,
    totalScore: this.totalScore,
    maxScore: this.maxScore,
    percentage: this.percentage,
    timeTaken: this.timeTaken,
    completedAt: this.completedAt,
    status: this.status,
    sections: this.submissions.map(submission => {
      const section = test.sections.find(s => 
        s.section._id.toString() === submission.section.toString()
      );
      
      return {
        sectionId: submission.section,
        sectionTitle: section.section.title,
        sectionType: section.section.type,
        audioUrl: submission.audioUrl,
        duration: submission.duration,
        evaluation: submission.evaluation
      };
    })
  };

  return results;
};

const SubmittedPTESpeakingTest = mongoose.model('SubmittedPTESpeakingTest', submittedPTESpeakingTestSchema);

module.exports = SubmittedPTESpeakingTest; 