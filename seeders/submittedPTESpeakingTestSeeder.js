const mongoose = require('mongoose');
const SubmittedPTESpeakingTest = require('../models/SubmittedPTESpeakingTest');
const User = require('../models/User');
const PTESpeakingTest = require('../models/PTESpeakingTest');
require('dotenv').config();

const sampleSubmissions = [
  {
    user: null, // Will be set to a regular user's ID
    test: null, // Will be set to a test's ID
    status: 'completed',
    startTime: new Date(Date.now() - 3600000), // 1 hour ago
    endTime: new Date(),
    duration: 240,
    totalScore: 85,
    sectionScores: [
      {
        sectionTitle: 'Read Aloud',
        score: 20,
        maxScore: 20,
        feedback: 'Excellent pronunciation and fluency. Maintained good pace throughout.',
        tasks: [
          {
            taskTitle: 'Read Aloud Task 1',
            score: 10,
            maxScore: 10,
            feedback: 'Clear pronunciation and appropriate intonation.',
            recordingUrl: 'https://example.com/recordings/read-aloud-1.mp3'
          },
          {
            taskTitle: 'Read Aloud Task 2',
            score: 10,
            maxScore: 10,
            feedback: 'Good pace and natural flow.',
            recordingUrl: 'https://example.com/recordings/read-aloud-2.mp3'
          }
        ]
      },
      {
        sectionTitle: 'Repeat Sentence',
        score: 8,
        maxScore: 10,
        feedback: 'Good accuracy in repeating sentences. Minor pronunciation issues.',
        tasks: [
          {
            taskTitle: 'Repeat Sentence Task 1',
            score: 4,
            maxScore: 5,
            feedback: 'Accurate repetition with slight hesitation.',
            recordingUrl: 'https://example.com/recordings/repeat-1.mp3'
          },
          {
            taskTitle: 'Repeat Sentence Task 2',
            score: 4,
            maxScore: 5,
            feedback: 'Good attempt, minor word order issue.',
            recordingUrl: 'https://example.com/recordings/repeat-2.mp3'
          }
        ]
      },
      {
        sectionTitle: 'Describe Image',
        score: 28,
        maxScore: 30,
        feedback: 'Excellent description with good use of vocabulary and structure.',
        tasks: [
          {
            taskTitle: 'Describe Image Task 1',
            score: 14,
            maxScore: 15,
            feedback: 'Well-structured description with key trends identified.',
            recordingUrl: 'https://example.com/recordings/describe-1.mp3'
          },
          {
            taskTitle: 'Describe Image Task 2',
            score: 14,
            maxScore: 15,
            feedback: 'Clear explanation of data patterns.',
            recordingUrl: 'https://example.com/recordings/describe-2.mp3'
          }
        ]
      },
      {
        sectionTitle: 'Retell Lecture',
        score: 29,
        maxScore: 30,
        feedback: 'Excellent retelling with good comprehension and organization.',
        tasks: [
          {
            taskTitle: 'Retell Lecture Task 1',
            score: 15,
            maxScore: 15,
            feedback: 'Comprehensive retelling with key points covered.',
            recordingUrl: 'https://example.com/recordings/retell-1.mp3'
          },
          {
            taskTitle: 'Retell Lecture Task 2',
            score: 14,
            maxScore: 15,
            feedback: 'Good understanding shown, minor details missed.',
            recordingUrl: 'https://example.com/recordings/retell-2.mp3'
          }
        ]
      }
    ],
    overallFeedback: 'Strong performance across all sections. Focus on improving sentence repetition accuracy and maintaining consistent pace.',
    suggestions: [
      'Practice sentence repetition with varying complexity',
      'Work on maintaining consistent speaking pace',
      'Continue building vocabulary for image description',
      'Focus on note-taking during lecture retelling'
    ]
  },
  {
    user: null, // Will be set to a regular user's ID
    test: null, // Will be set to a test's ID
    status: 'in-progress',
    startTime: new Date(Date.now() - 1800000), // 30 minutes ago
    endTime: null,
    duration: 120,
    totalScore: null,
    sectionScores: [
      {
        sectionTitle: 'Read Aloud',
        score: 15,
        maxScore: 20,
        feedback: 'Good start, needs improvement in fluency.',
        tasks: [
          {
            taskTitle: 'Read Aloud Task 1',
            score: 8,
            maxScore: 10,
            feedback: 'Clear pronunciation but needs better pacing.',
            recordingUrl: 'https://example.com/recordings/read-aloud-1-progress.mp3'
          },
          {
            taskTitle: 'Read Aloud Task 2',
            score: 7,
            maxScore: 10,
            feedback: 'Some pronunciation issues to address.',
            recordingUrl: 'https://example.com/recordings/read-aloud-2-progress.mp3'
          }
        ]
      },
      {
        sectionTitle: 'Repeat Sentence',
        score: 6,
        maxScore: 10,
        feedback: 'Needs practice with complex sentences.',
        tasks: [
          {
            taskTitle: 'Repeat Sentence Task 1',
            score: 3,
            maxScore: 5,
            feedback: 'Basic understanding shown.',
            recordingUrl: 'https://example.com/recordings/repeat-1-progress.mp3'
          },
          {
            taskTitle: 'Repeat Sentence Task 2',
            score: 3,
            maxScore: 5,
            feedback: 'Some words missed.',
            recordingUrl: 'https://example.com/recordings/repeat-2-progress.mp3'
          }
        ]
      }
    ],
    overallFeedback: 'Test in progress. Current performance shows potential but needs improvement.',
    suggestions: [
      'Practice reading aloud with a timer',
      'Work on sentence repetition exercises',
      'Focus on maintaining consistent pace',
      'Build vocabulary for better expression'
    ]
  }
];

const seedSubmittedPTESpeakingTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await SubmittedPTESpeakingTest.deleteMany({});
    console.log('Cleared existing submitted PTE Speaking tests');

    // Get a regular user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      throw new Error('No regular user found. Please run userSeeder first.');
    }

    // Get a test
    const test = await PTESpeakingTest.findOne();
    if (!test) {
      throw new Error('No PTE Speaking test found. Please run pteSpeakingTestSeeder first.');
    }

    // Create submissions with user and test references
    const submissionsWithRefs = sampleSubmissions.map(submission => ({
      ...submission,
      user: user._id,
      test: test._id
    }));

    const createdSubmissions = await SubmittedPTESpeakingTest.insertMany(submissionsWithRefs);
    console.log(`Created ${createdSubmissions.length} submitted tests`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding submitted PTE Speaking tests:', error);
    process.exit(1);
  }
};

// Run the seeder
seedSubmittedPTESpeakingTests(); 