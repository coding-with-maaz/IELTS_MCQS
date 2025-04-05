const mongoose = require('mongoose');

const submittedPTEReadingTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submission must be associated with a user']
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEReadingTest',
    required: [true, 'Submission must be associated with a test']
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTEReadingQuestion',
      required: [true, 'Answer must be associated with a question']
    },
    answer: {
      type: String,
      required: [true, 'Please provide an answer']
    },
    isCorrect: {
      type: Boolean,
      required: [true, 'Please specify if answer is correct']
    },
    points: {
      type: Number,
      required: [true, 'Please specify points earned'],
      min: [0, 'Points cannot be negative']
    }
  }],
  score: {
    type: Number,
    required: [true, 'Please specify total score'],
    min: [0, 'Score cannot be negative'],
    max: [90, 'Score cannot exceed 90']
  },
  feedback: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completionTime: {
    type: Number,
    required: [true, 'Please specify completion time in minutes'],
    min: [1, 'Completion time must be at least 1 minute']
  },
  sectionScores: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PTEReadingSection',
      required: [true, 'Section score must be associated with a section']
    },
    score: {
      type: Number,
      required: [true, 'Please specify section score'],
      min: [0, 'Score cannot be negative']
    },
    feedback: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate questions
submittedPTEReadingTestSchema.virtual('questionDetails', {
  ref: 'PTEReadingQuestion',
  localField: 'answers.questionId',
  foreignField: '_id'
});

// Method to calculate total score
submittedPTEReadingTestSchema.methods.calculateTotalScore = function() {
  return this.answers.reduce((total, answer) => total + answer.points, 0);
};

// Method to get detailed submission
submittedPTEReadingTestSchema.methods.getDetailedSubmission = async function() {
  return await this.populate([
    {
      path: 'user',
      select: 'name email'
    },
    {
      path: 'test',
      populate: {
        path: 'sections',
        populate: {
          path: 'questions'
        }
      }
    },
    {
      path: 'answers.questionId',
      model: 'PTEReadingQuestion'
    },
    {
      path: 'gradedBy',
      select: 'name'
    }
  ]);
};

// Method to grade submission
submittedPTEReadingTestSchema.methods.gradeSubmission = async function(grade, feedback, sectionScores, gradedBy) {
  this.grade = grade;
  this.feedback = feedback;
  this.sectionScores = sectionScores;
  this.status = 'graded';
  this.gradedAt = Date.now();
  this.gradedBy = gradedBy;
  await this.save();
};

const SubmittedPTEReadingTest = mongoose.model('SubmittedPTEReadingTest', submittedPTEReadingTestSchema);

module.exports = SubmittedPTEReadingTest; 