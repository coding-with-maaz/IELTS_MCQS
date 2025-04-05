const mongoose = require('mongoose');
const PTEListeningTest = require('../models/PTEListeningTest');
const PTEListeningSection = require('../models/PTEListeningSection');
const PTEListeningQuestion = require('../models/PTEListeningQuestion');
const SubmittedPTEListeningTest = require('../models/SubmittedPTEListeningTest');
const User = require('../models/User');

const seedPTEListeningTestData = async () => {
  try {
    // Clear existing data
    await PTEListeningTest.deleteMany({});
    await PTEListeningSection.deleteMany({});
    await PTEListeningQuestion.deleteMany({});
    await SubmittedPTEListeningTest.deleteMany({});

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run user seeder first.');
    }

    // Create sample sections first
    const sections = await PTEListeningSection.create([
      {
        sectionName: 'Climate Change Lecture',
        description: 'Listen to a lecture about climate change and its impact on global ecosystems.',
        audio: {
          url: 'https://example.com/audio/climate-change-lecture.mp3',
          duration: 180
        },
        questions: [], // Will be updated after creating questions
        questionCount: 2,
        timeLimit: 60,
        instructions: 'Listen carefully to the lecture and answer the questions that follow.',
        order: 1
      },
      {
        sectionName: 'Environmental Impact',
        description: 'Listen to a discussion about environmental impact assessment.',
        audio: {
          url: 'https://example.com/audio/environmental-impact.mp3',
          duration: 120
        },
        questions: [], // Will be updated after creating questions
        questionCount: 1,
        timeLimit: 45,
        instructions: 'Listen to the discussion and select the most appropriate summary.',
        order: 2
      }
    ]);

    // Create sample questions with section references
    const questions = await PTEListeningQuestion.create([
      {
        questionType: 'multiple_choice',
        questionText: 'What is the main topic of the lecture?',
        options: [
          { text: 'Climate change', isCorrect: true },
          { text: 'Economic growth', isCorrect: false },
          { text: 'Population growth', isCorrect: false },
          { text: 'Technological advancement', isCorrect: false }
        ],
        correctAnswer: 'Climate change',
        explanation: 'The lecture primarily discusses the impact of climate change on global ecosystems.',
        points: 2,
        audioSegment: {
          startTime: 0,
          endTime: 30
        },
        difficulty: 'medium',
        order: 1,
        section: sections[0]._id
      },
      {
        questionType: 'fill_in_blanks',
        questionText: 'The speaker mentioned that the temperature has increased by ___ degrees Celsius in the last century.',
        options: [
          { text: '1.5', isCorrect: true },
          { text: '2.0', isCorrect: false },
          { text: '0.5', isCorrect: false },
          { text: '3.0', isCorrect: false }
        ],
        correctAnswer: '1.5',
        explanation: 'The speaker clearly stated that global temperatures have risen by 1.5 degrees Celsius.',
        points: 2,
        audioSegment: {
          startTime: 30,
          endTime: 60
        },
        difficulty: 'easy',
        order: 2,
        section: sections[0]._id
      },
      {
        questionType: 'highlight_correct_summary',
        questionText: 'Which of the following best summarizes the main points of the lecture?',
        options: [
          { text: 'The lecture discussed climate change and its effects on global ecosystems.', isCorrect: true },
          { text: 'The lecture focused on economic development and technological innovation.', isCorrect: false },
          { text: 'The lecture covered population growth and urbanization.', isCorrect: false },
          { text: 'The lecture explained the history of industrial development.', isCorrect: false }
        ],
        correctAnswer: 'The lecture discussed climate change and its effects on global ecosystems.',
        explanation: 'This summary accurately captures the main points discussed in the lecture.',
        points: 3,
        audioSegment: {
          startTime: 60,
          endTime: 90
        },
        difficulty: 'hard',
        order: 3,
        section: sections[1]._id
      }
    ]);

    // Update sections with question references
    await PTEListeningSection.findByIdAndUpdate(sections[0]._id, {
      questions: [questions[0]._id, questions[1]._id]
    });
    await PTEListeningSection.findByIdAndUpdate(sections[1]._id, {
      questions: [questions[2]._id]
    });

    // Create sample test
    const test = await PTEListeningTest.create({
      title: 'PTE Academic Listening Practice Test 1',
      description: 'A comprehensive practice test for PTE Academic Listening section.',
      testType: 'PTE',
      difficulty: 'medium',
      duration: 45,
      sections: [sections[0]._id, sections[1]._id],
      createdBy: adminUser._id,
      totalQuestions: 3,
      instructions: 'This test consists of two sections. Listen carefully to the audio and answer the questions that follow.',
      isActive: true
    });

    // Create sample submissions
    const regularUser = await User.findOne({ role: 'user' });
    if (regularUser) {
      await SubmittedPTEListeningTest.create([
        {
          user: regularUser._id,
          test: test._id,
          answers: [
            {
              questionId: questions[0]._id,
              answer: 'Climate change',
              isCorrect: true,
              points: 2
            },
            {
              questionId: questions[1]._id,
              answer: '1.5',
              isCorrect: true,
              points: 2
            },
            {
              questionId: questions[2]._id,
              answer: 'The lecture discussed climate change and its effects on global ecosystems.',
              isCorrect: true,
              points: 3
            }
          ],
          score: 7,
          feedback: 'Excellent performance! You demonstrated good understanding of the main points.',
          status: 'graded',
          submittedAt: new Date(),
          gradedAt: new Date(),
          gradedBy: adminUser._id,
          completionTime: 40,
          sectionScores: [
            {
              sectionId: sections[0]._id,
              score: 4,
              feedback: 'Well done on the first section!'
            },
            {
              sectionId: sections[1]._id,
              score: 3,
              feedback: 'Good summary selection!'
            }
          ]
        }
      ]);
    }

    console.log('PTE Listening Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding PTE Listening Test data:', error);
    throw error;
  }
};

module.exports = seedPTEListeningTestData; 