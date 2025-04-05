const mongoose = require('mongoose');
const SubmittedListeningTest = require('../models/SubmittedListeningTest');
const ListeningTest = require('../models/ListeningTest');
const Section = require('../models/Section');
const Question = require('../models/Question');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-test')
  .then(() => console.log('MongoDB connected for seeding submissions...'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedSubmissions() {
  try {
    // Clear existing submissions
    await SubmittedListeningTest.deleteMany({});

    // Get existing tests with populated sections
    const tests = await ListeningTest.find().populate({
      path: 'sections',
      model: 'Section',
      populate: {
        path: 'questions',
        model: 'Question'
      }
    }).exec();

    // Get users
    const users = await User.find({ role: 'user' });
    const admin = await User.findOne({ role: 'admin' });

    if (!tests.length || !users.length) {
      console.error('No tests or users found. Please seed tests and users first.');
      process.exit(1);
    }

    // Sample submissions data
    const submissionsData = [];

    // Create submissions for each user
    for (const user of users) {
      for (const test of tests) {
        // Get all questions from all sections
        const allQuestions = [];
        for (const section of test.sections) {
          if (section.questions && Array.isArray(section.questions)) {
            allQuestions.push(...section.questions);
          }
        }

        if (allQuestions.length === 0) {
          console.warn(`No questions found for test: ${test.testName}`);
          continue;
        }

        // Create a pending submission
        submissionsData.push({
          user: user._id,
          test: test._id,
          answers: allQuestions.map(question => ({
            questionId: question._id,
            answer: 'Sample answer for question'
          })),
          status: 'pending',
          submittedAt: new Date()
        });

        // Create a graded submission
        submissionsData.push({
          user: user._id,
          test: test._id,
          answers: allQuestions.map(question => ({
            questionId: question._id,
            answer: 'Sample answer for question'
          })),
          status: 'graded',
          grade: Math.floor(Math.random() * 31) + 70, // Random grade between 70-100
          feedback: 'Good attempt. Keep practicing!',
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          gradedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          gradedBy: admin._id
        });
      }
    }

    if (submissionsData.length === 0) {
      console.error('No submissions data generated. Check if tests have questions.');
      process.exit(1);
    }

    // Seed submissions
    await SubmittedListeningTest.insertMany(submissionsData);
    console.log(`${submissionsData.length} submissions seeded successfully`);

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the seeding function
seedSubmissions(); 