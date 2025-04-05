const SubmittedReadingTest = require('../models/SubmittedReadingTest'); 
const ReadingTest = require('../models/ReadingTest');
const { validationResult } = require('express-validator');

// Submit a reading test
exports.submitTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testId, answers, completionTime } = req.body;
    const userId = req.user.id;

    // Check if test exists
    const test = await ReadingTest.findById(testId).populate({
      path: 'sections',
      populate: { path: 'questions' }
    });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has already submitted this test
    // const existingSubmission = await SubmittedReadingTest.findOne({
    //   user: userId,
    //   test: testId
    // });

    // if (existingSubmission) {
    //   return res.status(400).json({ message: 'You have already submitted this test' });
    // }

    // Create submission object without automated scores
    const submission = new SubmittedReadingTest({
      user: userId,
      test: testId,
      answers: answers,
      completionTime: completionTime,
      answerSheet: req.file ? req.file.path : null
    });

    await submission.save();

    res.status(201).json({
      message: 'Test submitted successfully',
      submission: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedReadingTest.find()
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await SubmittedReadingTest.find({ user: req.user.id })
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade a submission (admin only)
exports.gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { grade, bandScore, feedback } = req.body;
    const submissionId = req.params.submissionId;

    // Find the submission by ID without running validation
    const submission = await SubmittedReadingTest.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Validate bandScore is between 1 and 9 (allowing half bands)
    if (bandScore < 1 || bandScore > 9) {
      return res.status(400).json({ 
        message: 'Band score must be between 1 and 9' 
      });
    }

    // Round to nearest half band (e.g., 6.5, 7.0, 7.5)
    const roundedBandScore = Math.round(bandScore * 2) / 2;

    // Use updateOne instead of save() to bypass full document validation
    const result = await SubmittedReadingTest.updateOne(
      { _id: submissionId },
      { 
        $set: {
          grade: grade, // Keep original grade field for backward compatibility
          bandScore: roundedBandScore, // Store the IELTS band score (1-9)
          feedback: feedback,
          status: 'graded',
          gradedAt: Date.now(),
          gradedBy: req.user.id
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to update submission' });
    }

    // Get the updated submission
    const updatedSubmission = await SubmittedReadingTest.findById(submissionId)
      .populate('user', 'name email')
      .populate('test', 'testName testType')
      .populate('gradedBy', 'name');

    res.json({
      message: 'Submission graded successfully',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await SubmittedReadingTest.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'test',
        populate: {
          path: 'sections',
          populate: { path: 'questions' }
        }
      })
      .populate('gradedBy', 'name');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is authorized to view this submission
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// const SubmittedReadingTest = require('../models/SubmittedReadingTest'); // Ensure this is imported
// const ReadingTest = require('../models/ReadingTest');
// const { validationResult } = require('express-validator');
// const { calculateBandScore } = require('../utils/readingBandScoreCalculator');

// // Submit a reading test
// exports.submitTest = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { testId, answers, completionTime } = req.body;
//     const userId = req.user.id;

//     // Check if test exists
//     const test = await ReadingTest.findById(testId).populate({
//       path: 'sections',
//       populate: { path: 'questions' }
//     });

//     if (!test) {
//       return res.status(404).json({ message: 'Test not found' });
//     }

//     // Check if user has already submitted this test
//     // const existingSubmission = await SubmittedReadingTest.findOne({
//     //   user: userId,
//     //   test: testId
//     // });

//     // if (existingSubmission) {
//     //   return res.status(400).json({ message: 'You have already submitted this test' });
//     // }

//     // Calculate scores and create submission
//     let totalCorrect = 0;
//     let totalQuestions = 0;
//     const sectionScores = [];

//     for (const section of test.sections) {
//       let sectionCorrect = 0;
//       let sectionAttempted = 0;
//       const sectionQuestions = section.questions.length;

//       section.questions.forEach(question => {
//         const userAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
//         if (userAnswer) {
//           sectionAttempted++;
//           if (userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
//             sectionCorrect++;
//             totalCorrect++;
//           }
//         }
//       });

//       sectionScores.push({
//         sectionId: section._id,
//         score: (sectionCorrect / sectionQuestions) * 100,
//         totalQuestions: sectionQuestions,
//         correctAnswers: sectionCorrect,
//         incorrectAnswers: sectionAttempted - sectionCorrect,
//         unattempted: sectionQuestions - sectionAttempted
//       });

//       totalQuestions += sectionQuestions;
//     }

//     // Calculate band score
//     const bandScore = calculateBandScore(totalCorrect, totalQuestions, test.testType);

//     // Create submission object
//     const submission = new SubmittedReadingTest({
//       user: userId,
//       test: testId,
//       answers: answers,
//       sectionScores: sectionScores,
//       totalScore: {
//         correct: totalCorrect,
//         total: totalQuestions,
//         percentage: (totalCorrect / totalQuestions) * 100
//       },
//       bandScore: bandScore,
//       completionTime: completionTime,
//       answerSheet: req.file ? req.file.path : null,
//       improvementAreas: generateImprovementAreas(sectionScores)
//     });

//     await submission.save();

//     res.status(201).json({
//       message: 'Test submitted successfully',
//       submission: submission
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get all submissions (admin only)
// exports.getAllSubmissions = async (req, res) => {
//   try {
//     const submissions = await SubmittedReadingTest.find()
//       .populate('user', 'name email')
//       .populate('test', 'testName testType')
//       .populate('gradedBy', 'name')
//       .sort('-submittedAt');

//     res.json(submissions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get user's submissions
// exports.getUserSubmissions = async (req, res) => {
//   try {
//     const submissions = await SubmittedReadingTest.find({ user: req.user.id })
//       .populate('test', 'testName testType')
//       .populate('gradedBy', 'name')
//       .sort('-submittedAt');

//     res.json(submissions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Grade a submission (admin only)
// exports.gradeSubmission = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { grade, feedback } = req.body;
//     const submissionId = req.params.id;

//     const submission = await SubmittedReadingTest.findById(submissionId);
//     if (!submission) {
//       return res.status(404).json({ message: 'Submission not found' });
//     }

//     submission.grade = grade;
//     submission.feedback = feedback;
//     submission.status = 'graded';
//     submission.gradedAt = Date.now();
//     submission.gradedBy = req.user.id;

//     await submission.save();

//     res.json({
//       message: 'Submission graded successfully',
//       submission: submission
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get a specific submission
// exports.getSubmission = async (req, res) => {
//   try {
//     const submission = await SubmittedReadingTest.findById(req.params.id)
//       .populate('user', 'name email')
//       .populate({
//         path: 'test',
//         populate: {
//           path: 'sections',
//           populate: { path: 'questions' }
//         }
//       })
//       .populate('gradedBy', 'name');

//     if (!submission) {
//       return res.status(404).json({ message: 'Submission not found' });
//     }

//     // Check if user is authorized to view this submission
//     if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized to view this submission' });
//     }

//     res.json(submission);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Helper function to generate improvement areas based on section scores
// function generateImprovementAreas(sectionScores) {
//   const improvementAreas = [];
  
//   sectionScores.forEach(section => {
//     if (section.score < 60) {
//       improvementAreas.push(`Focus on improving Section ${section.sectionId}: ${section.correctAnswers}/${section.totalQuestions} correct`);
//     }
//     if (section.unattempted > section.totalQuestions * 0.2) {
//       improvementAreas.push(`Work on time management for Section ${section.sectionId}: ${section.unattempted} questions unattempted`);
//     }
//   });

//   return improvementAreas;
// }