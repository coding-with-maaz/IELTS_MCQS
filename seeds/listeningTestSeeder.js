const mongoose = require('mongoose');
const Question = require('../models/Question');
const Section = require('../models/Section');
const ListeningTest = require('../models/ListeningTest');
require('dotenv').config();

// Sample Questions Data
const questionsData = [
  {
    questionText: 'What is the main topic of the lecture?',
    answerType: 'multiple-choice',
    options: ['Climate Change', 'Ocean Pollution', 'Renewable Energy', 'Urban Development'],
    correctAnswer: 'Climate Change',
    instructions: 'Choose the best answer'
  },
  {
    questionText: 'When did the industrial revolution begin?',
    answerType: 'short-answer',
    correctAnswer: '18th century',
    instructions: 'Write your answer in words'
  },
  {
    questionText: 'The temperature has increased by ___ degrees in the past century.',
    answerType: 'sentence-completion',
    correctAnswer: '1.5',
    instructions: 'Fill in the gap with a number'
  },
  {
    questionText: 'Match the following effects with their causes:',
    answerType: 'matching',
    options: ['Rising sea levels', 'Extreme weather', 'Loss of biodiversity'],
    correctAnswer: 'A-1,B-2,C-3',
    instructions: 'Match the items in column A with column B'
  }
];

// Sample Sections Data
const sectionsData = [
  {
    sectionName: 'Section 1: Introduction to Climate Change',
    audio: '/uploads/audio/section1.mp3',
    pdf: '/uploads/pdf/section1.pdf'
  },
  {
    sectionName: 'Section 2: Environmental Impact',
    audio: '/uploads/audio/section2.mp3',
    image: '/uploads/images/graph1.jpg'
  },
  {
    sectionName: 'Section 3: Future Predictions',
    audio: '/uploads/audio/section3.mp3',
    pdf: '/uploads/pdf/section3.pdf'
  }
];

// Sample Tests Data
const testsData = [
  {
    testName: 'Academic Listening Test 1',
    testType: 'academic',
    totalQuestions: 40,
    duration: 30,
    instructions: 'Complete all sections within 30 minutes. Listen to each audio only once.',
    answerSheetPDF: '/uploads/answer-sheets/test1.pdf'
  },
  {
    testName: 'General Training Listening Test 1',
    testType: 'general',
    totalQuestions: 40,
    duration: 30,
    instructions: 'Complete all sections within 30 minutes. You may listen to each audio twice.',
    answerSheetPDF: '/uploads/answer-sheets/test2.pdf'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-test')
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Seeding function
async function seedDatabase() {
  try {
    // Clear existing data
    await Question.deleteMany({});
    await Section.deleteMany({});
    await ListeningTest.deleteMany({});

    // Seed questions
    const questions = await Question.insertMany(questionsData);
    console.log('Questions seeded successfully');

    // Add questions to sections
    const sectionsWithQuestions = sectionsData.map((section, index) => ({
      ...section,
      questions: questions.slice(index, index + 2).map(q => q._id) // 2 questions per section
    }));

    // Seed sections
    const sections = await Section.insertMany(sectionsWithQuestions);
    console.log('Sections seeded successfully');

    // Add sections to tests
    const testsWithSections = testsData.map(test => ({
      ...test,
      sections: sections.map(s => s._id)
    }));

    // Seed tests
    await ListeningTest.insertMany(testsWithSections);
    console.log('Tests seeded successfully');

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 