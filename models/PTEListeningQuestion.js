const mongoose = require('mongoose');
const { Schema } = mongoose;

const pteListeningQuestionSchema = new Schema({
  questionType: {
    type: String,
    enum: ['multiple_choice', 'fill_in_blanks', 'highlight_correct_summary', 'highlight_incorrect_words'],
    required: [true, 'Question type is required']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required']
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative']
  },
  audioSegment: {
    startTime: {
      type: Number,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Number,
      required: [true, 'End time is required']
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty level is required']
  },
  order: {
    type: Number,
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PTEListeningSection'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to check if answer is correct
pteListeningQuestionSchema.methods.isAnswerCorrect = function(userAnswer) {
  return userAnswer === this.correctAnswer;
};

// Method to get question with audio segment
pteListeningQuestionSchema.methods.getQuestionWithAudio = function() {
  return {
    ...this.toObject(),
    audioSegment: {
      startTime: this.audioSegment.startTime,
      endTime: this.audioSegment.endTime
    }
  };
};

const PTEListeningQuestion = mongoose.model('PTEListeningQuestion', pteListeningQuestionSchema);

module.exports = PTEListeningQuestion; 